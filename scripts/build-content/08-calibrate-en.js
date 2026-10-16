/* 步骤 8：英语内容校准（data/ 只读，不碰 ja/ko）
   a. data/en/{a1,a2,b1,b2}.json 逐词判定（batch 25/请求）：释义是否是该词在此例句语境下
      最常用、准确的简体中文释义；例句译文是否准确完整。从严：义项错 / 译文错 / 漏译加戏都算 no。
   b. ok=false 汇总写出 overrides/en-calib.json（新文件，独立于 overrides/en.json，格式同构：
      {"words":{"<词形>":{"m":".."}},"examples":{"<例句>":{"tr":".."}}}）。
   c. js/data-en.js 手写课（53 课）只做 LLM 抽查，绝不改该文件；错误清单打印到控制台供人工修改。
   环境变量：LINGUA_LLM_API_KEY / LINGUA_LLM_BASE_URL / LINGUA_LLM_MODEL / LINGUA_LLM_CONCURRENCY（≤6）
   缓存：raw/build/calib-cache-en.json（按内容键缓存，重跑零成本） */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const U = require("./lib/util");
const ZH = require("./lib/zh");

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = Math.max(1, Math.min(6, parseInt(process.env.LINGUA_LLM_CONCURRENCY || "6", 10) || 6));
const BATCH = 25;

const CACHE_FILE = path.join(U.RAW, "build", "calib-cache-en.json");
const OUT_FILE = path.join(__dirname, "overrides", "en-calib.json");
const LESSON_FILE = path.join(U.ROOT, "js", "data-en.js");
const LEVELS = ["a1", "a2", "b1", "b2"];

if (!KEY) { console.error("缺少 LINGUA_LLM_API_KEY，终止。"); process.exit(1); }

/* ---------- 模型调用（带重试与严格 JSON 提取） ---------- */
let httpCalls = 0;

function extractJson(txt) {
  const s = txt.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(s); } catch (e) { /* fallthrough */ }
  const a = s.indexOf("["), b = s.lastIndexOf("]");
  if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { /* fallthrough */ } }
  const c = s.indexOf("{"), d = s.lastIndexOf("}");
  if (c >= 0 && d > c) { try { return JSON.parse(s.slice(c, d + 1)); } catch (e) { /* fallthrough */ } }
  throw new Error("无法解析 JSON: " + s.slice(0, 120));
}

async function chat(user, system, tries) {
  tries = tries || 3;
  let lastErr;
  for (let a = 0; a < tries; a++) {
    try {
      httpCalls++;
      const res = await fetch(BASE + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
        body: JSON.stringify({
          model: MODEL, temperature: 0.1,
          messages: [
            { role: "system", content: system || "你是资深双语词典审校，输出严格 JSON，不添加任何多余文字。" },
            { role: "user", content: user }
          ]
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 160));
      const data = await res.json();
      const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      return extractJson(txt);
    } catch (e) {
      lastErr = e;
      if (a < tries - 1) await new Promise(r => setTimeout(r, 1200 * (a + 1)));
    }
  }
  throw lastErr;
}

async function runPool(items, worker, conc) {
  let i = 0;
  const runners = [];
  for (let c = 0; c < conc; c++) {
    runners.push((async () => {
      for (;;) {
        const idx = i++;
        if (idx >= items.length) return;
        await worker(items[idx], idx);
      }
    })());
  }
  await Promise.all(runners);
}

function chunksOf(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/* ---------- 修正值规范化 ---------- */

/* 释义：1-2 个简体义项、每个 1-8 个汉字、无英文无标点 */
function cleanFixM(s) {
  if (typeof s !== "string") return "";
  const flat = ZH.normalizeZh(s).replace(/\s+/g, "");
  const parts = flat.split(/[；;，,、／/]+/).map(x => x.replace(/^[（）()《》「」\s]+|[。．.!！?？…~～]+$/g, "").trim()).filter(Boolean).slice(0, 2);
  const ok = parts.filter(p => /^[\u3400-\u9fff]{1,8}$/.test(p));
  return ok.join("；");
}

/* 译文：含汉字、长度合理（允许人名等拉丁字母） */
function cleanFixTr(s) {
  if (typeof s !== "string") return "";
  const t = ZH.normalizeZh(s).trim();
  if (!t || t.length > 150) return "";
  if (!/[\u4e00-\u9fff]/.test(t)) return "";
  return t;
}

/* ---------- a. 逐词判定 ---------- */

const WORD_SYS = "你是资深英汉词典审校。输出严格 JSON 数组，不添加任何多余文字。";

function calibPrompt(batch) {
  const lines = batch.map((u, i) =>
    (i + 1) + ". " + u.t + " ｜例句：" + u.ex + " ｜释义：" + (u.m || "（空）") + " ｜译文：" + (u.tr || "（空）")
  ).join("\n");
  return "对下面每行「单词 + 语境例句 + 中文释义 + 例句中文译文」逐条严格判定两项：\n" +
    "A. 释义是否是该单词在这句语境下最常用、准确的简体中文释义？（义项错、词性错、是别的词的意思、明显生僻 → 不合格）\n" +
    "B. 译文是否准确、完整、通顺？（错译、漏译、加戏、数字/人名/时态错 → 不合格）\n" +
    "判定从严：A、B 任一不合格，该行 ok=false。修正要求：\n" +
    "- 仅 A 不合格：给 fixM（1-2 个最常用简体义项，用「；」分隔，每个不超过 8 个汉字，无英文、无标点）。\n" +
    "- 仅 B 不合格：给 fixTr（忠实完整的简体中文译文）。\n" +
    "- 两者都不合格：同时给 fixM 和 fixTr。\n" +
    "- 都合格：只给 {\"i\":N,\"ok\":true}。\n" +
    "严格输出 JSON 数组，每行一个元素，如 {\"i\":1,\"ok\":true} 或 {\"i\":2,\"ok\":false,\"fixM\":\"..\",\"fixTr\":\"..\"}（哪项合格就不给哪个字段）。不要输出其它内容。\n\n" + lines;
}

async function calibrateWords(cache) {
  /* 收集（词, 例句）单元 */
  const units = [];
  const seen = new Set();
  let entries = 0;
  const uniqWords = new Set();
  for (const lv of LEVELS) {
    const d = JSON.parse(U.readText(path.join(U.DATA, "en", lv + ".json")));
    for (const un of d.units) for (const ls of (un.lessons || [])) {
      for (const v of (ls.vocab || [])) {
        entries++;
        uniqWords.add(v.t);
        const exs = Array.isArray(v.ex) ? v.ex : (v.ex ? [v.ex] : []);
        if (!exs.length) exs.push({ t: "", tr: "" });
        for (const ex of exs) {
          const k = v.t + "\u0001" + (v.m || "") + "\u0001" + (ex.t || "") + "\u0001" + (ex.tr || "");
          if (seen.has(k)) continue;
          seen.add(k);
          units.push({ k, t: v.t, m: v.m || "", ex: ex.t || "", tr: ex.tr || "" });
        }
      }
    }
  }
  U.log("[词库] 词条 " + entries + "（去重词形 " + uniqWords.size + "），待判单元 " + units.length);

  const need = units.filter(u => !(u.k in cache.units));
  U.log("[词库] 缓存命中 " + (units.length - need.length) + "，需请求 " + need.length + "（" + Math.ceil(need.length / BATCH) + " 批，并发 " + CONC + "）");

  let done = 0, failedBatches = 0;
  const batches = chunksOf(need, BATCH);
  await runPool(batches, async (batch, bi) => {
    try {
      const arr = await chat(calibPrompt(batch), WORD_SYS);
      if (!Array.isArray(arr)) throw new Error("返回不是数组");
      for (const o of arr) {
        const idx = parseInt(o.i, 10) - 1;
        if (!(idx >= 0 && idx < batch.length)) continue;
        const u = batch[idx];
        if (o.ok === true) {
          cache.units[u.k] = { ok: true };
        } else if (o.ok === false) {
          const fixM = cleanFixM(o.fixM);
          const fixTr = cleanFixTr(o.fixTr);
          const type = fixM && fixTr ? "both" : fixM ? "m" : fixTr ? "tr" : "none";
          cache.units[u.k] = { ok: false, fixM, fixTr, type };
        }
      }
      done++;
      if (done % 10 === 0 || done === batches.length) {
        U.writeJson(CACHE_FILE, cache, false);
        U.log("  词库批次 " + done + " / " + batches.length);
      }
    } catch (e) {
      failedBatches++;
      U.log("  批次 " + (bi + 1) + " 失败：" + e.message);
    }
  }, CONC);
  U.writeJson(CACHE_FILE, cache, false);
  if (failedBatches) U.log("  注意：失败批次 " + failedBatches + "（对应单元未入缓存，可重跑补判）");

  /* 统计 + 汇总修正 */
  let okUnits = 0, failUnits = 0;
  const typeCnt = { m: 0, tr: 0, both: 0, none: 0 };
  const wordsFix = {}, exFix = {};
  const judgedWords = new Set(), failWords = new Set();
  for (const u of units) {
    const r = cache.units[u.k];
    if (!r) continue;
    judgedWords.add(u.t);
    if (r.ok === true) { okUnits++; continue; }
    failUnits++;
    failWords.add(u.t);
    typeCnt[r.type] = (typeCnt[r.type] || 0) + 1;
    if (r.fixM && r.fixM !== u.m) {
      if (!wordsFix[u.t]) wordsFix[u.t] = { m: r.fixM };
      else if (wordsFix[u.t].m !== r.fixM) U.log("  [冲突] " + u.t + " 多个修正释义，保留首个：" + wordsFix[u.t].m + " / " + r.fixM);
    }
    if (r.fixTr && u.ex && r.fixTr !== u.tr) {
      if (!exFix[u.ex]) exFix[u.ex] = { tr: r.fixTr };
      else if (exFix[u.ex].tr !== r.fixTr) U.log("  [冲突] 例句多个修正译文，保留首个：" + u.ex);
    }
  }
  const stat = { entries, uniqWords: uniqWords.size, units: units.length, judgedUnits: okUnits + failUnits, okUnits, failUnits, typeCnt, failWords: failWords.size, httpCalls };
  return { stat, wordsFix, exFix };
}

/* ---------- c. 手写课抽查（只读 js/data-en.js） ---------- */

function loadCourse() {
  const code = fs.readFileSync(LESSON_FILE, "utf8");
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "data-en.js" });
  return sandbox.window.COURSES_EN;
}

function strHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function lessonDigest(ls) {
  return {
    vocab: (ls.vocab || []).map(v => ({ t: v.t, m: v.m || "", ex: typeof v.ex === "string" ? v.ex : (v.ex && v.ex[0] && v.ex[0].t) || "" })),
    listening: (ls.listening || []).map(x => ({ text: x.text || "", tr: x.tr || "", q: x.q || "", opts: x.opts || [], a: typeof x.a === "number" ? x.a : -1 }))
  };
}

const LESSON_SYS = "你是资深英语教材审校。只输出严格 JSON，不添加任何多余文字。";

function lessonPrompt(ls, dg) {
  const vocabLines = dg.vocab.map((v, i) => (i + 1) + ". " + v.t + " ｜释义：" + (v.m || "（空）") + " ｜例句：" + (v.ex || "（无）")).join("\n");
  const listenLines = dg.listening.map((x, i) =>
    (i + 1) + ". 原文：" + x.text + "\n   译文：" + (x.tr || "（空）") + "\n   题目：" + x.q + " ｜选项：" + JSON.stringify(x.opts) + " ｜正确答案序号 a=" + x.a + "（从 0 开始）"
  ).join("\n");
  return "这是一节面向中文学习者的英语课（id=" + ls.id + " " + (ls.title || "") + "）。请严格审查以下内容：\n" +
    "【词汇】逐条检查：① 中文释义是否是该词最常用、准确的简体中文释义（义项错 → 报 kind=vocab-m）；" +
    "② 例句是否有语法错误、搭配不当、明显超纲怪异（报 kind=vocab-ex，fix 给改后的句子）。\n" +
    "【听力】逐条检查：① tr 是否忠实完整翻译 text（错译/漏译/加戏 → 报 kind=listen-tr，fix 给修正译文）；" +
    "② 按 text 内容，a 指向的选项是否确实是正确答案（不一致 → 报 kind=listen-a，fix 给正确序号数字）。\n" +
    "只报确定的错误，宁缺毋滥；词汇例句没有中文译文、不在检查范围。\n" +
    "严格输出 JSON：{\"issues\":[{\"kind\":\"vocab-m|vocab-ex|listen-tr|listen-a\",\"item\":\"出错的原词或原句片段\",\"why\":\"错在哪（≤40字）\",\"fix\":\"建议改法\"}]}；无错误输出 {\"issues\":[]}。\n\n" +
    "【词汇】\n" + (vocabLines || "（无）") + "\n\n【听力】\n" + (listenLines || "（无）");
}

const KIND_LABEL = { "vocab-m": "释义", "vocab-ex": "例句", "listen-tr": "听力译文", "listen-a": "听力答案" };

async function checkLessons(cache) {
  const course = loadCourse();
  const lessons = [];
  for (const lv of (course.levels || [])) for (const un of (lv.units || [])) for (const ls of (un.lessons || [])) lessons.push(ls);
  U.log("[手写课] js/data-en.js 共 " + lessons.length + " 课");

  const todo = lessons.filter(ls => {
    const dg = lessonDigest(ls);
    const h = strHash(JSON.stringify(dg));
    const c = cache.lessons[ls.id];
    ls.__hash = h;
    ls.__digest = dg;
    return !(c && c.h === h);
  });
  U.log("[手写课] 缓存命中 " + (lessons.length - todo.length) + "，需请求 " + todo.length);

  let failed = 0;
  await runPool(todo, async (ls) => {
    try {
      const r = await chat(lessonPrompt(ls, ls.__digest), LESSON_SYS);
      const issues = Array.isArray(r && r.issues) ? r.issues : [];
      cache.lessons[ls.id] = { h: ls.__hash, issues };
      U.writeJson(CACHE_FILE, cache, false);
    } catch (e) {
      failed++;
      U.log("  课程 " + ls.id + " 审查失败：" + e.message);
    }
  }, CONC);
  if (failed) U.log("  注意：失败课程 " + failed + "（可重跑补查）");

  /* 打印问题清单 */
  let total = 0;
  const lines = [];
  for (const ls of lessons) {
    const c = cache.lessons[ls.id];
    if (!c || !Array.isArray(c.issues) || !c.issues.length) continue;
    for (const it of c.issues) {
      total++;
      lines.push("[" + ls.id + "] " + (KIND_LABEL[it.kind] || it.kind || "?") + " ｜ " + (it.item || "") + " ｜ 错: " + (it.why || "") + " ｜ 改: " + (it.fix || ""));
    }
  }
  U.log("[手写课] 发现问题 " + total + " 处：");
  for (const ln of lines) U.log("  " + ln);
  return { lessonCount: lessons.length, issues: total, list: lines };
}

/* ---------- main ---------- */

async function main() {
  U.log("== 8/8 英语内容校准（model=" + MODEL + "，只读 data/，不改 js/data-en.js）==");
  const cache = fs.existsSync(CACHE_FILE)
    ? JSON.parse(U.readText(CACHE_FILE))
    : { units: {}, lessons: {} };
  if (!cache.units) cache.units = {};
  if (!cache.lessons) cache.lessons = {};

  const words = await calibrateWords(cache);
  const lessons = await checkLessons(cache);

  const out = { words: {}, examples: {} };
  const sortKeys = o => { const r = {}; for (const k of Object.keys(o).sort()) r[k] = o[k]; return r; };
  out.words = sortKeys(words.wordsFix);
  out.examples = sortKeys(words.exFix);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");

  const t = words.stat.typeCnt;
  U.log("== 统计 ==");
  U.log("判定词形 " + words.stat.uniqWords + "，判定单元（词+例句）" + words.stat.judgedUnits + " / " + words.stat.units);
  U.log("ok=" + words.stat.okUnits + "，ok=false " + words.stat.failUnits + "（错误率 " + (100 * words.stat.failUnits / Math.max(1, words.stat.judgedUnits)).toFixed(1) + "%，涉及词形 " + words.stat.failWords + "）");
  U.log("错误类型：仅释义错 " + (t.m || 0) + "，仅译文错 " + (t.tr || 0) + "，两者 " + (t.both || 0) + "，判错但无有效修正 " + (t.none || 0));
  U.log("→ " + OUT_FILE + "：words " + Object.keys(out.words).length + " 条，examples " + Object.keys(out.examples).length + " 条");
  U.log("HTTP 调用 " + httpCalls + " 次。手写课 " + lessons.lessonCount + " 课，问题 " + lessons.issues + " 处（见上方清单）。");
}

main().catch(e => { console.error(e); process.exit(1); });
