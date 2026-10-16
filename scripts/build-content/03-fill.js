/* 步骤 3：释义纠错 / 重生（P0-1 日语、韩语全量重生；P0-2 英语离线精简）
   优先用大模型 API（并发 5–10，key 只读环境变量）；无 key 时保留离线清洗结果。
   用法：node 03-fill.js [en ja ko] [--missing]
     默认对 ja/ko 全部词条重生（按词缓存，重跑不重复烧钱）
     --missing  仅补「无中文释义」的词条（上一阶段的旧行为）
   环境变量：
     LINGUA_LLM_API_KEY    必填（否则跳过联网重生）
     LINGUA_LLM_BASE_URL   默认 https://api.openai.com/v1
     LINGUA_LLM_MODEL      默认 gpt-4o-mini
     LINGUA_LLM_CONCURRENCY 默认 6
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const ZH = require("./lib/zh");
const W = require("./lib/words");
const { writeOutputs } = require("./lib/output");

const ARGS = process.argv.slice(2);
const ONLY_MISSING = ARGS.indexOf("--missing") >= 0;
const LANGS = ARGS.filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = Math.max(1, Math.min(10, parseInt(process.env.LINGUA_LLM_CONCURRENCY || "6", 10) || 6));
const BATCH = 25;

const LANG_NAME = { en: "英语", ja: "日语", ko: "韩语" };
/* 需要联网重生的语言：日、韩释义经英语转译误差大，全量重生；英语走离线精简 */
const LLM_LANGS = { ja: true, ko: true, en: false };

/* 是否算「缺中文」（无释义或释义仍是英文/目标语） */
function missingZh(w) {
  const m = (w.m || "").trim();
  if (!m) return true;
  if (ZH.t2s(m) !== m) return false;                   // 含汉字即视为中文
  return !/[\u3400-\u9fff]/.test(m);
}

/* ---------- 模型调用 ---------- */

function genPrompt(lang, batch) {
  const lines = batch.map((w, i) => {
    const ex = (w.ex && w.ex[0] && w.ex[0].t) ? w.ex[0].t : "";
    return (i + 1) + ". " + w.t
      + (w.r ? "  （读音：" + w.r + "）" : "")
      + (w.en ? "  （英文义：" + w.en + "）" : "")
      + (ex ? "  （例句：" + ex + "）" : "");
  }).join("\n");
  return "下面是一批" + LANG_NAME[lang] + "词。请为每个词给出**最常用的 1–2 个简体中文义项**。\n" +
    "要求：每个义项不超过 8 个字；只写释义本身，不要词性标注、不要例句、不要解释；" +
    "两个义项之间用「；」连接；遇到助词、专有名词等无实义项时留空字符串。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"m\":\"商店；铺子\"}，不要输出任何其它内容。\n\n" + lines;
}

function checkPrompt(lang, batch) {
  const lines = batch.map((w, i) => (i + 1) + ". 词：" + w.t
    + (w.r ? "（读音：" + w.r + "）" : "")
    + " 释义：" + (w.m || "（空）")).join("\n");
  return "下面每行给出一个" + LANG_NAME[lang] + "词及其中文释义。请判断**释义与原词是否匹配**" +
    "（仅当释义明显是别的词的意思、或与该词无关时才判 false；释义不完整、只给一个义项都算匹配）。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"ok\":true}，不要输出任何其它内容。\n\n" + lines;
}

async function chat(user, system) {
  const res = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: system || "你是词典编纂助手，输出严格 JSON，不添加多余文字。" },
        { role: "user", content: user }
      ]
    })
  });
  if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 200));
  const data = await res.json();
  let txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  txt = txt.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(txt);
}

async function askMeanings(lang, batch) {
  const arr = await chat(genPrompt(lang, batch));
  const out = new Map();
  for (const o of arr) {
    const idx = parseInt(o.i, 10) - 1;
    if (idx >= 0 && idx < batch.length && typeof o.m === "string") {
      out.set(batch[idx].t, ZH.normalizeZh(o.m).slice(0, 24));
    }
  }
  return out;
}

async function askMatch(lang, batch) {
  const arr = await chat(checkPrompt(lang, batch));
  const bad = new Set();
  for (const o of arr) {
    const idx = parseInt(o.i, 10) - 1;
    if (idx >= 0 && idx < batch.length && o.ok === false) bad.add(batch[idx].t);
  }
  return bad;
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

/* ---------- 逐语言处理 ---------- */

async function fillLang(lang) {
  const file = path.join(U.RAW, "build", lang + ".words.json");
  let table = JSON.parse(U.readText(file));
  const cacheFile = path.join(U.RAW, "build", "llm-cache-" + lang + ".json");
  const cache = fs.existsSync(cacheFile) ? JSON.parse(U.readText(cacheFile)) : {};
  const mismatchFile = path.join(U.RAW, "build", "llm-mismatch-" + lang + ".json");
  let mismatch = fs.existsSync(mismatchFile) ? JSON.parse(U.readText(mismatchFile)) : {};

  let todo;
  if (LLM_LANGS[lang] && !ONLY_MISSING) {
    todo = table.slice();                                    // 全量重生
  } else {
    todo = table.filter(missingZh);                          // 仅补缺失
  }
  // 命中缓存的跳过
  const cached = todo.filter(w => cache[w.t]);
  const need = todo.filter(w => !cache[w.t]);
  U.log("  " + lang + "：共 " + table.length + " 词，待处理 " + todo.length +
    "（缓存命中 " + cached.length + "，需联网 " + need.length + "）");

  let done = 0, failed = 0;
  if (KEY && need.length) {
    const batches = chunksOf(need, BATCH);
    U.log("    用 " + MODEL + " 重生，" + batches.length + " 批，并发 " + CONC);
    await runPool(batches, async (batch, bi) => {
      try {
        const got = await askMeanings(lang, batch);
        for (const w of batch) {
          if (got.has(w.t)) { cache[w.t] = got.get(w.t); done++; }
        }
      } catch (e) {
        failed += batch.length;
        U.log("      批次 " + (bi + 1) + " 失败：" + e.message);
      }
      if ((bi + 1) % 5 === 0) U.log("      已完成 " + (bi + 1) + " / " + batches.length + " 批");
    }, CONC);
    U.writeJson(cacheFile, cache, false);
  } else if (need.length) {
    U.log("    未设置 LINGUA_LLM_API_KEY，跳过联网重生（保留离线清洗结果）");
  }

  // 应用缓存
  for (const w of table) {
    if (cache[w.t]) w.m = cache[w.t];
  }

  // 自查轮：判断释义与原词是否匹配
  if (KEY && LLM_LANGS[lang]) {
    const checkList = table.filter(w => cache[w.t] && !(w.t in mismatch));
    const cb = chunksOf(checkList, BATCH);
    if (cb.length) {
      U.log("    自查 " + checkList.length + " 词，" + cb.length + " 批");
      await runPool(cb, async (batch, bi) => {
        try {
          const bad = await askMatch(lang, batch);
          for (const w of batch) mismatch[w.t] = bad.has(w.t) ? "mismatch" : "ok";
        } catch (e) {
          U.log("      自查批次 " + (bi + 1) + " 失败：" + e.message);
        }
      }, CONC);
      U.writeJson(mismatchFile, mismatch, false);
    }
  }

  U.writeJson(file, table, false);

  const byLevel = {};
  for (const w of table) {
    const b = byLevel[w.level] || (byLevel[w.level] = []);
    b.push(w);
  }
  const stat = writeOutputs(lang, byLevel, true);
  const bad = Object.keys(mismatch).filter(k => mismatch[k] === "mismatch");
  const byTerm = new Map(table.map(w => [w.t, w]));
  const mismatchList = bad.map(t => {
    const w = byTerm.get(t) || {};
    return { t, r: w.r || "", m: w.m || "", ex: (w.ex && w.ex[0]) ? w.ex[0].t : "" };
  });
  U.log("  → " + lang + "：" + (KEY ? ("新处理 " + done + "，失败 " + failed + "，") : "") +
    "自查不匹配 " + bad.length + "，仍缺中文 " + table.filter(missingZh).length);
  return { lang, done, failed, mismatch: bad.length, mismatchList, ...stat };
}

/* 自查判定「释义与原词不匹配」的词导出到仓库内：
   raw/ 不入库，人工复核清单必须落到被跟踪的文件里才可提交。 */
function writeMismatchReport(summary) {
  const esc = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const lines = [];
  lines.push("# 释义自查：不匹配词清单（mismatch.md）");
  lines.push("");
  lines.push("由 `03-fill.js` 的模型自查轮产出；释义与原词不匹配的词在此列出，供人工复核。");
  lines.push("生成时间：" + new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
  lines.push("");
  let total = 0;
  for (const lang of targets) {
    const list = (summary[lang] && summary[lang].mismatchList) || [];
    total += list.length;
    lines.push("## " + (LANG_NAME[lang] || lang) + "（" + list.length + " 词）");
    lines.push("");
    if (!list.length) {
      lines.push(KEY ? "无。" : "尚未执行模型自查（未设置 LINGUA_LLM_API_KEY）。");
      lines.push("");
      continue;
    }
    lines.push("| # | 原词 | 读音 | 当前释义 | 例句 |");
    lines.push("|---|---|---|---|---|");
    list.forEach((v, i) => {
      lines.push("| " + (i + 1) + " | " + esc(v.t) + " | " + esc(v.r) + " | " + esc(v.m) + " | " + esc(v.ex) + " |");
    });
    lines.push("");
  }
  lines.push("合计不匹配 " + total + " 词。");
  lines.push("");
  U.writeText(path.join(__dirname, "mismatch.md"), lines.join("\n"));
}

async function main() {
  U.log("== 3/4 释义纠错 ==");
  const summary = {};
  for (const lang of targets) summary[lang] = await fillLang(lang);
  U.writeJson(path.join(U.RAW, "build", "fill-summary.json"), summary, false);
  writeMismatchReport(summary);
  // 站点摘要（语言元数据 + 各级别规模），供前端首页免加载大文件
  require("./lib/output").writeSiteSummary(targets);
  U.log("释义纠错完成。");
}

main().catch(e => { console.error(e); process.exit(1); });
