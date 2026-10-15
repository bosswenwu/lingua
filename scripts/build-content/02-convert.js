/* 步骤 2：词表 → 分级课程 JSON
   产出：
     raw/build/{lang}.words.json      中间词表（03-fill 在此补释义）
     data/{lang}/{level}.json         分级课程（懒加载备用）
     js/data-{lang}-ext.js            同步可用的 JS 包装（今天就能用）
   用法：node 02-convert.js [en ja ko]
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const W = require("./lib/words");
const T = require("./lib/tatoeba");

const LANGS = process.argv.slice(2).filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];

function buildWordTable(lang, ecdict, kengdic) {
  let words;
  if (lang === "en") {
    words = W.planEnglish(ecdict);
    const inNgsl = new Set(words.map(w => w.t));
    // 用 ECDICT 高频词补齐 B1/B2 容量（NGSL 本身只覆盖到约 B1 前半段）
    const supp = W.planEnglishSupplement(ecdict, inNgsl);
    words = words.concat(supp);
  } else if (lang === "ja") {
    words = W.planJapanese(ecdict);
  } else {
    words = W.planKorean(ecdict, kengdic);
  }

  // 按级别截断
  const byLevel = {};
  for (const w of words) {
    const b = byLevel[w.level] || (byLevel[w.level] = []);
    if (b.length < CFG.PER_LEVEL_CAP) b.push(w);
  }

  // 例句（带级别信息，a1/a2 只收短句；英语再限生词数）
  const terms = [];
  const levelOf = new Map();
  const easySet = new Set();
  for (const k of Object.keys(byLevel)) {
    for (const w of byLevel[k]) {
      terms.push(w.t);
      if (!levelOf.has(w.t)) levelOf.set(w.t, k);
      if (k === "a1" || k === "a2") easySet.add(lang === "en" ? w.t.toLowerCase() : w.t);
    }
  }
  const exAll = T.buildExamples(lang, terms, { levelOf, easySet });

  let withEx = 0;
  for (const k of Object.keys(byLevel)) {
    for (const w of byLevel[k]) {
      w.ex = T.pickExamples(exAll, w.t, CFG.EXAMPLES_PER_WORD);
      if (w.ex.length) withEx++;
    }
  }
  const total = Object.keys(byLevel).reduce((a, k) => a + byLevel[k].length, 0);
  U.log("  " + lang + ": " + total + " 词（例句覆盖 " + withEx + "）");
  return byLevel;
}

function writeOutputs(lang, byLevel) {
  return require("./lib/output").writeOutputs(lang, byLevel);
}

function main() {
  U.log("== 2/4 词表转换 ==");
  const ecdict = W.loadEcdict();
  U.log("  ECDICT 载入 " + ecdict.size + " 条");
  const kengdic = targets.includes("ko") ? W.loadKengdic() : new Map();

  const summary = {};
  for (const lang of targets) {
    U.log("[" + lang + "]");
    const byLevel = buildWordTable(lang, ecdict, kengdic);
    // 中间词表（供 03-fill 复用）
    const flat = [];
    for (const k of Object.keys(byLevel)) flat.push(...byLevel[k].map(w => ({ ...w, level: k })));
    U.writeJson(path.join(U.RAW, "build", lang + ".words.json"), flat, true);
    summary[lang] = writeOutputs(lang, byLevel);
  }
  U.writeJson(path.join(U.RAW, "build", "summary.json"), summary, true);
  // 站点摘要（语言元数据 + 各级别规模），供前端首页免加载大文件
  require("./lib/output").writeSiteSummary(targets);
  U.log("转换完成。");
}

main();
