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

  /* ---------------- 限时挑战题库 ----------------
     从词汇 / 语法 / 听力三类内容中抽取选择题，词汇题自动生成干扰项 */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function challengePool(codes) {
    var pool = [];
    var vocabMeanings = {};
    LANGS.forEach(function (lang) {
      vocabMeanings[lang.code] = [];
      lessonsOfLang(lang.code).forEach(function (id) {
        INDEX[id].lesson.vocab.forEach(function (v) { vocabMeanings[lang.code].push(v.m); });
      });
    });
    LANGS.forEach(function (lang) {
      if (codes && codes.length && codes.indexOf(lang.code) < 0) return;
      lessonsOfLang(lang.code).forEach(function (id) {
        var ls = INDEX[id].lesson;
        ls.vocab.forEach(function (v) {
          var distract = shuffle(vocabMeanings[lang.code].filter(function (m) { return m !== v.m; })).slice(0, 2);
          if (distract.length < 2) return;
          var opts = shuffle([v.m].concat(distract));
          pool.push({
            kind: "vocab", lang: lang.code, locale: lang.locale,
            prompt: v.t, sub: (v.r ? v.r + " · " : "") + "选出正确释义",
            speakText: v.t, opts: opts, a: opts.indexOf(v.m), why: v.ex || ""
          });
        });
        ls.grammar.forEach(function (g) {
          g.drills.forEach(function (d) {
            pool.push({
              kind: "grammar", lang: lang.code, locale: lang.locale,
              prompt: d.q, sub: "语法 · " + g.point,
              opts: d.opts.slice(), a: d.a, why: d.why || ""
            });
          });
        });
        ls.listening.forEach(function (li) {
          pool.push({
            kind: "listening", lang: lang.code, locale: lang.locale,
            prompt: li.q, sub: "听力 · 先听录音再作答", speakText: li.text,
            opts: li.opts.slice(), a: li.a, why: li.text + " —— " + li.tr
          });
        });
      });
    });
    return pool;
  }

  /* ---------------- 词汇库 ---------------- */
  function glossary(langCode) {
    var out = [];
    LANGS.forEach(function (lang) {
      if (langCode && lang.code !== langCode) return;
      lang.levels.forEach(function (level) {
        level.units.forEach(function (unit) {
          unit.lessons.forEach(function (ls) {
            ls.vocab.forEach(function (v, i) {
              out.push({
                key: ls.id + "#" + i, t: v.t, r: v.r, m: v.m, ex: v.ex,
                lang: lang.code, level: level.badge, lessonId: ls.id, lessonTitle: ls.title
              });
            });
          });
        });
      });
    });
    return out;
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
    stats: stats,
    shuffle: shuffle,
    challengePool: challengePool,
    glossary: glossary
  };
})();