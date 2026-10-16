/* 步骤 6：把验收判定的修正回写数据（05-judge 判错且有 fix 的词）
   只处理「当前样本 ∩ 判定为错且有 fix」的词，应用后同步三层：
     data/{lang}/{level}.json   站点产物
     raw/build/{lang}.words.json  词表中间层
     raw/build/llm-cache-v2-{lang}.json  释义缓存（保证重跑流水线结果一致）
   应用后从判定表中移除该词记录，让 05-judge 复判重写。
   用法：node 06-apply-fix.js [en ja ko]
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const ZH = require("./lib/zh");

const LANGS = process.argv.slice(2).filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];
const CFG = require("./lib/config");

const judgeFile = path.join(U.RAW, "build", "acceptance-judgement.json");
const sampleFile = path.join(U.RAW, "build", "acceptance-sample.json");
if (!fs.existsSync(judgeFile) || !fs.existsSync(sampleFile)) {
  console.error("缺少判定/样本文件，请先运行 04-validate 与 05-judge");
  process.exit(1);
}
const judge = JSON.parse(U.readText(judgeFile));
const sample = JSON.parse(U.readText(sampleFile));

for (const lang of targets) {
  const j = judge[lang] || {};
  const list = sample[lang] || [];
  const fixes = list
    .filter(w => j[w.t] && j[w.t].verdict === "错" && j[w.t].fix)
    .map(w => ({ t: w.t, fix: ZH.normalizeZh(j[w.t].fix).slice(0, 24) }));
  if (!fixes.length) { U.log("  " + lang + ": 无待应用修正"); continue; }

  /* 1) data/{lang}/{level}.json */
  const byTerm = new Map(fixes.map(f => [f.t, f.fix]));
  let hit = 0;
  for (const L of CFG.LEVELS) {
    const f = path.join(U.DATA, lang, L.id + ".json");
    if (!fs.existsSync(f)) continue;
    const data = JSON.parse(U.readText(f));
    let changed = false;
    for (const u of data.units) for (const ls of u.lessons) for (const v of ls.vocab) {
      if (byTerm.has(v.t)) { v.m = byTerm.get(v.t); changed = true; hit++; }
    }
    if (changed) U.writeJson(f, data, false);
  }

  /* 2) 词表中间层 + 3) 释义缓存 */
  const wordsFile = path.join(U.RAW, "build", lang + ".words.json");
  if (fs.existsSync(wordsFile)) {
    const table = JSON.parse(U.readText(wordsFile));
    for (const w of table) if (byTerm.has(w.t)) w.m = byTerm.get(w.t);
    U.writeJson(wordsFile, table, false);
  }
  const cacheFile = path.join(U.RAW, "build", "llm-cache-v2-" + lang + ".json");
  if (fs.existsSync(cacheFile)) {
    const cache = JSON.parse(U.readText(cacheFile));
    for (const [t, fix] of byTerm) cache[t] = fix;
    U.writeJson(cacheFile, cache, false);
  }

  /* 4) 从判定表移除，复判时重写 */
  for (const f of fixes) delete j[f.t];

  U.log("  " + lang + ": 应用修正 " + fixes.length + " 词（data 命中 " + hit + " 处）→ " + fixes.map(f => f.t).join("、"));
}
U.writeJson(judgeFile, judge, false);
U.log("完成。请重跑 node 04-validate.js 与 node 05-judge.js 复判。");
