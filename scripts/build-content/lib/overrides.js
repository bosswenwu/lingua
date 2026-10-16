/* 人工审校修正（overrides/{lang}.json，入库）
   在生成产物的最后一步套用，保证重跑流水线后修正不丢失。
   格式：
     { "words":    { "<词形>": { "m": "释义", "r": "读音", "t": "新词形", "drop": true } },
       "examples": { "<例句原文>": { "tr": "新译文" } | { "drop": true } } }
   按词形 / 例句原文匹配，与课次编号无关。 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "overrides");

function load(lang) {
  const f = path.join(DIR, lang + ".json");
  if (!fs.existsSync(f)) return { words: {}, examples: {} };
  const o = JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
  return { words: o.words || {}, examples: o.examples || {} };
}

/* 课名形如「主题 · 词1 词2 词3」，词被删或改名后同步刷新 */
function retitle(lesson) {
  const m = /^(.*?) · /.exec(lesson.title || "");
  if (!m || !lesson.vocab.length) return;
  lesson.title = m[1] + " · " + lesson.vocab.slice(0, 3).map(v => v.t).join(" ");
}

function applyToLevel(lang, level, ov) {
  ov = ov || load(lang);
  const st = { m: 0, r: 0, t: 0, drop: 0, exTr: 0, exDrop: 0 };
  for (const unit of level.units || []) {
    for (const ls of unit.lessons || []) {
      const before = ls.vocab.map(v => v.t).join("|");
      ls.vocab = ls.vocab.filter(v => {
        const w = ov.words[v.t];
        if (w && w.drop) { st.drop++; return false; }
        return true;
      });
      for (const v of ls.vocab) {
        const w = ov.words[v.t];
        if (w) {
          if (w.m) { v.m = w.m; st.m++; }
          if (w.r) { v.r = w.r; st.r++; }
          if (w.t) { v.t = w.t; st.t++; }
        }
        if (Array.isArray(v.ex)) {
          v.ex = v.ex.filter(e => {
            const x = ov.examples[e.t];
            if (x && x.drop) { st.exDrop++; return false; }
            return true;
          });
          for (const e of v.ex) {
            const x = ov.examples[e.t];
            if (x && x.tr) { e.tr = x.tr; st.exTr++; }
          }
          if (!v.ex.length) delete v.ex;
        }
      }
      if (ls.vocab.map(v => v.t).join("|") !== before) retitle(ls);
    }
    unit.lessons = (unit.lessons || []).filter(ls => ls.vocab.length);
  }
  level.units = (level.units || []).filter(u => u.lessons.length);
  return st;
}

module.exports = { load, applyToLevel };
