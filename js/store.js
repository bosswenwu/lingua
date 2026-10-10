/* ==========================================================================
   Lingua · 数据层
   注册登录 / 学习进度 / 成就 / 社区 —— 全部持久化在 localStorage
   ========================================================================== */
(function () {
  var PREFIX = "lingua.v1.";
  var memory = {};
  var canStore = (function () {
    try { localStorage.setItem(PREFIX + "probe", "1"); localStorage.removeItem(PREFIX + "probe"); return true; }
    catch (e) { return false; }
  })();

  function read(key, fallback) {
    try {
      var raw = canStore ? localStorage.getItem(PREFIX + key) : memory[key];
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    var raw = JSON.stringify(val);
    if (canStore) { try { localStorage.setItem(PREFIX + key, raw); } catch (e) { memory[key] = raw; } }
    else memory[key] = raw;
  }

  /* ---------------- 工具 ---------------- */
  function uid(p) { return (p || "id") + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return "h" + h.toString(36);
  }
  function dateKey(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function daysBetween(aKey, bKey) {
    var a = new Date(aKey + "T00:00:00"), b = new Date(bKey + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }
  function todayKey() { return dateKey(new Date()); }
  function relTime(ts) {
    var diff = Date.now() - ts;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return Math.floor(diff / 60000) + " 分钟前";
    if (diff < 86400000) return Math.floor(diff / 3600000) + " 小时前";
    if (diff < 604800000) return Math.floor(diff / 86400000) + " 天前";
    return dateKey(new Date(ts));
  }

  /* ---------------- 成就定义 ---------------- */
  var BADGES = [
    { id: "first_step", name: "初次启程", icon: "🌱", desc: "完成第一节课", target: 1, get: function (s) { return s.lessonsDone; } },
    { id: "streak3", name: "三日不辍", icon: "🔥", desc: "连续学习 3 天", target: 3, get: function (s) { return s.bestStreak; } },
    { id: "streak7", name: "七日成习", icon: "🗓️", desc: "连续学习 7 天", target: 7, get: function (s) { return s.bestStreak; } },
    { id: "xp500", name: "小有所成", icon: "⭐", desc: "累计获得 500 经验", target: 500, get: function (s) { return s.xp; } },
    { id: "xp2000", name: "学海无涯", icon: "🏅", desc: "累计获得 2000 经验", target: 2000, get: function (s) { return s.xp; } },
    { id: "words50", name: "单词猎人", icon: "📖", desc: "掌握 50 个单词", target: 50, get: function (s) { return s.wordsMastered; } },
    { id: "grammar_ace", name: "语法达人", icon: "✏️", desc: "完成 30 道语法题且正确率 ≥ 85%", target: 30, get: function (s) { return s.skills.grammar.total >= 30 && s.skills.grammar.acc >= 0.85 ? 30 : s.skills.grammar.total; } },
    { id: "good_ear", name: "听力之耳", icon: "👂", desc: "完成 20 道听力题", target: 20, get: function (s) { return s.skills.listening.total; } },
    { id: "speaker", name: "口语新星", icon: "🎙️", desc: "完成 15 次跟读", target: 15, get: function (s) { return s.skills.speaking.total; } },
    { id: "ten_lessons", name: "十课之功", icon: "🎯", desc: "累计完成 10 节课", target: 10, get: function (s) { return s.lessonsDone; } },
    { id: "polyglot", name: "多语学者", icon: "🌍", desc: "在 2 门语言中都有学习记录", target: 2, get: function (s) { return s.langsTouched; } },
    { id: "social", name: "社区活跃", icon: "💬", desc: "发布 3 条社区动态", target: 3, get: function (s) { return s.posts; } },
    { id: "reviewer", name: "知错就改", icon: "🩹", desc: "在错题本中攻克 10 道错题", target: 10, get: function (s) { return s.mistakesFixed; } },
    { id: "challenger", name: "限时挑战者", icon: "⏱️", desc: "完成 5 次限时挑战", target: 5, get: function (s) { return s.challengePlays; } },
    { id: "combo10", name: "连击高手", icon: "⚡", desc: "单次限时挑战达成 10 连击", target: 10, get: function (s) { return s.bestCombo; } }
  ];

  /* ---------------- 演示数据 ---------------- */
  var NPC = [
    { name: "林小满", xp: 3120, langs: ["ja", "en"] },
    { name: "陈屿", xp: 2680, langs: ["en"] },
    { name: "佐藤 健", xp: 2240, langs: ["ko", "en"] },
    { name: "周叙白", xp: 1730, langs: ["ja"] },
    { name: "김민서", xp: 1410, langs: ["ko"] },
    { name: "苏晚", xp: 980, langs: ["en", "ko"] },
    { name: "何一诺", xp: 620, langs: ["ja"] }
  ];

  function seedPosts() {
    var now = Date.now(), H = 3600000;
    return [
      {
        id: "p_seed1", userId: "npc1", authorName: "林小满", avatarVar: 2, lang: "ja", tags: ["日语", "口语"],
        text: "今天终于把「て形」的口诀记住了：う・つ・る → って，む・ぶ・ぬ → んで，く → いて，ぐ → いで。口语跟读练到 92 分，超有成就感！",
        createdAt: now - 2 * H, likes: ["npc2", "npc3"], comments: [
          { id: "c1", userId: "npc3", authorName: "佐藤 健", avatarVar: 4, text: "还有一种记法：唱歌的「歌う」变成「歌って」，读两遍就顺了。", createdAt: now - H }
        ]
      },
      {
        id: "p_seed2", userId: "npc4", authorName: "周叙白", avatarVar: 5, lang: "en", tags: ["英语", "职场"],
        text: "B1 里「in my opinion / on the other hand / however」这一组连接词，用在外企周会里真的很加分。今天把听力全对，推荐大家先过一遍 A2 再来。",
        createdAt: now - 26 * H, likes: [], comments: []
      },
      {
        id: "p_seed3", userId: "npc5", authorName: "김민서", avatarVar: 3, lang: "ko", tags: ["韩语", "语法"],
        text: "韩语的 은/는 和 이/가 我纠结了两周，最后用「은/는 谈主题，이/가 报新信息」这句话就通了。大家有别的口诀吗？",
        createdAt: now - 50 * H, likes: ["npc1"], comments: [
          { id: "c2", userId: "npc1", authorName: "林小满", avatarVar: 2, text: "我记的是：有收音用 은 / 이，没收音用 는 / 가。", createdAt: now - 49 * H }
        ]
      }
    ];
  }

  /* ---------------- 初始化 ---------------- */
  if (!read("users", null)) { write("users", []); }
  if (!read("posts", null)) { write("posts", seedPosts()); }

  function users() { return read("users", []); }
  function saveUsers(list) { write("users", list); }
  function posts() { return read("posts", []); }
  function savePosts(list) { write("posts", list); }

  /* ---------------- 用户与会话 ---------------- */
  function currentUser() {
    var id = read("session", null);
    if (!id) return null;
    var u = users().filter(function (x) { return x.id === id; })[0];
    if (!u) { write("session", null); return null; }
    return u;
  }

  function register(data) {
    var list = users();
    var email = (data.email || "").trim().toLowerCase();
    if (!data.name || !data.name.trim()) return { error: "请填写昵称" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "请输入有效的邮箱地址" };
    if ((data.password || "").length < 6) return { error: "密码至少 6 位" };
    if (list.some(function (u) { return u.email === email; })) return { error: "该邮箱已注册，请直接登录" };

    var user = {
      id: uid("u"),
      name: data.name.trim(),
      email: email,
      pass: hash(data.password),
      avatarVar: 1 + (list.length % 5),
      createdAt: Date.now(),
      targetLangs: data.targetLangs && data.targetLangs.length ? data.targetLangs : ["en"],
      level: data.level || "A1",
      dailyGoal: data.dailyGoal || 30,
      bio: ""
    };
    list.push(user);
    saveUsers(list);
    write("session", user.id);
    ensureProgress(user.id, user.targetLangs);
    return { user: user };
  }

  function login(email, password) {
    var u = users().filter(function (x) { return x.email === (email || "").trim().toLowerCase(); })[0];
    if (!u) return { error: "该邮箱还没有注册" };
    if (u.pass !== hash(password || "")) return { error: "密码不正确" };
    write("session", u.id);
    ensureProgress(u.id, u.targetLangs);
    return { user: u };
  }

  function logout() { write("session", null); }

  function updateUser(patch) {
    var u = currentUser();
    if (!u) return null;
    var list = users().map(function (x) { return x.id === u.id ? Object.assign({}, x, patch) : x; });
    saveUsers(list);
    return currentUser();
  }

  /* ---------------- 进度 ---------------- */
  function blankProgress() {
    return {
      xp: 0,
      streak: { count: 0, last: null },
      bestStreak: 0,
      days: {},
      lessons: {},
      skills: {
        vocab: { total: 0, correct: 0 },
        grammar: { total: 0, correct: 0 },
        listening: { total: 0, correct: 0 },
        speaking: { total: 0, correct: 0, scoreSum: 0 }
      },
      vocabBox: {},   // "lessonId#idx" -> { box, seen, correct, next }
      posts: 0,
      badges: [],
      langsTouched: [],
      mistakes: [],        // 错题本 [{ id, lang, mode, lessonId, prompt, opts, answer, why, text, tr, at }]
      mistakesFixed: 0,    // 重练答对累计
      challenge: { plays: 0, best: 0, bestCombo: 0 }  // 限时挑战
    };
  }
  function migrate(p) {
    if (!p.mistakes) p.mistakes = [];
    if (typeof p.mistakesFixed !== "number") p.mistakesFixed = 0;
    if (!p.challenge) p.challenge = { plays: 0, best: 0, bestCombo: 0 };
    return p;
  }
  function ensureProgress(userId, langs) {
    var p = read("progress." + userId, null);
    if (!p) { p = blankProgress(); write("progress." + userId, p); }
    else { p = migrate(p); write("progress." + userId, p); }
    return p;
  }
  function progress() {
    var u = currentUser();
    if (!u) return blankProgress();
    return ensureProgress(u.id);
  }
  function saveProgress(p) {
    var u = currentUser();
    if (!u) return;
    write("progress." + u.id, p);
  }

  function touchDay(p, xp) {
    var t = todayKey();
    p.days[t] = (p.days[t] || 0) + xp;
    if (p.streak.last !== t) {
      var gap = p.streak.last ? daysBetween(p.streak.last, t) : null;
      p.streak.count = gap === 1 ? p.streak.count + 1 : 1;
      p.streak.last = t;
    }
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak.count);
    // 活跃度连续性：今天没学则视为中断（渲染层处理）
    if (p.streak.last && daysBetween(p.streak.last, t) > 1 && p.streak.last !== t) {
      p.streak.count = 1; p.streak.last = t;
    }
  }

  /* 单词盒：0 陌生 → 4 熟练 */
  function updateVocabBox(p, lessonId, idx, known) {
    var key = lessonId + "#" + idx;
    var item = p.vocabBox[key] || { box: 0, seen: 0, correct: 0 };
    item.seen += 1;
    if (known) { item.correct += 1; item.box = Math.min(4, item.box + 1); }
    else { item.box = Math.max(0, item.box - 1); }
    var gaps = [0, 1, 3, 7, 16];
    item.next = addDays(new Date(), gaps[item.box]).getTime();
    p.vocabBox[key] = item;
  }

  function recordSkill(p, mode, correct) {
    var s = p.skills[mode];
    if (!s) s = p.skills[mode] = { total: 0, correct: 0 };
    s.total += 1;
    if (correct) s.correct += 1;
  }

  /* ---------------- 错题本 ---------------- */
  function recordMistake(p, m) {
    if (!p.mistakes) p.mistakes = [];
    var key = m.lang + "|" + m.mode + "|" + m.prompt;
    var dup = p.mistakes.filter(function (x) { return (x.lang + "|" + x.mode + "|" + x.prompt) === key; })[0];
    if (dup) { dup.at = Date.now(); return dup; }
    var item = {
      id: uid("m"),
      lang: m.lang, mode: m.mode, lessonId: m.lessonId || "",
      prompt: m.prompt, opts: m.opts || [], answer: m.answer,
      why: m.why || "", text: m.text || "", tr: m.tr || "",
      at: Date.now()
    };
    p.mistakes.unshift(item);
    if (p.mistakes.length > 120) p.mistakes = p.mistakes.slice(0, 120);
    return item;
  }
  function mistakes() { return (progress().mistakes || []).slice(); }
  function resolveMistake(id) {
    var p = progress();
    var before = p.mistakes.length;
    p.mistakes = p.mistakes.filter(function (x) { return x.id !== id; });
    if (p.mistakes.length < before) { p.mistakesFixed = (p.mistakesFixed || 0) + 1; saveProgress(p); }
    return evaluateBadges();
  }
  function removeMistake(id) {
    var p = progress();
    p.mistakes = p.mistakes.filter(function (x) { return x.id !== id; });
    saveProgress(p);
  }
  function clearMistakes() {
    var p = progress();
    p.mistakes = [];
    saveProgress(p);
  }

  /* ---------------- 限时挑战 ---------------- */
  function saveChallengeResult(gain, combo) {
    var p = progress();
    var c = p.challenge || (p.challenge = { plays: 0, best: 0, bestCombo: 0 });
    c.plays += 1;
    var isRecord = gain > c.best;
    c.best = Math.max(c.best, gain);
    c.bestCombo = Math.max(c.bestCombo, combo);
    addXp(p, gain);
    saveProgress(p);
    var badges = evaluateBadges();
    return { best: c.best, isRecord: isRecord, badges: badges, plays: c.plays };
  }

  function addXp(p, amount) {
    amount = Math.max(0, Math.round(amount));
    p.xp += amount;
    touchDay(p, amount);
    return amount;
  }

  /* 计算派生统计 */
  function stats() {
    var p = progress();
    var lessonsDone = 0, scoreSum = 0, scoreCount = 0, wordsMastered = 0;
    var perLang = {};
    Object.keys(p.lessons).forEach(function (id) {
      var rec = p.lessons[id];
      var info = window.DATA.lessonOf(id);
      if (!info) return;
      var code = info.lang.code;
      perLang[code] = perLang[code] || { done: 0, xp: 0, total: 0, scoreSum: 0, scoreCount: 0 };
      perLang[code].total += 1;
      if (rec.done) {
        lessonsDone++;
        perLang[code].done += 1;
        if (typeof rec.best === "number") { scoreSum += rec.best; scoreCount++; perLang[code].scoreSum += rec.best; perLang[code].scoreCount++; }
      }
      perLang[code].xp += rec.xp || 0;
    });
    Object.keys(p.vocabBox).forEach(function (k) { if (p.vocabBox[k].box >= 3) wordsMastered++; });
    var sk = p.skills;
    function acc(s) { return s.total ? s.correct / s.total : 0; }
    return {
      xp: p.xp,
      streak: p.streak.count,
      bestStreak: p.bestStreak || 0,
      lessonsDone: lessonsDone,
      avgScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
      wordsMastered: wordsMastered,
      wordsSeen: Object.keys(p.vocabBox).length,
      posts: p.posts,
      days: p.days,
      todayXp: p.days[todayKey()] || 0,
      perLang: perLang,
      langsTouched: Object.keys(perLang).filter(function (c) { return perLang[c].done > 0 || perLang[c].xp > 0; }).length,
      mistakes: (p.mistakes || []).length,
      mistakesFixed: p.mistakesFixed || 0,
      challengePlays: p.challenge ? p.challenge.plays : 0,
      bestCombo: p.challenge ? p.challenge.bestCombo : 0,
      challengeBest: p.challenge ? p.challenge.best : 0,
      skills: {
        vocab: { total: sk.vocab.total, correct: sk.vocab.correct, acc: acc(sk.vocab) },
        grammar: { total: sk.grammar.total, correct: sk.grammar.correct, acc: acc(sk.grammar) },
        listening: { total: sk.listening.total, correct: sk.listening.correct, acc: acc(sk.listening) },
        speaking: { total: sk.speaking.total, correct: sk.speaking.correct, acc: acc(sk.speaking), avg: sk.speaking.total ? Math.round(sk.speaking.scoreSum / sk.speaking.total) : 0 }
      },
      lessons: p.lessons,
      vocabBox: p.vocabBox
    };
  }

  function evaluateBadges() {
    var s = stats();
    var p = progress();
    var earned = [];
    BADGES.forEach(function (b) {
      var val = b.get(s) || 0;
      if (val >= b.target && p.badges.indexOf(b.id) < 0) {
        p.badges.push(b.id);
        earned.push(b);
      }
    });
    if (earned.length) saveProgress(p);
    return earned;
  }

  function badgeState() {
    var s = stats();
    var p = progress();
    return BADGES.map(function (b) {
      var val = Math.max(0, Math.min(b.target, b.get(s) || 0));
      return {
        id: b.id, name: b.name, icon: b.icon, desc: b.desc, target: b.target,
        value: val, pct: Math.round(val / b.target * 100),
        earned: p.badges.indexOf(b.id) >= 0
      };
    });
  }

  /* 保存一节课的完整结果 */
  function completeLesson(lessonId, result) {
    var p = progress();
    var info = window.DATA.lessonOf(lessonId);
    if (!info) return { xp: 0, badges: [] };
    var lesson = info.lesson;
    var rec = p.lessons[lessonId] || { done: false, best: 0, attempts: 0, xp: 0, at: 0 };
    var accuracy = result.total ? result.correct / result.total : 0;
    var gained = Math.round(lesson.xp * (0.6 + 0.4 * accuracy));
    var bonus = result.perfect ? 10 : 0;
    // 重复学习只给 30% 经验，防止刷分
    var isRepeat = rec.done;
    if (isRepeat) gained = Math.round(gained * 0.3);
    rec.attempts += 1;
    rec.done = true;
    rec.best = Math.max(rec.best || 0, Math.round(accuracy * 100));
    rec.xp += gained;
    rec.at = Date.now();
    rec.modes = Object.assign({}, rec.modes, result.modes || {});
    p.lessons[lessonId] = rec;
    addXp(p, gained + bonus);
    if (!isRepeat) { /* 首次完成，纪录触达的语言 */ }
    saveProgress(p);
    var badges = evaluateBadges();
    return { xp: gained + bonus, bonus: bonus, accuracy: Math.round(accuracy * 100), badges: badges, repeat: isRepeat };
  }

  /* ---------------- 社区 ---------------- */
  function feed() {
    var u = currentUser();
    var uidNow = u ? u.id : null;
    return posts().slice().sort(function (a, b) { return b.createdAt - a.createdAt; }).map(function (p) {
      return Object.assign({}, p, {
        liked: uidNow ? p.likes.indexOf(uidNow) >= 0 : false,
        likeCount: p.likes.length,
        mine: uidNow ? p.userId === uidNow : false
      });
    });
  }

  function addPost(text, lang, tags) {
    var u = currentUser(); if (!u) return null;
    var list = posts();
    var post = {
      id: uid("p"), userId: u.id, authorName: u.name, avatarVar: u.avatarVar,
      lang: lang || "all", tags: tags || [], text: text.trim(),
      createdAt: Date.now(), likes: [], comments: []
    };
    list.push(post);
    savePosts(list);
    var p = progress(); p.posts += 1; saveProgress(p);
    var badges = evaluateBadges();
    return { post: post, badges: badges };
  }

  function deletePost(id) {
    var u = currentUser(); if (!u) return;
    savePosts(posts().filter(function (p) { return !(p.id === id && p.userId === u.id); }));
  }

  function toggleLike(id) {
    var u = currentUser(); if (!u) return;
    var list = posts().map(function (p) {
      if (p.id !== id) return p;
      var likes = p.likes.slice();
      var i = likes.indexOf(u.id);
      if (i >= 0) likes.splice(i, 1); else likes.push(u.id);
      return Object.assign({}, p, { likes: likes });
    });
    savePosts(list);
  }

  function addComment(id, text) {
    var u = currentUser(); if (!u || !text.trim()) return;
    var list = posts().map(function (p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, {
        comments: p.comments.concat([{ id: uid("c"), userId: u.id, authorName: u.name, avatarVar: u.avatarVar, text: text.trim(), createdAt: Date.now() }])
      });
    });
    savePosts(list);
  }

  /* 排行榜：真实用户 + 演示学习者 */
  function leaderboard() {
    var rows = users().map(function (u) {
      var p = read("progress." + u.id, blankProgress());
      return { id: u.id, name: u.name, avatarVar: u.avatarVar, xp: p.xp, real: true };
    });
    NPC.forEach(function (n, i) {
      rows.push({ id: "npc" + (i + 1), name: n.name, avatarVar: (i % 5) + 1, xp: n.xp, real: false });
    });
    rows.sort(function (a, b) { return b.xp - a.xp; });
    return rows;
  }

  /* ---------------- 导出 ---------------- */
  window.Store = {
    BADGES: BADGES,
    currentUser: currentUser,
    register: register,
    login: login,
    logout: logout,
    updateUser: updateUser,
    progress: progress,
    saveProgress: saveProgress,
    stats: stats,
    badgeState: badgeState,
    completeLesson: completeLesson,
    updateVocabBox: updateVocabBox,
    recordSkill: recordSkill,
    recordMistake: recordMistake,
    mistakes: mistakes,
    resolveMistake: resolveMistake,
    removeMistake: removeMistake,
    clearMistakes: clearMistakes,
    saveChallengeResult: saveChallengeResult,
    feed: feed,
    addPost: addPost,
    deletePost: deletePost,
    toggleLike: toggleLike,
    addComment: addComment,
    leaderboard: leaderboard,
    evaluateBadges: evaluateBadges,
    resetAll: function () {
      if (canStore) {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(PREFIX) === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      }
      memory = {};
      location.hash = "#/";
      location.reload();
    },
    _util: { dateKey: dateKey, addDays: addDays, todayKey: todayKey, relTime: relTime, daysBetween: daysBetween, uid: uid }
  };
})();