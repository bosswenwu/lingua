/* 把分级词表写成产物：data/{lang}/{level}.json + js/data-{lang}-ext.js */
const path = require("path");
const U = require("./util");
const W = require("./words");

function writeOutputs(lang, byLevel, quiet) {
  const tree = W.materialize(lang, byLevel);

  for (const lv of tree.levels) {
    U.writeJson(path.join(U.DATA, lang, lv.id.replace(lang + "-", "") + ".json"), lv, false);
  }
  const js = "/* 自动生成，请勿手改。来源见 scripts/build-content/SOURCES.md */\n" +
    "window.COURSES_" + lang.toUpperCase() + "_EXT = " + JSON.stringify(tree) + ";\n";
  U.writeText(path.join(U.ROOT, "js", "data-" + lang + "-ext.js"), js);

  const lessons = tree.levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.lessons.length, 0), 0);
  const words = tree.levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.lessons.reduce((c, s) => c + s.vocab.length, 0), 0), 0);
  if (!quiet) {
    U.log("  → " + lang + ": " + tree.levels.length + " 级 / " + lessons + " 课 / " + words + " 词  [" +
      tree.levels.map(l => l.badge + ":" + l.target).join(" ") + "]");
  }
  return { lang, lessons, words, levels: tree.levels.map(l => l.badge + ":" + l.target) };
}

module.exports = { writeOutputs };
