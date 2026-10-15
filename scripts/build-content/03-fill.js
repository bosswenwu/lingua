/* 步骤 3：补齐缺失的中文释义
   优先用大模型 API（并发 5–10，key 只读环境变量）；无 key 时用离线词典尽力补齐。
   用法：node 03-fill.js [en ja ko]
   环境变量：
     LINGUA_LLM_API_KEY   必填（否则跳过联网补齐）
     LINGUA_LLM_BASE_URL  默认 https://api.openai.com/v1
     LINGUA_LLM_MODEL     默认 gpt-4o-mini
     LINGUA_LLM_CONCURRENCY 默认 6
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const { writeOutputs } = require("./lib/output");

const LANGS = process.argv.slice(2).filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = Math.max(1, Math.min(10, parseInt(process.env.LINGUA_LLM_CONCURRENCY || "6", 10) || 6));

const LANG_NAME = { en: "英语", ja: "日语", ko: "韩语" };

/* 是否算「缺中文」（无释义或释义仍是英文/目标语） */
function missingZh(w) {
  const m = (w.m || "").trim();
  if (!m) return true;
  if (/[\u4e00-\u9fff]/.test(m)) return false;        // 含汉字即视为中文
  return true;                                         // 纯英文/罗马字 → 需要补
}

function buildPrompt(lang, batch) {
  const lines = batch.map((w, i) => (i + 1) + ". " + w.t + (w.en ? "  （英文义：" + w.en + "）" : "")).join("\n");
  return "下面是一批" + LANG_NAME[lang] + "词。请为每个词给出**简洁的中文释义**，" +
    "要求：不超过 12 个汉字；只写释义本身，不要词性标注、不要例句、不要解释；" +
    "多义词用「；」连接最多 2 个义项。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"m\":\"中性释义\"}，不要输出任何其它内容。\n\n" + lines;
}

async function askLLM(lang, batch) {
  const res = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: "你是词典编纂助手，输出严格 JSON，不添加多余文字。" },
        { role: "user", content: buildPrompt(lang, batch) }
      ]
    })
  });
  if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 200));
  const data = await res.json();
  let txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  txt = txt.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const arr = JSON.parse(txt);
  const out = new Map();
  for (const o of arr) {
    const idx = parseInt(o.i, 10) - 1;
    if (idx >= 0 && idx < batch.length && o.m) out.set(batch[idx].t, String(o.m).trim().slice(0, 20));
  }
  return out;
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

async function fillLang(lang) {
  const table = JSON.parse(U.readText(path.join(U.RAW, "build", lang + ".words.json")));
  const todo = table.filter(missingZh);
  U.log("  " + lang + "：共 " + table.length + " 词，缺中文释义 " + todo.length + " 个");

  let filled = 0;
  if (KEY && todo.length) {
    const BATCH = 25;
    const batches = [];
    for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
    U.log("    用 " + MODEL + " 补齐，" + batches.length + " 批，并发 " + CONC);
    await runPool(batches, async (batch, bi) => {
      try {
        const got = await askLLM(lang, batch);
        for (const w of batch) {
          const m = got.get(w.t);
          if (m && /[\u4e00-\u9fff]/.test(m)) { w.m = m; filled++; }
        }
        if ((bi + 1) % 5 === 0) U.log("      已完成 " + (bi + 1) + " / " + batches.length + " 批");
      } catch (e) {
        U.log("      批次 " + (bi + 1) + " 失败：" + e.message);
      }
    }, CONC);
  } else if (todo.length) {
    U.log("    未设置 LINGUA_LLM_API_KEY，跳过联网补齐（保留英文义作占位）");
  }

  U.writeJson(path.join(U.RAW, "build", lang + ".words.json"), table, true);

  // 按级别分组后重新产出
  const byLevel = {};
  for (const w of table) {
    const b = byLevel[w.level] || (byLevel[w.level] = []);
    b.push(w);
  }
  const stat = writeOutputs(lang, byLevel, true);
  const still = table.filter(missingZh).length;
  U.log("  → " + lang + "：" + (KEY ? ("新补 " + filled + " 个，") : "") + "仍缺中文 " + still + " 个");
  return { lang, filled, still, ...stat };
}

async function main() {
  U.log("== 3/4 补齐释义 ==");
  const summary = {};
  for (const lang of targets) summary[lang] = await fillLang(lang);
  U.writeJson(path.join(U.RAW, "build", "fill-summary.json"), summary, true);
  U.log("补齐完成。");
}

main().catch(e => { console.error(e); process.exit(1); });
