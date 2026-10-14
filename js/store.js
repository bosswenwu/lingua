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
    if (!data.name || !data.name.trim()) return { error: "请填写昵称" };

    var user = {
      id: uid("u"),
      name: data.name.trim(),
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
    /* 继承游客进度：把本机游客档案搬到新档案，再重置游客档案 */
    var guestP = read("progress.guest", null);
    var inherited = false;
    if (guestP && (guestP.xp > 0 || (guestP.lessons && Object.keys(guestP.lessons).length))) {
      write("progress." + user.id, migrate(guestP));
      write("progress.guest", blankProgress());
      inherited = true;
    }
    ensureProgress(user.id, user.targetLangs);
    return { user: user, inherited: inherited };
  }

  /* 本机档案：纯本地，无邮箱与密码；列出并切换到某个档案 */
  function profiles() { return users(); }
  function pickProfile(id) {
    var u = users().filter(function (x) { return x.id === id; })[0];
    if (!u) return { error: "找不到这个本机档案" };
    write("session", u.id);
    ensureProgress(u.id, u.targetLangs);
    return { user: u };
  }
  function removeProfile(id) {
    saveUsers(users().filter(function (x) { return x.id !== id; }));
    if (canStore) { try { localStorage.removeItem(PREFIX + "progress." + id); } catch (e) {} }
    if (read("session", null) === id) write("session", null);
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
      vocabBox: {},
      posts: 0,
      badges: [],
      langsTouched: [],
      mistakes: [],
      mistakesFixed: 0,
      challenge: { plays: 0, best: 0, bestCombo: 0 },
      freezes: 0,                                // 连胜冻结（免费自动功能）
      quests: { date: null, list: [] },
      questProg: { date: null, correct: 0, lessons: 0, challenges: 0, reviewed: 0, words: 0 },
      freeMode: false
    };
  }
  function migrate(p) {
    if (!p.mistakes) p.mistakes = [];
    if (typeof p.mistakesFixed !== "number") p.mistakesFixed = 0;
    if (!p.challenge) p.challenge = { plays: 0, best: 0, bestCombo: 0 };
    if (typeof p.freezes !== "number") p.freezes = 0;
    if (!p.quests) p.quests = { date: null, list: [] };
    if (!p.questProg) p.questProg = { date: null, correct: 0, lessons: 0, challenges: 0, reviewed: 0, words: 0 };
    if (typeof p.freeMode !== "boolean") p.freeMode = false;
    /* 兼容老数据遗留字段（coins/hearts/boosts/badgeRewarded）——忽略 */
    return p;
  }
  function ensureProgress(userId, langs) {
    var p = read("progress." + userId, null);
    if (!p) { p = blankProgress(); write("progress." + userId, p); }
    else { p = migrate(p); write("progress." + userId, p); }
    return p;
  }
  function progressKey() {
    var u = currentUser();
    return "progress." + (u ? u.id : "guest");
  }
  function progress() {
    var key = progressKey();
    var p = read(key, null);
    if (!p) { p = blankProgress(); write(key, p); }
    else migrate(p);
    return p;
  }
  function saveProgress(p) {
    write(progressKey(), p);
  }
  /* 渲染层使用的「当前身份」：未登录时返回游客伪档案 */
  function actor() {
    var u = currentUser();
    if (u) return u;
    return {
      id: "guest", name: "游客学习者", email: "进度保存在本机", avatarVar: 1, guest: true,
      targetLangs: ["en"], level: "A1", dailyGoal: 30, bio: "", createdAt: Date.now()
    };
  }

  function touchDay(p, xp) {
    var t = todayKey();
    p.days[t] = (p.days[t] || 0) + xp;
    if (p.streak.last !== t) {
      var gap = p.streak.last ? daysBetween(p.streak.last, t) : null;
      if (gap === 1) p.streak.count += 1;
      else if (gap === 2 && (p.freezes || 0) > 0) { p.freezes -= 1; /* 消耗连胜冻结，保住连胜 */ }
      else p.streak.count = 1;
      p.streak.last = t;
    }
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak.count);
  }

  /* 单词盒：0 陌生 → 4 熟练 */
  function updateVocabBox(p, lessonId, idx, known) {
    var key = lessonId + "#" + idx;
    var item = p.vocabBox[key] || { box: 0, seen: 0, correct: 0 };
    var firstSeen = item.seen === 0;
    item.seen += 1;
    if (known) { item.correct += 1; item.box = Math.min(4, item.box + 1); }
    else { item.box = Math.max(0, item.box - 1); }
    var gaps = [0, 1, 3, 7, 16];
    item.next = addDays(new Date(), gaps[item.box]).getTime();
    p.vocabBox[key] = item;
    if (firstSeen) bumpQuest(p, "words");
  }

  function recordSkill(p, mode, correct) {
    var s = p.skills[mode];
    if (!s) s = p.skills[mode] = { total: 0, correct: 0 };
    s.total += 1;
    if (correct) { s.correct += 1; bumpQuest(p, "correct"); }
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
    if (p.mistakes.length < before) {
      p.mistakesFixed = (p.mistakesFixed || 0) + 1;
      bumpQuest(p, "reviewed");
      saveProgress(p);
    }
    var quests = checkQuests();
    var badges = evaluateBadges();
    return { badges: badges, quests: quests };
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

  /* ---------------- 单词间隔复习（Leitner：0 陌生 → 4 熟练） ---------------- */
  function vocabDue(limit) {
    var now = Date.now();
    var p = progress();
    var out = [];
    Object.keys(p.vocabBox).forEach(function (k) {
      var it = p.vocabBox[k];
      if (it.next && it.next > now) return;   // 未到期
      var parts = k.split("#");
      var info = window.DATA.lessonOf(parts[0]);
      if (!info) return;
      var v = (info.lesson.vocab || [])[+parts[1]];
      if (!v) return;
      out.push({ key: k, lessonId: parts[0], idx: +parts[1], box: it.box || 0, lang: info.lang.code, vocab: v });
    });
    out.sort(function (a, b) { return a.box - b.box || (a.key < b.key ? -1 : 1); });
    return limit ? out.slice(0, limit) : out;
  }
  function reviewVocab(key, known) {
    var p = progress();
    var parts = key.split("#");
    updateVocabBox(p, parts[0], +parts[1], known);
    saveProgress(p);
    return p.vocabBox[key];
  }
  function vocabSummary() {
    var now = Date.now();
    var p = progress();
    var total = 0, due = 0, mastered = 0;
    Object.keys(p.vocabBox).forEach(function (k) {
      var it = p.vocabBox[k];
      total++;
      if (!it.next || it.next <= now) due++;
      if ((it.box || 0) >= 3) mastered++;
    });
    return { total: total, due: due, mastered: mastered };
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
    bumpQuest(p, "challenges");
    saveProgress(p);
    var quests = checkQuests();
    var badges = evaluateBadges();
    return { best: c.best, isRecord: isRecord, badges: badges, quests: quests, plays: c.plays };
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
      freezes: p.freezes || 0,
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
        addXp(p, 50);
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
    if (!isRepeat) bumpQuest(p, "lessons");
    saveProgress(p);
    var quests = checkQuests();
    var badges = evaluateBadges();
    return { xp: gained + bonus, bonus: bonus, accuracy: Math.round(accuracy * 100), badges: badges, quests: quests, repeat: isRepeat };
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

  /* ---------------- 红心 ---------------- */
  var MAX_HEARTS = 5;
  var HEART_REGEN = 30 * 60000; // 每 30 分钟自然回 1 心
  function refillHearts(p) {
    if (!p.hearts) p.hearts = { n: MAX_HEARTS, ts: Date.now() };
    var h = p.hearts;
    if (h.n >= MAX_HEARTS) { h.n = MAX_HEARTS; h.ts = Date.now(); return h; }
    var regen = Math.floor((Date.now() - h.ts) / HEART_REGEN);
    if (regen > 0) {
      h.n = Math.min(MAX_HEARTS, h.n + regen);
      h.ts += regen * HEART_REGEN;
      if (h.n >= MAX_HEARTS) { h.n = MAX_HEARTS; h.ts = Date.now(); }
    }
    return h;
  }
  function hearts() {
    var p = progress();
    var h = refillHearts(p);
    saveProgress(p);
    return { n: h.n, max: MAX_HEARTS, nextIn: h.n >= MAX_HEARTS ? 0 : Math.max(0, HEART_REGEN - (Date.now() - h.ts)) };
  }
  function loseHeart() {
    var p = progress();
    var h = refillHearts(p);
    if (h.n <= 0) { saveProgress(p); return { n: 0, exhausted: true }; }
    var wasFull = h.n >= MAX_HEARTS;
    h.n -= 1;
    if (wasFull) h.ts = Date.now();
    saveProgress(p);
    return { n: h.n, exhausted: h.n <= 0 };
  }
  function addHearts(n) {
    var p = progress();
    var h = refillHearts(p);
    h.n = Math.min(MAX_HEARTS, h.n + n);
    if (h.n >= MAX_HEARTS) h.ts = Date.now();
    saveProgress(p);
    return h.n;
  }
  function refillAllHearts() {
    var p = progress();
    p.hearts = { n: MAX_HEARTS, ts: Date.now() };
    saveProgress(p);
  }

  /* ---------------- 星币与商店 ---------------- */
  function addCoins(p, n) { p.coins = Math.max(0, (p.coins || 0) + n); return p.coins; }
  function boostMult() { var p = progress(); return p.boosts && p.boosts.xp2until > Date.now() ? 2 : 1; }
  function boostLeft() {
    var p = progress();
    return p.boosts ? Math.max(0, (p.boosts.xp2until || 0) - Date.now()) : 0;
  }
  var SHOP = [
    { id: "heart", name: "红心回满", icon: "❤️", price: 350, desc: "把红心立刻补满到 5 颗，继续上课。" },
    { id: "freeze", name: "连胜冻结", icon: "🧊", price: 200, desc: "断签一天时自动消耗，保住连胜。最多囤 2 个。" },
    { id: "xp2", name: "双倍经验卡", icon: "⚡", price: 150, desc: "15 分钟内，课程与挑战获得的经验翻倍。" }
  ];
  function buy(id) {
    var item = null;
    SHOP.forEach(function (x) { if (x.id === id) item = x; });
    if (!item) return { ok: false, msg: "没有这个商品" };
    var p = progress();
    if ((p.coins || 0) < item.price) return { ok: false, msg: "金币不足，还差 " + (item.price - (p.coins || 0)) + " 金币" };
    if (id === "heart") {
      p.hearts = { n: MAX_HEARTS, ts: Date.now() };
    } else if (id === "freeze") {
      if ((p.freezes || 0) >= 2) return { ok: false, msg: "连胜冻结最多囤 2 个" };
      p.freezes = (p.freezes || 0) + 1;
    } else if (id === "xp2") {
      p.boosts = p.boosts || {};
      p.boosts.xp2until = Date.now() + 15 * 60000;
    }
    addCoins(p, -item.price);
    saveProgress(p);
    return { ok: true, msg: "已购买：" + item.name, coins: p.coins };
  }

  /* ---------------- 每日任务（按用户状态动态生成） ---------------- */
  var QUEST_POOL = [
    { id: "xp30",     label: "获得 30 XP",         target: 30, val: function (p, st) { return st.todayXp; } },
    { id: "lesson1",  label: "完成 1 节课",         target: 1,  val: function (p) { return (p.questProg && p.questProg.lessons) || 0; } },
    { id: "correct10", label: "答对 10 题",         target: 10, val: function (p) { return (p.questProg && p.questProg.correct) || 0; } },
    { id: "challenge1", label: "参与 1 次限时挑战", target: 1,  val: function (p) { return (p.questProg && p.questProg.challenges) || 0; } },
    { id: "review5",   label: "攻克 5 道错题",       target: 5,  val: function (p) { return (p.questProg && p.questProg.reviewed) || 0; }, needsMistakes: true },
    { id: "words10",   label: "学习 10 个新词",      target: 10, val: function (p) { return (p.questProg && p.questProg.words) || 0; }, needsWords: true }
  ];
  function ensureQuestDay(p) {
    var t = todayKey();
    if (!p.questProg || p.questProg.date !== t) {
      p.questProg = { date: t, correct: 0, lessons: 0, challenges: 0, reviewed: 0, words: 0 };
    }
    if (!p.quests || p.quests.date !== t) {
      /* 按当前用户状态过滤候选：新用户没错题就跳过 review5，没学过单词就跳过 words10 */
      var st = stats();
      var pool = QUEST_POOL.filter(function (q) {
        if (q.needsMistakes && !((p.mistakes || []).length || p.mistakesFixed)) return false;
        if (q.needsWords && !(Object.keys(p.vocabBox || {}).length)) return false;
        return true;
      });
      /* 经验低时降低 xp30 目标 */
      var lowXp = QUEST_POOL.map(function (q) {
        if (q.id === "xp30") return { id: "xp30", label: "获得 15 XP", target: 15, val: q.val };
        return q;
      });
      if (st.lessonsDone === 0) pool = lowXp.filter(function (q) { return pool.indexOf(q) >= 0 || q.id === "xp30"; });
      var list = [];
      var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; });
      for (var i = 0; i < 3 && shuffled.length; i++) list.push({ id: shuffled[i].id, done: false });
      p.quests = { date: t, list: list };
    }
    return p;
  }
  function bumpQuest(p, key) {
    ensureQuestDay(p);
    if (p.questProg) p.questProg[key] = (p.questProg[key] || 0) + 1;
  }
  function questState() {
    var p = progress();
    ensureQuestDay(p);
    saveProgress(p);
    var st = stats();
    return p.quests.list.map(function (q) {
      var def = null;
      QUEST_POOL.forEach(function (x) { if (x.id === q.id) def = x; });
      var v = def ? Math.min(def.target, def.val(p, st) || 0) : 0;
      return { id: q.id, label: def ? def.label : q.id, target: def ? def.target : 1, value: v, done: !!q.done, pct: def ? Math.round(v / def.target * 100) : 0 };
    });
  }
  function checkQuests() {
    var p = progress();
    ensureQuestDay(p);
    var st = stats();
    var doneNow = [];
    var prevAllDone = p.quests.list.length > 0 && p.quests.list.every(function (q) { return q.done; });
    p.quests.list.forEach(function (q) {
      if (q.done) return;
      var def = null;
      QUEST_POOL.forEach(function (x) { if (x.id === q.id) def = x; });
      if (def && (def.val(p, st) || 0) >= def.target) {
        q.done = true;
        doneNow.push(def);
        addXp(p, 15);
      }
    });
    if (doneNow.length) {
      var all = p.quests.list.every(function (q) { return q.done; });
      if (all && !prevAllDone) {
        addXp(p, 20);
        doneNow.push({ allBonus: true });
      }
      saveProgress(p);
    }
    return doneNow;
  }

  /* ---------------- 导出 ---------------- */
  window.Store = {
    BADGES: BADGES,
    currentUser: currentUser,
    register: register,
    profiles: profiles,
    pickProfile: pickProfile,
    removeProfile: removeProfile,
    logout: logout,
    updateUser: updateUser,
    progress: progress,
    saveProgress: saveProgress,
    actor: actor,
    questState: questState,
    checkQuests: checkQuests,
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
    vocabDue: vocabDue,
    reviewVocab: reviewVocab,
    vocabSummary: vocabSummary,
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