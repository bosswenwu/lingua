/* 步骤 11：英语 A1 内容「中国初一适配」审查（不改 data/，只产出 overrides 与报告）
   1) 例句适龄审查（重点）：逐条判定例句是否适合 12–13 岁中国初中生，
      明显成人主题（饮酒酒吧/吸烟毒品/恋爱约会/赌博/暴力凶杀/战争恐怖/死亡/性）才删；
      初筛后还有一轮「宁少删勿误删」复核，命中 KEEP 名单的强制保留。
      → overrides/en-middle.json  {"examples": { "<例句原文>": { "drop": true } }}
   2) 词汇难偏审查（报告性质，不改数据）：按人教版初中考纲常识分
      core（初中重点）/ general（一般常用）/ beyond（超纲偏词）。
   用法：node 11-check-grade7.js
   环境变量：LINGUA_LLM_API_KEY 必填；LINGUA_LLM_BASE_URL / LINGUA_LLM_MODEL 可选。
   缓存：raw/build/grade7-cache.json（按例句原文 / 词形缓存，重跑不重复烧钱）。 */
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = 6;
const BATCH = 25;

const CACHE_FILE = path.join(U.RAW, "build", "grade7-cache.json");
const REPORT_FILE = path.join(U.RAW, "build", "grade7-report.json");
const OV_FILE = path.join(__dirname, "overrides", "en-middle.json");

/* 人工终审保留名单：抽查发现误删的例句原文加进来，重跑即生效（宁少删勿误删） */
const KEEP = new Set([
  "\"Fire!\" he cried."                 // 火灾呼喊，非开火；初筛误判暴力
]);

/* 人工终审删除名单：模型复核轮放行、但人工目检确认属成人主题的例句（反向兜底） */
const FORCE_DROP = new Set([
  "I slapped his face.",                                 // 打人暴力
  "We are a couple.",                                    // 恋爱情节
  "What a charming couple!",                             // 婚恋赞叹
  "Their love has gone to the next level.",              // 恋爱情节
  "Tom is Mary's former husband.",                       // 婚恋关系
  "Marriage is the main cause of all divorces.",         // 婚恋离婚
  "He lost his most beloved son.",                       // 丧子死亡
  "Lay down all arms.",                                  // 战争武器
  "We can't get close to the enemy.",                    // 战争场景
  "This was a premeditated crime.",                      // 预谋犯罪
  "I feel like another beer.",                           // 饮酒场景
  "Some musicians drink on stage.",                      // 饮酒场景
  "Lobbyists for the bill funneled bribes into a campaign fund." // 政治贿赂
]);

/* ---------- 模型调用（与 03-fill.js 的 chat() 同款） ---------- */

async function chat(user, system) {
  const res = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: system || "你是中小学英语教材审读员，输出严格 JSON，不添加多余文字。" },
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

async function askOnce(user, system) {
  try { return await chat(user, system); }
  catch (e) {                                   // 批次失败重试一次
    U.log("      批次失败重试：" + e.message.slice(0, 120));
    return await chat(user, system);
  }
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

/* ---------- 数据装载（data/ 只读） ---------- */

function loadA1() {
  const file = path.join(U.DATA, "en", "a1.json");
  const data = JSON.parse(U.readText(file));
  const words = new Map();                      // t → {t, m}
  const exs = new Map();                        // 例句原文 → {t, tr, word, wordM}
  for (const unit of data.units || []) {
    for (const ls of unit.lessons || []) {
      for (const v of ls.vocab || []) {
        if (!words.has(v.t)) words.set(v.t, { t: v.t, m: v.m || "" });
        for (const e of v.ex || []) {
          if (!exs.has(e.t)) exs.set(e.t, { t: e.t, tr: e.tr || "", word: v.t, wordM: v.m || "" });
        }
      }
    }
  }
  return { words: [...words.values()], exs: [...exs.values()] };
}

/* ---------- 提示词 ---------- */

function exPrompt(batch) {
  const lines = batch.map((e, i) =>
    (i + 1) + ". 词：" + e.word + (e.wordM ? "（" + e.wordM + "）" : "") + " 例句：" + e.t
  ).join("\n");
  return "目标读者：中国初一学生（12–13 岁）。下面每行一个词条及其英语例句，请判定该例句是否适合初一学生朗读学习。\n" +
    "判 ok=false（不适合）仅限明显成人主题：酗酒/酒吧夜店场景、吸烟吸毒、恋爱约会亲昵、赌博、暴力凶杀、战争恐怖、死亡葬礼、性。\n" +
    "判 ok=true：校园、家庭、食物饮料、动物、运动、天气、日常作息等一切中性主题。\n" +
    "边界：酒吧里喝酒、约会情节 → false；仅在名词层面提到酒水食物（如菜单/餐桌上的 wine、beer、coffee）且画面中性的句子 → true；\n" +
    "date 表「日期」义的句子 → true，表「约会」情节 → false。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"ok\":true} 或 {\"i\":2,\"ok\":false,\"reason\":\"饮酒主题\"}，不要输出任何其它内容。\n\n" + lines;
}

function verifyPrompt(batch) {
  const lines = batch.map((e, i) =>
    (i + 1) + ". 词：" + e.word + "（" + e.wordM + "） 例句：" + e.t
  ).join("\n");
  return "下面例句初筛被判为「不适合中国初一学生」。请按「宁少删勿误删」原则逐条复核：\n" +
    "只有画面明显成人化（酗酒/酒吧夜店、吸烟吸毒、恋爱约会亲昵、赌博、暴力凶杀、战争恐怖、死亡、性）才维持 false；\n" +
    "中性日常场景（含仅提及酒水食物名词、date 表日期、职业/地点平铺直叙）一律改为 true。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"ok\":false,\"reason\":\"酒吧夜店\"} 或 {\"i\":2,\"ok\":true}，不要输出任何其它内容。\n\n" + lines;
}

function wcPrompt(batch) {
  const lines = batch.map((w, i) =>
    (i + 1) + ". " + w.t + (w.m ? "（" + w.m + "）" : "")
  ).join("\n");
  return "下面是英语单词（来自 NGSL A1 高频词表，附中文释义）。请判断每个词是否属于「人教版初中英语重点词汇」范围（初中考纲约 1600 词）。\n" +
    "分类：\n" +
    "- \"core\"：初中重点词汇——学校、家庭、食物、动物、颜色、数字、天气、运动、日常活动、常见动词/形容词/副词等教材与考试高频词；\n" +
    "- \"general\"：一般常用词——常用但不在初中核心考纲（如部分具体职业、低频日常名词）；\n" +
    "- \"beyond\"：超纲偏词——宗教、赌博、军事专业、古旧词、专业术语等初一学生无需掌握（如 altar、casino、saint、naval 一类）。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"c\":\"core\"}，不要输出任何其它内容。\n\n" + lines;
}

/* ---------- 主流程 ---------- */

async function main() {
  if (!KEY) { console.error("未设置 LINGUA_LLM_API_KEY，无法审查"); process.exit(1); }
  U.log("== 11 英语 A1 初一适配审查（" + MODEL + "，并发 " + CONC + "，批 " + BATCH + "）==");
  const { words, exs } = loadA1();
  U.log("载入 a1.json：" + words.length + " 词，" + exs.length + " 条不重复例句");

  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(U.readText(CACHE_FILE)) : {};
  cache.ex = cache.ex || {};
  cache.wc = cache.wc || {};

  /* -- 1. 例句初筛 -- */
  const needEx = exs.filter(e => !Object.prototype.hasOwnProperty.call(cache.ex, e.t));
  U.log("例句适龄初筛：待联网 " + needEx.length + "（缓存命中 " + (exs.length - needEx.length) + "）");
  const exBatches = chunksOf(needEx, BATCH);
  let doneEx = 0;
  await runPool(exBatches, async (batch, bi) => {
    try {
      const arr = await askOnce(exPrompt(batch));
      for (const o of arr) {
        const idx = parseInt(o.i, 10) - 1;
        if (!(idx >= 0 && idx < batch.length)) continue;
        const e = batch[idx];
        cache.ex[e.t] = o.ok === false
          ? { ok: false, reason: String(o.reason || "成人主题").slice(0, 20) }
          : { ok: true };
        doneEx++;
      }
    } catch (e) {
      U.log("      初筛批次 " + (bi + 1) + " 失败：" + e.message.slice(0, 120));
    }
    if ((bi + 1) % 10 === 0) { U.writeJson(CACHE_FILE, cache, false); U.log("      初筛进度 " + (bi + 1) + " / " + exBatches.length + " 批"); }
  }, CONC);
  U.writeJson(CACHE_FILE, cache, false);

  /* -- 2. 初筛不过的再复核（宁少删勿误删） -- */
  const flagged = exs.filter(e => cache.ex[e.t] && cache.ex[e.t].ok === false);
  const needVf = flagged.filter(e => !cache.ex[e.t].v);
  U.log("复核（宁少删勿误删）：初筛标记 " + flagged.length + "，待复核 " + needVf.length);
  await runPool(chunksOf(needVf, BATCH), async (batch, bi) => {
    try {
      const arr = await askOnce(verifyPrompt(batch));
      for (const o of arr) {
        const idx = parseInt(o.i, 10) - 1;
        if (!(idx >= 0 && idx < batch.length)) continue;
        const e = batch[idx];
        if (o.ok === false) {
          cache.ex[e.t] = { ok: false, v: true, reason: String(o.reason || cache.ex[e.t].reason || "成人主题").slice(0, 20) };
        } else {
          cache.ex[e.t] = { ok: true, v: true, note: "初筛标记、复核放行" };
        }
      }
    } catch (e) {
      U.log("      复核批次 " + (bi + 1) + " 失败：" + e.message.slice(0, 120));
    }
    if ((bi + 1) % 5 === 0) U.writeJson(CACHE_FILE, cache, false);
  }, CONC);
  U.writeJson(CACHE_FILE, cache, false);

  /* -- 3. 词汇难偏分级 -- */
  const needWc = words.filter(w => !Object.prototype.hasOwnProperty.call(cache.wc, w.t));
  U.log("词汇难偏分级：待联网 " + needWc.length + "（缓存命中 " + (words.length - needWc.length) + "）");
  await runPool(chunksOf(needWc, BATCH), async (batch, bi) => {
    try {
      const arr = await askOnce(wcPrompt(batch));
      for (const o of arr) {
        const idx = parseInt(o.i, 10) - 1;
        if (!(idx >= 0 && idx < batch.length)) continue;
        const c = ["core", "general", "beyond"].includes(o.c) ? o.c : "general";
        cache.wc[batch[idx].t] = c;
      }
    } catch (e) {
      U.log("      分级批次 " + (bi + 1) + " 失败：" + e.message.slice(0, 120));
    }
    if ((bi + 1) % 10 === 0) U.writeJson(CACHE_FILE, cache, false);
  }, CONC);
  U.writeJson(CACHE_FILE, cache, false);

  /* -- 4. 产出 overrides/en-middle.json（只删例句，不动词与释义） -- */
  const dropped = exs.filter(e => {
    const c = cache.ex[e.t];
    const llmDrop = !!(c && c.ok === false) && !KEEP.has(e.t);
    return llmDrop || FORCE_DROP.has(e.t);
  });
  const manualDropped = dropped.filter(e => FORCE_DROP.has(e.t));
  const ov = { examples: {} };
  for (const e of dropped) ov.examples[e.t] = { drop: true };
  U.writeJson(OV_FILE, ov, true);

  /* -- 5. 报告 -- */
  const wcCount = { core: 0, general: 0, beyond: 0 };
  for (const w of words) { const c = cache.wc[w.t] || "general"; wcCount[c]++; }
  const beyondList = words.filter(w => (cache.wc[w.t] || "general") === "beyond").map(w => w.t).sort((a, b) => a.localeCompare(b));
  const detail = dropped.map(e => ({
    word: e.word, ex: e.t, tr: e.tr,
    reason: FORCE_DROP.has(e.t) ? "人工终审：" + ((cache.ex[e.t] && cache.ex[e.t].reason) || "成人主题")
      : (cache.ex[e.t] && cache.ex[e.t].reason) || ""
  }));
  const report = {
    model: MODEL, time: new Date().toISOString(),
    words: words.length, examples: exs.length,
    flaggedInitial: flagged.length,
    releasedByVerify: exs.filter(e => cache.ex[e.t] && cache.ex[e.t].v && cache.ex[e.t].ok === true).length,
    droppedCount: dropped.length,
    droppedByLlm: dropped.length - manualDropped.length,
    droppedByManual: manualDropped.length,
    wordClass: wcCount, corePct: (wcCount.core / words.length * 100).toFixed(1) + "%",
    beyondList, droppedDetail: detail
  };
  U.writeJson(REPORT_FILE, report, true);

  U.log("→ 初筛标记 " + flagged.length + "，复核放行 " + report.releasedByVerify +
    "，最终删除例句 " + dropped.length);
  U.log("→ 词汇分级：重点 " + wcCount.core + "（" + report.corePct + "）/ 一般 " + wcCount.general +
    " / 超纲偏词 " + wcCount.beyond);
  U.log("→ overrides/en-middle.json：examples.drop " + Object.keys(ov.examples).length + " 条");
  U.log("→ 报告：raw/build/grade7-report.json");
}

main().catch(e => { console.error(e); process.exit(1); });
