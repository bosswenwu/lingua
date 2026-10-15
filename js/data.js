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
    /* 每门语言的释义去重池（预建一次，避免逐个词全量扫描） */
    var meaningsByLang = {};
    LANGS.forEach(function (lang) {
      var seen = {}, arr = [];
      lessonsOfLang(lang.code).forEach(function (id) {
        INDEX[id].lesson.vocab.forEach(function (v) {
          if (v.m && !seen[v.m]) { seen[v.m] = 1; arr.push(v.m); }
        });
      });
      meaningsByLang[lang.code] = arr;
    });

    function distractOf(uniq, m) {
      var out = [], guard = 0, seen = { x: 1 };
      seen[m] = 1;
      while (out.length < 2 && guard < 60) {
        guard++;
        var v = uniq[Math.floor(Math.random() * uniq.length)];
        if (seen[v]) continue;
        seen[v] = 1; out.push(v);
      }
      return out;
    }

    LANGS.forEach(function (lang) {
      if (codes && codes.length && codes.indexOf(lang.code) < 0) return;
      var uniq = meaningsByLang[lang.code] || [];
      lessonsOfLang(lang.code).forEach(function (id) {
        var ls = INDEX[id].lesson;
        ls.vocab.forEach(function (v) {
          if (!v.m) return;
          var distract = distractOf(uniq, v.m);
          if (distract.length < 2) return;
          var opts = shuffle([v.m].concat(distract));
          pool.push({
            kind: "vocab", lang: lang.code, locale: lang.locale,
            prompt: v.t, sub: (v.r ? v.r + " · " : "") + "选出正确释义",
            speakText: v.t, opts: opts, a: opts.indexOf(v.m), why: v.ex || ""
          });
        });
        /* 语法 / 听力：手写题目优先，缺的部分由 Exercise 即时生成 */
        var gen = null;
        if ((!(ls.grammar || []).length || !(ls.listening || []).length) && window.Exercise) {
          gen = window.Exercise.generate(ls, lang);
        }
        var gItems = (ls.grammar || []).length
          ? ls.grammar.reduce(function (acc, g) {
              return acc.concat((g.drills || []).map(function (d) {
                return { q: d.q, opts: d.opts, a: d.a, why: d.why, point: g.point };
              }));
            }, [])
          : (gen ? gen.grammar : []);
        gItems.forEach(function (d) {
          if (!d.opts || d.opts.length < 2 || d.type === "spell") return;
          pool.push({
            kind: "grammar", lang: lang.code, locale: lang.locale,
            prompt: d.q, sub: "语法 · " + d.point,
            opts: d.opts.slice(), a: d.a, why: d.why || ""
          });
        });
        var lItems = (ls.listening || []).length ? ls.listening : (gen ? gen.listening : []);
        lItems.forEach(function (li) {
          if (!li.opts || li.opts.length < 2) return;
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

  /* ======================================================================
     扩展内容合并：js/data-{lang}-ext.js 提供 COURSES_{LANG}_EXT
     把其 units 追加到同名 level 的既有 units 之后，再统一重建索引
     ====================================================================== */
  function mergeExt() {
    [["EN", window.COURSES_EN_EXT], ["JA", window.COURSES_JA_EXT], ["KO", window.COURSES_KO_EXT]]
      .forEach(function (pair) {
        var ext = pair[1];
        if (!ext) return;
        var main = window["COURSES_" + pair[0]];
        if (!main) return;
        (ext.levels || []).forEach(function (lvl) {
          var target = (main.levels || []).filter(function (l) { return l.id === lvl.id; })[0];
          if (!target) { main.levels.push(lvl); return; }
          (lvl.units || []).forEach(function (u) { target.units.push(u); });
        });
      });
  }

  /* 一课的训练量：手写题目优先，缺的部分按词条即时生成 */
  function countsOf(lesson, lang) {
    var g = (lesson.grammar || []).reduce(function (a, x) { return a + (x.drills || []).length; }, 0);
    var li = (lesson.listening || []).length;
    var sp = (lesson.speaking || []).length;
    if ((!g || !li || !sp) && window.Exercise) {
      var gen = window.Exercise.generate(lesson, lang);
      if (!g) g = gen.grammar.length;
      if (!li) li = gen.listening.length;
      if (!sp) sp = gen.speaking.length;
    }
    return { vocab: (lesson.vocab || []).length, grammar: g, listening: li, speaking: sp };
  }

  /* 重建 INDEX/ORDER/COUNT/LANG_INDEX */
  function buildIndex() {
    INDEX = {}; ORDER = []; COUNT = {}; LANG_INDEX = {};
    LANGS = [window.COURSES_EN, window.COURSES_JA, window.COURSES_KO].filter(Boolean);
    LANGS.forEach(function (lang) {
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
            lesson._counts = countsOf(lesson, lang);
            INDEX[lesson.id] = { lesson: lesson, lang: lang, level: level, unit: unit };
            ORDER.push(lesson.id);
            n++;
          });
        });
      });
      COUNT[lang.code] = n;
      LANG_INDEX[lang.code] = lang;
    });
  }

  mergeExt();
  buildIndex();

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