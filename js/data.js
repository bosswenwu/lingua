/* ==========================================================================
   Lingua · 课程索引与查询工具
   课程数据「按需懒加载」：
     · data/summary.json      语言元数据 + 各级别规模（约 2KB，首页先加载）
     · js/data-{lang}.js      手写主线课程，注入 <script> 后挂到 window.COURSES_{LANG}
     · data/{lang}/{level}.json  自动生成的扩展课程，按级别 fetch
   查询工具只作用于「已加载」的数据；统计/语言列表在未加载时回落摘要。
   ========================================================================== */
(function () {
  /* 语言固定顺序，保证全局课序与旧版一致（en → ja → ko） */
  var LANG_ORDER = ["en", "ja", "ko"];
  var LANG_KEYS = { en: "EN", ja: "JA", ko: "KO" };
  var LEVEL_IDS = ["a1", "a2", "b1", "b2"];   // 兜底级别顺序

  /* ---------------- 运行时状态 ---------------- */
  var LANGS = [];          // 语言条目（摘要桩或真实课程树），按 LANG_ORDER
  var LANG_INDEX = {};     // code -> 条目
  var INDEX = {};          // lessonId -> { lesson, lang, level, unit }（仅已加载级别）
  var ORDER = [];          // 全局顺序，用于"下一课"
  var COUNT = {};          // code -> 课数（未加载时回落摘要总数）

  var SUMMARY_INDEX = {};  // code -> 摘要条目（元数据 + 规模）
  var SUMMARY_TOTAL = {};  // code -> { lessons, words, exercises }
  var LEVEL_PLAN = {};     // code -> [levelId]
  var REAL_INDEX = {};     // code -> 真实课程树（已加载手写课程）

  var LOADED = {};         // code -> true
  var LOADED_LEVELS = {};  // code -> { levelId: true }
  var PENDING_LANG = {};   // code -> Promise
  var PENDING_LEVEL = {};  // "code|levelId" -> Promise
  var SUMMARY_READY = false, SUMMARY_PROMISE = null;

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

  function realLangs() {
    return LANG_ORDER.map(function (c) { return REAL_INDEX[c]; }).filter(Boolean);
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

  /* 统计：已加载语言按真实数据，未加载语言回落摘要总数 */
  function stats() {
    var languages = 0, lessons = 0, exercises = 0;
    LANG_ORDER.forEach(function (code) {
      var real = REAL_INDEX[code], tot = SUMMARY_TOTAL[code];
      if (!real && !tot) return;
      languages++;
      if (real) {
        lessons += COUNT[code] || 0;
        lessonsOfLang(code).forEach(function (id) {
          var c = INDEX[id].lesson._counts;
          exercises += c.vocab + c.grammar + c.listening + c.speaking;
        });
      } else {
        lessons += tot.lessons;
        exercises += tot.exercises;
      }
    });
    return { languages: languages, lessons: lessons, exercises: exercises };
  }

  /* 例句统一适配：手写课是纯字符串，生成课是 [{t,tr}]；返回「句子 —— 译文」或句子 */
  function exText(v) {
    var e = v && v.ex;
    if (!e) return "";
    if (typeof e === "string") return e;
    var a = e[0];
    return a && a.t ? (a.t + (a.tr ? " —— " + a.tr : "")) : "";
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
    var langs = realLangs();   // 只对已加载语言出题
    /* 每门语言的释义去重池（预建一次，避免逐个词全量扫描） */
    var meaningsByLang = {};
    langs.forEach(function (lang) {
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

    langs.forEach(function (lang) {
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
            speakText: v.t, opts: opts, a: opts.indexOf(v.m), why: exText(v)
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
    realLangs().forEach(function (lang) {
      if (langCode && lang.code !== langCode) return;
      (lang.levels || []).forEach(function (level) {
        (level.units || []).forEach(function (unit) {
          (unit.lessons || []).forEach(function (ls) {
            (ls.vocab || []).forEach(function (v, i) {
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

  /* 重建 LANGS / LANG_INDEX / INDEX / ORDER / COUNT，并同步到 window.DATA */
  function rebuild() {
    LANGS = []; LANG_INDEX = {}; INDEX = {}; ORDER = []; COUNT = {};
    LANG_ORDER.forEach(function (code) {
      var real = REAL_INDEX[code];
      var entry = real || SUMMARY_INDEX[code];
      if (!entry) return;
      LANG_INDEX[code] = entry;
      LANGS.push(entry);
      var n = 0;
      if (real) {
        (real.levels || []).forEach(function (level) {
          (level.units || []).forEach(function (unit) {
            /* 来源标记：手写单元默认 main，生成单元已在 applyGenLevel 标记为 ext */
            if (!unit.group) unit.group = "main";
            (unit.lessons || []).forEach(function (lesson) {
              if (INDEX[lesson.id]) return; // 去重保护
              lesson._lang = code;
              lesson._levelId = level.id;
              lesson._levelBadge = level.badge;
              lesson._unitId = unit.id;
              lesson._unitName = unit.name;
              lesson._levelName = level.name;
              lesson._counts = countsOf(lesson, real);
              INDEX[lesson.id] = { lesson: lesson, lang: real, level: level, unit: unit };
              ORDER.push(lesson.id);
              n++;
            });
          });
        });
      }
      COUNT[code] = real ? n : ((SUMMARY_TOTAL[code] && SUMMARY_TOTAL[code].lessons) || 0);
    });
    if (DATA) {
      DATA.languages = LANGS;
      DATA.langIndex = LANG_INDEX;
      DATA.lessonIndex = INDEX;
      DATA.order = ORDER;
      DATA.countByLang = COUNT;
    }
  }

  /* ======================================================================
     懒加载：脚本注入 / JSON 拉取（可被测试沙箱替换）
     ====================================================================== */
  function defaultLoadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("课程数据加载失败：" + url)); };
      document.head.appendChild(s);
    });
  }

  function defaultFetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r || !r.ok) throw new Error("课程数据加载失败：" + url);
      return r.json();
    });
  }

  /* 摘要：语言元数据 + 各级别规模（首页只加载这一个 JSON） */
  function ensureSummary() {
    if (SUMMARY_READY) return Promise.resolve(SUMMARY_INDEX);
    if (SUMMARY_PROMISE) return SUMMARY_PROMISE;
    SUMMARY_PROMISE = DATA._fetchJson("data/summary.json").then(function (json) {
      var langs = (json && json.langs) || {};
      Object.keys(langs).forEach(function (code) {
        var e = langs[code];
        if (!e) return;
        var plan = [];
        e.levels = (e.levels || []).map(function (l) {
          plan.push(l.id);
          return { id: l.id, badge: l.badge, name: l.name, lessons: l.lessons || 0, words: l.words || 0 };
        });
        LEVEL_PLAN[code] = plan.length ? plan : LEVEL_IDS.map(function (x) { return code + "-" + x; });
        SUMMARY_INDEX[code] = e;
        SUMMARY_TOTAL[code] = { lessons: e.lessons || 0, words: e.words || 0, exercises: e.exercises || 0 };
      });
      SUMMARY_READY = true;
      rebuild();
      return SUMMARY_INDEX;
    }).catch(function (err) {
      SUMMARY_PROMISE = null;
      throw err;
    });
    return SUMMARY_PROMISE;
  }

  /* 该语言的级别清单（优先摘要规划，保证四级齐全） */
  function levelIds(code) {
    if (LEVEL_PLAN[code]) return LEVEL_PLAN[code];
    return LEVEL_IDS.map(function (x) { return code + "-" + x; });
  }

  /* 确保某语言的手写课程已加载（只加载一次） */
  function ensureLang(code) {
    if (!LANG_KEYS[code]) return Promise.resolve(null);
    if (REAL_INDEX[code]) return Promise.resolve(REAL_INDEX[code]);
    if (PENDING_LANG[code]) return PENDING_LANG[code];
    var key = LANG_KEYS[code];
    var existing = window["COURSES_" + key];
    if (existing) return Promise.resolve(registerLang(code, existing));
    PENDING_LANG[code] = DATA._loadScript("js/data-" + code + ".js").then(function () {
      var lang = window["COURSES_" + key];
      if (!lang) throw new Error("缺少课程数据：" + code);
      return registerLang(code, lang);
    }).catch(function (err) {
      PENDING_LANG[code] = null;
      throw err;
    });
    return PENDING_LANG[code];
  }

  function registerLang(code, lang) {
    REAL_INDEX[code] = lang;
    LOADED[code] = true;
    LOADED_LEVELS[code] = LOADED_LEVELS[code] || {};
    rebuild();
    return lang;
  }

  /* 把生成的级别合并进手写语言：手写 units 在前，生成 units 追加在后 */
  function applyGenLevel(code, json) {
    var lang = REAL_INDEX[code];
    if (!lang || !json) return;
    var target = null;
    (lang.levels || []).forEach(function (l) { if (l.id === json.id) target = l; });
    if (!target) {
      target = { id: json.id, name: json.name, badge: json.badge, target: json.target, goal: json.goal, units: [] };
      lang.levels.push(target);
    }
    (json.units || []).forEach(function (u) {
      u.group = "ext";   // 生成单元来源标记
      target.units.push(u);
    });
  }

  /* 确保某语言的某个级别（生成数据）已加载，幂等 */
  function ensureLevel(code, levelId) {
    if (!LANG_KEYS[code] || !levelId) return Promise.resolve(null);
    LOADED_LEVELS[code] = LOADED_LEVELS[code] || {};
    if (LOADED_LEVELS[code][levelId]) return Promise.resolve(null);
    var pkey = code + "|" + levelId;
    if (PENDING_LEVEL[pkey]) return PENDING_LEVEL[pkey];
    PENDING_LEVEL[pkey] = ensureLang(code).then(function () {
      if (LOADED_LEVELS[code][levelId]) return null;
      var prefix = code + "-";
      var file = levelId.indexOf(prefix) === 0 ? levelId.slice(prefix.length) : levelId;
      return DATA._fetchJson("data/" + code + "/" + file + ".json").then(function (json) {
        if (json) applyGenLevel(code, json);
      }, function () {
        /* 该级别无生成数据（或缺文件）：跳过，页面不因单级失败而中断 */
      });
    }).then(function () {
      LOADED_LEVELS[code][levelId] = true;
      rebuild();
      return null;
    }).catch(function (err) {
      PENDING_LEVEL[pkey] = null;
      throw err;
    });
    return PENDING_LEVEL[pkey];
  }

  /* 确保某一课所属的语言与级别已加载（手写课只需语言） */
  function ensureLesson(lessonId) {
    if (!lessonId) return Promise.resolve(null);
    var code = String(lessonId).split("-")[0];
    if (!LANG_KEYS[code]) return Promise.resolve(null);
    return ensureLang(code).then(function () {
      var m = /^([a-z]{2})-(a1|a2|b1|b2)-/.exec(String(lessonId));
      if (!m) return null;
      return ensureLevel(m[1], m[1] + "-" + m[2]);
    });
  }

  function isLangLoaded(code) { return !!LOADED[code]; }
  function loadedLangs() { return LANG_ORDER.filter(function (c) { return !!LOADED[c]; }); }
  function isSummaryLoaded() { return SUMMARY_READY; }

  var DATA = window.DATA = {
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
    exText: exText,
    challengePool: challengePool,
    glossary: glossary,
    ensureSummary: ensureSummary,
    ensureLang: ensureLang,
    ensureLevel: ensureLevel,
    ensureLesson: ensureLesson,
    levelIds: levelIds,
    isLangLoaded: isLangLoaded,
    loadedLangs: loadedLangs,
    isSummaryLoaded: isSummaryLoaded,
    _loadScript: defaultLoadScript,
    _fetchJson: defaultFetchJson
  };
})();
