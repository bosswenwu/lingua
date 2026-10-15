/* 步骤 4：校验产物
   规则：字段齐全、无重复词、级别合法、例句确实包含目标词、每课 15–20 词、四级齐全。
   任一不通过即 exit 1。
   用法：node 04-validate.js
*/
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const CFG = require("./lib/config");

const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const WARN = (m) => warns.push(m);

const LANGS = ["en", "ja", "ko"];
const MIN_WORDS = 2000, MIN_LESSONS = 120;
const LESSON_MIN = 15, LESSON_MAX = 20;

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

for (const lang of LANGS) {
  const dir = path.join(U.DATA, lang);
  if (!fs.existsSync(dir)) { E(lang + ": 缺少 data/" + lang + " 目录"); continue; }

  const levels = CFG.LEVELS.map(L => ({ id: L.id, file: path.join(dir, L.id + ".json") }));
  const seenTerms = new Map();
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
        if (ls.vocab.length < LESSON_MIN || ls.vocab.length > LESSON_MAX)
          E(lang + " " + ls.id + ": 词数 " + ls.vocab.length + " 超出 " + LESSON_MIN + "–" + LESSON_MAX);

        const inLesson = new Set();
        for (const v of ls.vocab) {
          if (!v.t) { E(lang + " " + ls.id + ": 词条缺 t"); continue; }
          if (inLesson.has(v.t)) E(lang + " " + ls.id + ": 课内词重复 " + v.t);
          inLesson.add(v.t);
          if (!v.m || !String(v.m).trim()) E(lang + " " + ls.id + " 词 " + v.t + ": 缺释义 m");
          if (v.r !== undefined && typeof v.r !== "string") E(lang + " " + ls.id + " 词 " + v.t + ": r 应为字符串");
          if (v.ex !== undefined) {
            if (!Array.isArray(v.ex)) E(lang + " " + ls.id + " 词 " + v.t + ": ex 应为数组");
            else {
              if (v.ex.length) exCovered++;
              for (const e of v.ex) {
                if (!e || !e.t || !e.tr) E(lang + " " + ls.id + " 词 " + v.t + ": 例句缺 t/tr");
                else if (!contains(v.t, e.t)) E(lang + " " + ls.id + " 词 " + v.t + ": 例句未包含目标词 → " + e.t);
              }
            }
          }
          const prev = seenTerms.get(v.t);
          if (prev && prev !== ls.id) E(lang + " 词跨课重复：" + v.t + "（" + prev + " 与 " + ls.id + "）");
          else seenTerms.set(v.t, ls.id);
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
}

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
