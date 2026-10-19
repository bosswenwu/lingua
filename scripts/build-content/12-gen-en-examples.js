/* 步骤 12：为英语「无例句词」用 LLM 生成例句（Tatoeba 补例句后的兜底）
   输入：data/en/*.json 里 ex 为空或缺失的词
   输出：overrides/en-genex.json  {"words": {"<词>": {"addEx": {"t": "...", "tr": "..."}}}}
   生成后自检：例句含目标词（词边界）、≤16 词、无敏感词、译文含汉字。
   用法：node 12-gen-en-examples.js
   环境变量：LINGUA_LLM_API_KEY 必填；LINGUA_LLM_BASE_URL / LINGUA_LLM_MODEL 可选。
   缓存：raw/build/genex-cache.json（按词缓存，重跑不重复烧钱）。 */
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = 6;
const BATCH = 20;

const CACHE_FILE = path.join(U.RAW, "build", "genex-cache.json");
const OV_FILE = path.join(__dirname, "overrides", "en-genex.json");

/* 敏感词黑名单（与 09 同思路） */
const BAD = /(fuck|shit|bitch|nigger|asshole|dick|whore|slut|rape|naked|sex|porn|beer|wine|vodka|whisky|drunk|cigarette|cigar|kill|murder|gun|blood)/i;

function containsTerm(term, text) {
  if (!text) return false;
  const re = new RegExp("(^|[^A-Za-z])" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Za-z]|$)", "i");
  return re.test(text);
}
function wordCount(s) { return s.trim().split(/\s+/).length; }

async function chat(user, system) {
  const res = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
    body: JSON.stringify({
      model: MODEL, temperature: 0.3,
      messages: [
        { role: "system", content: "你是中国初中英语教材编写者，输出严格 JSON，不添加多余文字。" },
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

function genPrompt(batch) {
  const lines = batch.map((w, i) => (i + 1) + ". " + w.t + (w.m ? "（" + w.m + "）" : "")).join("\n");
  return "下面是英语单词（附简体中文释义）。请为每个词造 1 个适合中国初中生（初一为主）学习的例句。\n" +
    "要求：\n" +
    "- 例句 6–12 个单词，语法正确，用该词最常见的意思；\n" +
    "- 主题限：校园、家庭、朋友、食物、动物、运动、天气、日常活动；\n" +
    "- 不出现酒水、恋爱、暴力、死亡等成人内容；词汇不超过初中难度；\n" +
    "- 例句必须包含该词（可作形态变化，如 study→studies/studying，但保留词根可辨认）；\n" +
    "- 同时给出例句的准确简体中文译文。\n" +
    "严格按 JSON 数组输出，元素形如 {\"i\":1,\"en\":\"I do my homework every day.\",\"zh\":\"我每天做作业。\"}，不要输出任何其它内容。\n\n" + lines;
}

async function main() {
  if (!KEY) { console.error("未设置 LINGUA_LLM_API_KEY，无法生成"); process.exit(1); }
  U.log("== 12 英语无例句词生成例句（" + MODEL + "，并发 " + CONC + "，批 " + BATCH + "）==");

  /* 收集无例句的词（四级别） */
  const targets = [];
  for (const lv of ["a1", "a2", "b1", "b2"]) {
    const data = JSON.parse(U.readText(path.join(U.DATA, "en", lv + ".json")));
    for (const unit of data.units || []) {
      for (const ls of unit.lessons || []) {
        for (const v of ls.vocab || []) {
          if (!v.ex || !v.ex.length) targets.push({ t: v.t, m: v.m || "", level: lv });
        }
      }
    }
  }
  /* 同词去重 */
  const seen = new Set();
  const list = targets.filter(w => (seen.has(w.t) ? false : (seen.add(w.t), true)));
  U.log("无例句词（去重后）：" + list.length);

  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(U.readText(CACHE_FILE)) : {};

  const need = list.filter(w => {
    const c = cache[w.t];
    return !(c && c.en && c.zh && !c.rej);
  });
  U.log("待联网生成：" + need.length + "（缓存命中 " + (list.length - need.length) + "）");

  const batches = [];
  for (let i = 0; i < need.length; i += BATCH) batches.push(need.slice(i, i + BATCH));
  let done = 0, rej = 0;
  const runners = [];
  let bi = 0;
  for (let c = 0; c < CONC; c++) {
    runners.push((async () => {
      for (;;) {
        const my = bi++;
        if (my >= batches.length) return;
        const batch = batches[my];
        try {
          const arr = await chat(genPrompt(batch));
          for (const o of arr) {
            const idx = parseInt(o.i, 10) - 1;
            if (!(idx >= 0 && idx < batch.length)) continue;
            const w = batch[idx];
            const en = String(o.en || "").trim(), zh = String(o.zh || "").trim();
            const ok = en && zh && containsTerm(w.t, en) && wordCount(en) <= 16 && !BAD.test(en) && /[\u4e00-\u9fff]/.test(zh);
            if (ok) cache[w.t] = { en, zh };
            else { cache[w.t] = { en: en || "", zh: zh || "", rej: "自检未过" }; rej++; }
          }
          done++;
        } catch (e) { U.log("      批次 " + (my + 1) + " 失败：" + e.message.slice(0, 120)); }
        if ((my + 1) % 5 === 0) { U.writeJson(CACHE_FILE, cache, false); U.log("      进度 " + (my + 1) + " / " + batches.length + " 批"); }
      }
    })());
  }
  await Promise.all(runners);
  U.writeJson(CACHE_FILE, cache, false);

  /* 产出 override（全部词入 addEx；07 应用时天然查重跳过） */
  const ov = { words: {} };
  let n = 0;
  for (const w of list) {
    const c = cache[w.t];
    if (c && c.en && c.zh && !c.rej) { ov.words[w.t] = { addEx: { t: c.en, tr: c.zh } }; n++; }
  }
  U.writeJson(OV_FILE, ov, true);
  U.log("→ 成功生成 " + n + " 词，自检拒绝 " + rej + " 词");
  U.log("→ overrides/en-genex.json：words.addEx " + n + " 条（应用时已配句的词由 07 自动跳过）");
}

main().catch(e => { console.error(e); process.exit(1); });
