/* 步骤 7：把人工审校修正（overrides/{lang}.json）套用到现有 data/{lang}/{level}.json，并刷新 summary
   02-convert 写产物时也会自动套用，本脚本用于不重跑流水线、直接修数据的场景。
   用法：node 07-apply-overrides.js [en ja ko] */
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const OV = require("./lib/overrides");
const { writeSiteSummary } = require("./lib/output");

const LANGS = process.argv.slice(2).filter(x => ["en", "ja", "ko"].includes(x));
const targets = LANGS.length ? LANGS : ["en", "ja", "ko"];

for (const lang of targets) {
  const ov = OV.load(lang);
  const tot = {};
  for (const L of CFG.LEVELS) {
    const f = path.join(U.DATA, lang, L.id + ".json");
    if (!fs.existsSync(f)) continue;
    const data = JSON.parse(U.readText(f));
    const st = OV.applyToLevel(lang, data, ov);
    for (const k in st) tot[k] = (tot[k] || 0) + st[k];
    U.writeJson(f, data, false);
  }
  U.log("  " + lang + "：释义 " + (tot.m || 0) + " / 读音 " + (tot.r || 0) + " / 词形 " + (tot.t || 0) +
    " / 删词 " + (tot.drop || 0) + " / 改译文 " + (tot.exTr || 0) + " / 删例句 " + (tot.exDrop || 0));
}
writeSiteSummary(["en", "ja", "ko"]);
