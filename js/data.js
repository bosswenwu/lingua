/* ==========================================================================
   Lingua · 课程索引与查询工具
   把三套语言课程组装成一个可查询的结构
   ========================================================================== */
(function () {
  var LANGS = [window.COURSES_EN, window.COURSES_JA, window.COURSES_KO].filter(Boolean);
  var INDEX = {};      // lessonId -> { lesson, lang, level, unit }
  var ORDER = [];      // 全局顺序，用于"下一课"
  var LANG_INDEX = {}; // langCode -> lang
  var COUNT = {};

  LANGS.forEach(function (lang) {
    LANG_INDEX[lang.code] = lang;
    var n = 0;
    (lang.levels || []).forEach(function (level) {
      (level.units || []).forEach(function (unit) {
        (unit.lessons || []).forEach(function (lesson) {
          lesson._lang = lang.code;
          lesson._levelId = level.id;
          lesson._levelBadge = level.badge;
          lesson._unitId = unit.id;
          lesson._unitName = unit.name;
          lesson._levelName = level.name;
          lesson._counts = {
            vocab: (lesson.vocab || []).length,
            grammar: (lesson.grammar || []).reduce(function (a, g) { return a + (g.drills || []).length; }, 0),
            listening: (lesson.listening || []).length,
            speaking: (lesson.speaking || []).length
          };
          INDEX[lesson.id] = { lesson: lesson, lang: lang, level: level, unit: unit };
          ORDER.push(lesson.id);
          n++;
        });
      });
    });
    COUNT[lang.code] = n;
  });

  var MODES = [
    { key: "vocab", name: "单词记忆", icon: "cards", tip: "翻卡记忆，标记认识与不认识" },
    { key: "grammar", name: "语法练习", icon: "pen", tip: "选择正确形式，即时看解析" },
    { key: "listening", name: "听力训练", icon: "ear", tip: "听音频后回答理解题" },
    { key: "speaking", name: "口语跟读", icon: "mic", tip: "朗读句子，实时评分反馈" }
  ];

  function lessonOf(id) { return INDEX[id]; }

  function nextLessonId(id) {
    var i = ORDER.indexOf(id);
    if (i < 0) return null;
    return i + 1 < ORDER.length ? ORDER[i + 1] : null;
  }

  function prevLessonId(id) {
    var i = ORDER.indexOf(id);
    return i > 0 ? ORDER[i - 1] : null;
  }

  function lessonsOfLang(code) {
    return ORDER.filter(function (id) { return INDEX[id].lang.code === code; });
  }

  function firstLessonOfLang(code) {
    var ids = lessonsOfLang(code);
    return ids.length ? ids[0] : null;
  }

  function stats() {
    return {
      languages: LANGS.length,
      lessons: ORDER.length,
      exercises: LANGS.reduce(function (a, l) {
        return a + lessonsOfLang(l.code).reduce(function (b, id) {
          var c = INDEX[id].lesson._counts;
          return b + c.vocab + c.grammar + c.listening + c.speaking;
        }, 0);
      }, 0)
    };
  }

  window.DATA = {
    languages: LANGS,
    langIndex: LANG_INDEX,
    lessonIndex: INDEX,
    order: ORDER,
    countByLang: COUNT,
    MODES: MODES,
    lessonOf: lessonOf,
    nextLessonId: nextLessonId,
    prevLessonId: prevLessonId,
    lessonsOfLang: lessonsOfLang,
    firstLessonOfLang: firstLessonOfLang,
    stats: stats
  };
})();