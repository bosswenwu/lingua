/* 步骤 5：验收抽检判定（P0-2）
   读取 04-validate 产出的 raw/build/acceptance-sample.json（100 词/语言），
   用复核模型逐词判定：「这个中文释义是否是该词最常用的意思？」输出 yes/no + 修正建议。
   结果写入 raw/build/acceptance-judgement.json，并打印每门语言错误率（验收线 ≤3%）。
   重跑 `node 04-validate.js` 会把判定回填到 acceptance.md 的「判定」列。

   环境变量：
     LINGUA_LLM_API_KEY    必填（缺失则退出并提示）
     LINGUA_LLM_BASE_URL   默认 https://api.openai.com/v1
     LINGUA_LLM_MODEL      默认 gpt-4o-mini
     LINGUA_LLM_CONCURRENCY 默认 6
   用法：node 05-judge.js [en ja ko]
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = Math.max(1, Math.min(10, parseInt(process.env.LINGUA_LLM_CONCURRENCY || "6", 10) || 6));
const BATCH = 20;

const LANGS = process.argv.slice(2).filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];
const LNAME = { en: "英语", ja: "日语", ko: "韩语" };

if (!KEY) {
  console.error("未设置 LINGUA_LLM_API_KEY：无法执行复核判定。请先在本机设置环境变量后重试。");
  process.exit(1);
}

function judgePrompt(lang, batch) {
  const lines = batch.map((w, i) => {
    return (i + 1) + ". 词：" + w.t
      + (w.r ? "（读音：" + w.r + "）" : "")
      + (w.ex ? "（例句：" + w.ex + "）" : "")
      + "  中文释义：" + (w.m || "（空）");
  }).join("\n");
  return "下面每行是一个" + LNAME[lang] + "词及其简体中文释义。请逐词判断：**这个中文释义是否是该词最常用的意思？**\n" +
    "判断标准：义项明显错误、是别的词的意思、或与原词无关 → no（并给出正确的最常用义项，不超过 8 个字）；\n" +
    "义项正确但不完整、只列了部分常用义 → yes。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"ok\":true} 或 {\"i\":2,\"ok\":false,\"fix\":\"正确义项\"}，不要输出任何其它内容。\n\n" + lines;
}

async function chat(user, system) {
  const res = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: system || "你是词典审校助手，输出严格 JSON，不添加多余文字。" },
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

function chunksOf(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
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

async function main() {
  const sampleFile = path.join(U.RAW, "build", "acceptance-sample.json");
  if (!fs.existsSync(sampleFile)) { console.error("缺少 " + sampleFile + "，请先运行 node 04-validate.js"); process.exit(1); }
  const sample = JSON.parse(U.readText(sampleFile));
  const outFile = path.join(U.RAW, "build", "acceptance-judgement.json");
  const judge = fs.existsSync(outFile) ? JSON.parse(U.readText(outFile)) : {};

  U.log("== 5/5 验收判定（" + MODEL + "）==");
  for (const lang of targets) {
    const list = sample[lang] || [];
    if (!list.length) { U.log("  " + lang + ": 无样本，跳过"); continue; }
    const batches = chunksOf(list, BATCH);
    let failed = 0;
    await runPool(batches, async (batch, bi) => {
      try {
        const arr = await chat(judgePrompt(lang, batch));
        judge[lang] = judge[lang] || {};
        for (const o of arr) {
          const idx = parseInt(o.i, 10) - 1;
          if (idx < 0 || idx >= batch.length) continue;
          const w = batch[idx];
          judge[lang][w.t] = {
            verdict: o.ok === false ? "错" : "对",
            fix: typeof o.fix === "string" ? o.fix.slice(0, 16) : ""
          };
        }
      } catch (e) {
        failed += batch.length;
        U.log("    " + lang + " 批次 " + (bi + 1) + " 失败：" + e.message);
      }
    }, CONC);
    U.writeJson(outFile, judge, false);

    const j = judge[lang] || {};
    let done = 0, wrong = 0;
    for (const w of list) {
      const jd = j[w.t];
      if (!jd) continue;
      done++;
      if (jd.verdict === "错") wrong++;
    }
    const rate = done ? (wrong / done * 100).toFixed(1) + "%" : "—";
    U.log("  " + lang + "（" + LNAME[lang] + "）: 判定 " + done + "/" + list.length + "，判错 " + wrong +
      "，错误率 " + rate + "（验收线 ≤3%）" + (failed ? "，失败 " + failed : ""));
  }
  U.log("判定完成：已写入 raw/build/acceptance-judgement.json。请重跑 node 04-validate.js 回填 acceptance.md 的「判定」列。");
}

main().catch(e => { console.error(e); process.exit(1); });
