/* 把分级词表写成产物：data/{lang}/{level}.json + data/summary.json */
const fs = require("fs");
const path = require("path");
const U = require("./util");
const W = require("./words");
const CFG = require("./config");
const OV = require("./overrides");

/* 在 Node 下加载前端脚本（IIFE 把内容挂到 window） */
function loadSiteScript(rel) {
  if (!global.window) global.window = {};
  require(path.join(U.ROOT, rel));
  return global.window;
}

/* 与前端 data.js 的 countsOf 保持一致：手写题目优先，缺失部分按词条即时生成 */
function countsOf(lesson, lang) {
  let g = (lesson.grammar || []).reduce((a, x) => a + ((x.drills || []).length), 0);
  let li = (lesson.listening || []).length;
  let sp = (lesson.speaking || []).length;
  const Ex = global.window && global.window.Exercise;
  if ((!g || !li || !sp) && Ex) {
    const gen = Ex.generate(lesson, lang);
    if (!g) g = gen.grammar.length;
    if (!li) li = gen.listening.length;
    if (!sp) sp = gen.speaking.length;
  }
  return { vocab: (lesson.vocab || []).length, grammar: g, listening: li, speaking: sp };
}

/* 扫描生成数据，得到每级别的课数 / 词数 / 练习题数 */
function scanGenerated(lang, meta) {
  const levels = {};
  let lessons = 0, words = 0, exercises = 0;
  for (const L of CFG.LEVELS) {
    const file = path.join(U.DATA, lang, L.id + ".json");
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(U.readText(file));
    let lc = 0, wc = 0, ec = 0;
    for (const unit of (data.units || [])) {
      for (const ls of (unit.lessons || [])) {
        lc++;
        const c = countsOf(ls, meta);
        wc += c.vocab;
        ec += c.vocab + c.grammar + c.listening + c.speaking;
      }
    }
    levels[L.id] = {
      id: data.id || (lang + "-" + L.id),
      badge: data.badge || L.badge,
      name: data.name || L.name,
      lessons: lc, words: wc, exercises: ec
    };
    lessons += lc; words += wc; exercises += ec;
  }
  return { lessons, words, exercises, levels };
}

/* 站点摘要：语言元数据（取自手写课程）+ 各级别规模（含手写与生成数据） */
function writeSiteSummary(langs, quiet) {
  loadSiteScript(path.join("js", "exercise.js"));
  const out = { langs: {} };

  for (const lang of langs) {
    loadSiteScript(path.join("js", "data-" + lang + ".js"));
    const meta = global.window["COURSES_" + lang.toUpperCase()];
    if (!meta) { U.log("  警告：" + lang + " 缺少手写课程元数据，摘要跳过"); continue; }

    const gen = scanGenerated(lang, meta);

    /* 手写课程统计：按级别汇总 */
    const authored = {};
    for (const lv of (meta.levels || [])) {
      let lc = 0, wc = 0, ec = 0;
      for (const unit of (lv.units || [])) {
        for (const ls of (unit.lessons || [])) {
          lc++;
          const c = countsOf(ls, meta);
          wc += c.vocab;
          ec += c.vocab + c.grammar + c.listening + c.speaking;
        }
      }
      authored[lv.id] = { lessons: lc, words: wc, exercises: ec };
    }

    const levels = [];
    let lessons = 0, words = 0, exercises = 0;
    for (const L of CFG.LEVELS) {
      const id = lang + "-" + L.id;
      const a = authored[id] || { lessons: 0, words: 0, exercises: 0 };
      const g = gen.levels[L.id] || { lessons: 0, words: 0, exercises: 0 };
      const lv = { id: id, badge: L.badge, name: L.name, lessons: a.lessons + g.lessons, words: a.words + g.words };
      levels.push(lv);
      lessons += lv.lessons;
      words += lv.words;
      exercises += a.exercises + g.exercises;
    }

    out.langs[lang] = {
      code: meta.code || lang,
      name: meta.name, native: meta.native, flag: meta.flag, locale: meta.locale,
      scriptFont: meta.scriptFont, greeting: meta.greeting, color: meta.color,
      blurb: meta.blurb, highlights: meta.highlights,
      lessons: lessons, words: words, exercises: exercises, levels: levels
    };
    if (!quiet) U.log("  摘要 " + lang + "：" + lessons + " 课 / " + words + " 词 / " + exercises + " 练习");
  }

  U.writeJson(path.join(U.DATA, "summary.json"), out, false);
  if (!quiet) U.log("  → data/summary.json");
  return out;
}

function writeOutputs(lang, byLevel, quiet) {
  const tree = W.materialize(lang, byLevel);
  /* 人工审校修正最后套用，重跑流水线也不会丢 */
  const ov = OV.load(lang);
  for (const lv of tree.levels) OV.applyToLevel(lang, lv, ov);

  for (const lv of tree.levels) {
    U.writeJson(path.join(U.DATA, lang, lv.id.replace(lang + "-", "") + ".json"), lv, false);
  }

  const lessons = tree.levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.lessons.length, 0), 0);
  const words = tree.levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.lessons.reduce((c, s) => c + s.vocab.length, 0), 0), 0);
  if (!quiet) {
    U.log("  → " + lang + ": " + tree.levels.length + " 级 / " + lessons + " 课 / " + words + " 词  [" +
      tree.levels.map(l => l.badge + ":" + l.target).join(" ") + "]");
  }
  return { lang, lessons, words, levels: tree.levels.map(l => l.badge + ":" + l.target) };
}

module.exports = { writeOutputs, writeSiteSummary };
