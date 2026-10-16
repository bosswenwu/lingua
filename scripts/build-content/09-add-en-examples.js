/* 步骤 9：为 data/en/ 四级中无例句的词补例句（只产 override 文件，不改 data/）
   数据源：raw/tatoeba/{eng_sentences,cmn_sentences,cmn-eng_links}.tsv
           （缺文件先跑 node 01-download.js，只需 en 相关三项）
   匹配：复用 lib/tatoeba.buildExamples（英语按词边界匹配 + passRatio 直译率过滤），
         分两档：
           严格档 = 与流水线一致（a1/a2 只收 ≤8 词短句 + 生词 ≤3）；
           宽松档 = 对严格档无果的词放宽级别长度/生词限制（passRatio、maxLen 仍生效），
                    A1/A2 优先 ≤10 词的短句。
   共同过滤：粗口/敏感词黑名单（原文/译文命中即弃）。
   挑句：每词只取 1 条最佳（按单词数、字符数升序）；全局尽量不重句。
   产出：overrides/en-addex.json  {"words":{"<词形>":{"addEx":{"t":"...","tr":"..."}}}}
         （经 lib/overrides.js 的 words.addEx 域套用，未匹配词打印清单）
   用法：node 09-add-en-examples.js */
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const T = require("./lib/tatoeba");
const ZH = require("./lib/zh");

/* 粗口/敏感词黑名单：原文或译文命中任一即弃用。
   注意：先做 normalizeZh（繁→简），否则「殺」这类繁体敏感词会漏检。 */
const BAD_EN = /\b(fuck\w*|shit\w*|bitch\w*|nigg\w+|assholes?|bastards?|cunts?|whores?|sluts?|rap(?:e[d]?|ing))\b/i;
const BAD_ZH = /杀|枪毙|强奸|他妈|妈的|混蛋|婊|妓/;
function cleanCands(list) {
  const out = [], seen = new Set();
  for (const c of list || []) {
    const tr = ZH.normalizeZh(c.tr);
    if (seen.has(c.t)) continue;
    if (BAD_EN.test(c.t) || BAD_ZH.test(tr)) continue;
    seen.add(c.t);
    out.push({ t: c.t, tr });
  }
  return out;
}

function wordCount(en) { return en.toLowerCase().split(/[^a-z']+/).filter(Boolean).length; }

function main() {
  /* 1. 扫 data/en/ 四级，收集无例句词与级别信息 */
  const missing = [];
  const levelOf = new Map();
  const easySet = new Set();
  for (const L of CFG.LEVELS) {
    const f = path.join(U.DATA, "en", L.id + ".json");
    if (!fs.existsSync(f)) throw new Error("缺少 " + f);
    const data = JSON.parse(U.readText(f));
    for (const unit of data.units || []) {
      for (const ls of unit.lessons || []) {
        for (const v of ls.vocab || []) {
          if (!levelOf.has(v.t)) levelOf.set(v.t, L.id);
          if (L.id === "a1" || L.id === "a2") easySet.add(v.t.toLowerCase());
          if (!Array.isArray(v.ex) || !v.ex.length) missing.push({ t: v.t, level: L.id });
        }
      }
    }
  }
  U.log("data/en 无例句词：" + missing.length + " 个（a1 " + missing.filter(w => w.level === "a1").length +
    " / a2 " + missing.filter(w => w.level === "a2").length +
    " / b1 " + missing.filter(w => w.level === "b1").length +
    " / b2 " + missing.filter(w => w.level === "b2").length + "）");

  const terms = missing.map(w => w.t);

  /* 2. 严格档：与流水线完全一致（a1/a2 短句 + 生词上限） */
  const exStrict = T.buildExamples("en", terms, { levelOf, easySet });

  /* 3. 宽松档：严格档（含黑名单后）无果的词，放宽级别限制再匹配一轮 */
  const hard = terms.filter(t => !cleanCands(exStrict.get(t)).length);
  U.log("严格档候选不足 " + hard.length + " 词，进入宽松档");
  const exRelax = hard.length ? T.buildExamples("en", hard, {}) : new Map();

  /* 4. 每词挑 1 条最佳：黑名单过滤 → 优先短句（A1/A2 优先 ≤10 词）→ 全局尽量不重句 */
  const used = new Set();
  const out = {};
  const unmatched = [];
  let strictHit = 0;
  for (const w of missing) {
    let cands = cleanCands(exStrict.get(w.t));
    let tier = "strict";
    if (!cands.length) {
      cands = cleanCands(exRelax.get(w.t));
      tier = "relax";
    }
    if (w.level === "a1" || w.level === "a2") {
      const short = cands.filter(c => wordCount(c.t) <= 10);
      if (short.length) cands = short;                       // A1/A2 优先 ≤10 词
    }
    cands.sort((a, b) => wordCount(a.t) - wordCount(b.t) || a.t.length - b.t.length);
    let pick = cands.find(c => !used.has(c.t));
    if (!pick && cands.length) pick = cands[0];              // 候选全被其他词占用时，退回复用该词最优句
    if (!pick) { unmatched.push(w); continue; }
    used.add(pick.t);
    if (tier === "strict") strictHit++;
    out[w.t] = { addEx: { t: pick.t, tr: pick.tr } };
  }

  /* 5. 产出 override 文件 + 未匹配清单 */
  const dest = path.join(__dirname, "overrides", "en-addex.json");
  U.writeJson(dest, { words: out }, true);
  U.log("已产出 " + dest + "（" + Object.keys(out).length + " 词配例句，严格档 " + strictHit +
    " / 宽松档 " + (Object.keys(out).length - strictHit) + "）");

  const byLv = { a1: [], a2: [], b1: [], b2: [] };
  for (const w of unmatched) byLv[w.level].push(w.t);
  U.log("未匹配 " + unmatched.length + " 词：");
  for (const lv of ["a1", "a2", "b1", "b2"]) {
    if (byLv[lv].length) U.log("  " + lv + " (" + byLv[lv].length + "): " + byLv[lv].join(", "));
  }
}

main();
