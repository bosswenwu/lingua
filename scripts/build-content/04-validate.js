/* 步骤 4：校验产物
   规则：字段齐全、无重复词、级别合法、例句确实包含目标词、每课 15–20 词、四级齐全。
   任一不通过即 exit 1。
   用法：node 04-validate.js
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");
const ZH = require("./lib/zh");
const T = require("./lib/tatoeba");

const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const WARN = (m) => warns.push(m);

const LANGS = ["en", "ja", "ko"];
const MIN_WORDS = 2000, MIN_LESSONS = 120;
/* 每课词数区间按级别：A1 5–8（目标 6–8），其余 7–10（目标 8–10） */
const SIZE = {};
for (const L of CFG.LEVELS) SIZE[L.id] = CFG.lessonSizeRange(L.id);

/* P2-11：质量检查（命中即报错） */
const EN_WORD = /[A-Za-z]/;                       // 释义里含英文字母
const BRACKET = /[<>\[\]]/;                       // 释义里含 <> []
const BAD_PREFIX = /^(是|表示|在)/;                // 词典式占位开头（含被换成的「在」）
const PLACEHOLDER = /^(在|是|有)$/;                // 单字占位释义

function qualityChecks(lang, ls, v, trs, exTexts) {
  const m = String(v.m || "").trim();
  if (EN_WORD.test(m)) E(lang + " " + ls.id + " 词 " + v.t + ": 释义含英文单词 → " + m);
  if (BRACKET.test(m)) E(lang + " " + ls.id + " 词 " + v.t + ": 释义含 <> [] → " + m);
  if (BAD_PREFIX.test(m)) E(lang + " " + ls.id + " 词 " + v.t + ": 释义以「在/是/表示」开头 → " + m);
  if (PLACEHOLDER.test(m)) E(lang + " " + ls.id + " 词 " + v.t + ": 释义是占位单字 → " + m);
  if ([...m].length === 1) E(lang + " " + ls.id + " 词 " + v.t + ": 释义只有 1 个字 → " + m);
  if (m && m === String(v.t).trim()) E(lang + " " + ls.id + " 词 " + v.t + ": 释义等于原词");
  if (ZH.hasTraditional(m)) E(lang + " " + ls.id + " 词 " + v.t + ": 释义含繁体字 → " + m);
  for (const tr of trs) {
    if (ZH.hasTraditional(tr)) E(lang + " " + ls.id + " 词 " + v.t + ": 译文含繁体字 → " + tr);
  }
  if (lang === "ko") for (const s of exTexts) {
    if (T.isKoTemplate(v.t, s)) E(lang + " " + ls.id + " 词 " + v.t + ": 残留模板句 → " + s);
  }
  const dupe = exTexts.find((s, i) => exTexts.indexOf(s) !== i);
  if (dupe) E(lang + " " + ls.id + " 词 " + v.t + ": 例句重复 → " + dupe);
}

/* 英语按词边界判断，日语/韩语按子串判断 */
function contains(term, text) {
  if (!text) return false;
  if (/^[A-Za-z' -]+$/.test(term)) {
    const re = new RegExp("(^|[^A-Za-z])" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Za-z]|$)", "i");
    return re.test(text);
  }
  return text.indexOf(term) >= 0;
}

const report = {};
const allVocab = {};

for (const lang of LANGS) {
  const dir = path.join(U.DATA, lang);
  if (!fs.existsSync(dir)) { E(lang + ": 缺少 data/" + lang + " 目录"); continue; }

  const levels = CFG.LEVELS.map(L => ({ id: L.id, file: path.join(dir, L.id + ".json") }));
  const seenTerms = new Map();
  const langVocab = [];
  let totalWords = 0, totalLessons = 0, exCovered = 0;
  const levelStat = {};
  const badges = new Set();

  for (const lv of levels) {
    if (!fs.existsSync(lv.file)) { E(lang + " 缺少级别文件 " + lv.id + ".json"); continue; }
    const data = JSON.parse(U.readText(lv.file));
    badges.add(data.badge);
    let nWords = 0, nLessons = 0;

    if (data.id !== lang + "-" + lv.id) E(lang + " " + lv.id + ": level id 应为 " + lang + "-" + lv.id + "，实际 " + data.id);
    if (!data.badge) E(lang + " " + lv.id + ": 缺 badge");
    if (!Array.isArray(data.units) || !data.units.length) E(lang + " " + lv.id + ": units 为空");

    const unitIds = new Set();
    for (const unit of (data.units || [])) {
      if (!unit.id) E(lang + " " + lv.id + ": unit 缺 id");
      if (unitIds.has(unit.id)) E(lang + " 单元 id 重复：" + unit.id);
      unitIds.add(unit.id);
      if (!Array.isArray(unit.lessons) || !unit.lessons.length) E(lang + " 单元 " + unit.id + " 无 lessons");

      const lessonIds = new Set();
      for (const ls of (unit.lessons || [])) {
        if (!ls.id) E(lang + " 课缺 id（单元 " + unit.id + "）");
        if (lessonIds.has(ls.id)) E(lang + " 课 id 重复：" + ls.id);
        lessonIds.add(ls.id);
        if (!ls.title) E(lang + " " + ls.id + ": 缺 title");
        if (typeof ls.minutes !== "number") E(lang + " " + ls.id + ": 缺 minutes");
        if (typeof ls.xp !== "number") E(lang + " " + ls.id + ": 缺 xp");
        if (!Array.isArray(ls.vocab) || !ls.vocab.length) { E(lang + " " + ls.id + ": vocab 为空"); continue; }
        const rng = SIZE[lv.id] || { min: 5, max: 10 };
        if (ls.vocab.length < rng.min || ls.vocab.length > rng.max)
          E(lang + " " + ls.id + ": 词数 " + ls.vocab.length + " 超出 " + rng.min + "–" + rng.max);

        /* 同一课两个词释义完全相同 → 报警（会造成验证题出现两个正确答案） */
        const seenMeaning = new Set();
        for (const v of ls.vocab) {
          const mm = String(v.m || "").trim();
          if (mm && seenMeaning.has(mm)) WARN(lang + " " + ls.id + ": 课内释义重复「" + mm + "」（" + v.t + "）");
          seenMeaning.add(mm);
        }

        const inLesson = new Set();
        for (const v of ls.vocab) {
          if (!v.t) { E(lang + " " + ls.id + ": 词条缺 t"); continue; }
          if (inLesson.has(v.t)) E(lang + " " + ls.id + ": 课内词重复 " + v.t);
          inLesson.add(v.t);
          if (!v.m || !String(v.m).trim()) E(lang + " " + ls.id + " 词 " + v.t + ": 缺释义 m");
          if (v.r !== undefined && typeof v.r !== "string") E(lang + " " + ls.id + " 词 " + v.t + ": r 应为字符串");
          const trs = [], exTexts = [];
          if (v.ex !== undefined) {
            if (!Array.isArray(v.ex)) E(lang + " " + ls.id + " 词 " + v.t + ": ex 应为数组");
            else {
              if (v.ex.length) exCovered++;
              for (const e of v.ex) {
                if (!e || !e.t || !e.tr) E(lang + " " + ls.id + " 词 " + v.t + ": 例句缺 t/tr");
                else {
                  if (!contains(v.t, e.t)) E(lang + " " + ls.id + " 词 " + v.t + ": 例句未包含目标词 → " + e.t);
                  trs.push(e.tr); exTexts.push(e.t);
                }
              }
            }
          }
          qualityChecks(lang, ls, v, trs, exTexts);
          const prev = seenTerms.get(v.t);
          if (prev && prev !== ls.id) E(lang + " 词跨课重复：" + v.t + "（" + prev + " 与 " + ls.id + "）");
          else seenTerms.set(v.t, ls.id);
          langVocab.push(v);
          nWords++;
        }
        nLessons++;
      }
    }
    totalWords += nWords; totalLessons += nLessons;
    levelStat[lv.id] = nWords;
    if (nWords === 0) E(lang + " " + lv.id + ": 级别无词");
  }

  for (const L of CFG.LEVELS) if (!badges.has(L.badge)) E(lang + " 缺少级别 " + L.badge);

  if (totalWords < MIN_WORDS) E(lang + " 总词数 " + totalWords + " < " + MIN_WORDS);
  if (totalLessons < MIN_LESSONS) E(lang + " 总课数 " + totalLessons + " < " + MIN_LESSONS);
  const cov = totalWords ? (exCovered / totalWords) : 0;
  if (cov < 0.5) WARN(lang + " 例句覆盖率仅 " + Math.round(cov * 100) + "%，建议补例句");

  report[lang] = {
    words: totalWords, lessons: totalLessons,
    exampleCoverage: Math.round(cov * 100) + "%",
    byLevel: levelStat
  };
  allVocab[lang] = langVocab;
}

/* P2-12：固定种子随机抽样，输出 review.md（50 词/语言）与 acceptance.md（100 词/语言） */
function lcg(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function sample(arr, n, seed) {
  const a = arr.slice(), r = lcg(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a.slice(0, n);
}
function esc(s) { return String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\r?\n/g, " "); }

const LNAME = { en: "英语", ja: "日语", ko: "韩语" };
/* P0-2：复核判定（05-judge.js 产出；无判定时显示「待复核」） */
let judge = {};
const judgeFile = path.join(U.RAW, "build", "acceptance-judgement.json");
if (fs.existsSync(judgeFile)) judge = JSON.parse(U.readText(judgeFile));

function table(list, lang) {
  const j = judge[lang] || {};
  const rows = list.map((v, i) => {
    const ex = (v.ex && v.ex[0]) ? esc(v.ex[0].t) + " ／ " + esc(v.ex[0].tr) : "（无）";
    const jd = j[v.t];
    const verdict = jd ? (jd.verdict === "对" || jd.verdict === "yes" ? "对" : "错") + (jd.fix ? "（复核改：" + esc(jd.fix) + "）" : "") : "待复核";
    return "| " + (i + 1) + " | " + esc(v.t) + " | " + esc(v.r || "") + " | " + esc(v.m) + " | " + ex + " | " + verdict + " |";
  });
  return ["| # | 原词 | 读音 | 释义 | 例句 | 判定 |", "|---|---|---|---|---|---|"].concat(rows).join("\n");
}
function verdictRate(list, lang) {
  const j = judge[lang] || {};
  let done = 0, wrong = 0;
  for (const v of list) {
    const jd = j[v.t];
    if (!jd) continue;
    done++;
    if (!(jd.verdict === "对" || jd.verdict === "yes")) wrong++;
  }
  if (!done) return "";
  return "复核 " + done + " 词，判错 " + wrong + "（错误率 " + (wrong / done * 100).toFixed(1) + "%，验收线 ≤3%）";
}

let reviewMd = "# 释义与例句抽检（review.md）\n\n固定种子随机抽样，每次构建结果一致。\n\n";
let acceptMd = "# 验收抽检表（100 词/语言）\n\n固定种子随机抽样。「判定」列由 05-judge.js 的复核模型给出（对/错 + 修正建议）。\n\n";
const acceptanceSample = {};
for (const lang of LANGS) {
  const list = allVocab[lang] || [];
  reviewMd += "## " + LNAME[lang] + "（" + Math.min(50, list.length) + " 词）\n\n" + table(sample(list, 50, 20261015 + lang.length), lang) + "\n\n";
  const acc = sample(list, 100, 813 + lang.charCodeAt(0));
  acceptanceSample[lang] = acc.map(v => ({ t: v.t, r: v.r || "", m: v.m || "", ex: (v.ex && v.ex[0]) ? v.ex[0].t : "" }));
  const rate = verdictRate(acc, lang);
  acceptMd += "## " + LNAME[lang] + "（" + Math.min(100, list.length) + " 词）" + (rate ? "　—　" + rate : "") + "\n\n" + table(acc, lang) + "\n\n";
}
U.writeJson(path.join(U.RAW, "build", "acceptance-sample.json"), acceptanceSample, true);
U.writeText(path.join(__dirname, "review.md"), reviewMd);
U.writeText(path.join(__dirname, "acceptance.md"), acceptMd);

U.log("== 4/4 校验结果 ==");
for (const lang of Object.keys(report)) {
  const r = report[lang];
  U.log("  " + lang + ": " + r.words + " 词 / " + r.lessons + " 课 / 例句 " + r.exampleCoverage + "  " +
    CFG.LEVELS.map(L => L.badge + ":" + (r.byLevel[L.id] || 0)).join(" "));
}
if (warns.length) { U.log("警告：" + warns.length); warns.forEach(w => U.log("  ! " + w)); }
if (errors.length) {
  U.log("错误：" + errors.length);
  errors.slice(0, 40).forEach(e => U.log("  x " + e));
  process.exit(1);
}
U.log("校验通过，零错误。");
