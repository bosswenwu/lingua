/* ==========================================================================
   Lingua · 应用控制器
   路由 / 事件 / 学习会话
   ========================================================================== */
(function () {
  var App = document.getElementById("app");
  var LC = null; // 当前学习会话

  /* ---------------- Toast ---------------- */
  function toast(msg, type) {
    var host = document.getElementById("toast-host");
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = '<span class="t-ico">' + (type === "good" ? "✓" : type === "bad" ? "!" : "★") + "</span><span>" + Views.esc(msg) + "</span>";
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s ease,transform .3s ease";
      el.style.opacity = "0"; el.style.transform = "translateY(10px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2800);
  }

  /* ---------------- 路由 ---------------- */
  var PROTECTED = { dashboard: 1, courses: 1, path: 1, progress: 1, community: 1, achievements: 1, profile: 1, learn: 1 };

  function parse() {
    var h = (location.hash || "").replace(/^#/, "");
    var parts = h.split("/").filter(Boolean);
    return { page: parts[0] || "", arg: parts[1] || "" };
  }
  function go(hash) { location.hash = hash; }

  function render() {
    var user = Store.currentUser();
    var r = parse(), page = r.page;

    if (PROTECTED[page] && !user) { go("#/login"); return; }
    if ((page === "login" || page === "register") && user) { go("#/dashboard"); return; }
    if (!page && user) { go("#/dashboard"); return; }

    Speech.stop();
    if (page !== "learn") LC = null;

    switch (page) {
      case "":
        App.innerHTML = Views.landing(); break;
      case "login":
        App.innerHTML = Views.auth("login"); break;
      case "register":
        App.innerHTML = Views.auth("register"); break;
      case "dashboard":
        App.innerHTML = Views.dashboard(); break;
      case "courses":
        App.innerHTML = Views.courses(r.arg); break;
      case "path":
        App.innerHTML = Views.pathPage(); break;
      case "progress":
        App.innerHTML = Views.progressPage(); break;
      case "community":
        App.innerHTML = Views.community(r.arg || "all"); break;
      case "achievements":
        App.innerHTML = Views.achievements(); break;
      case "profile":
        App.innerHTML = Views.profile(); break;
      case "learn":
        startLesson(r.arg); break;
      default:
        App.innerHTML = user ? Views.dashboard() : Views.landing();
    }
    postRender();
  }

  function postRender() {
    window.scrollTo(0, 0);
    var bars = App.querySelectorAll(".bar-fill[data-target]");
    var rings = App.querySelectorAll(".ring-fg[data-ring]");
    var cols = App.querySelectorAll(".bcol[data-target-h]");
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(bars, function (b) { b.style.width = b.getAttribute("data-target") + "%"; });
      Array.prototype.forEach.call(rings, function (g) { g.style.strokeDashoffset = g.getAttribute("data-ring"); });
      Array.prototype.forEach.call(cols, function (c) { c.style.height = Math.max(4, +c.getAttribute("data-target-h")) + "%"; });
    });
  }

  /* ======================================================================
     学习会话
     ====================================================================== */
  function buildSession(lessonId) {
    var info = DATA.lessonOf(lessonId);
    if (!info) return null;
    var l = info.lesson;
    var grammarItems = [];
    (l.grammar || []).forEach(function (g) {
      (g.drills || []).forEach(function (d) {
        grammarItems.push({ point: g.point, rule: g.rule, q: d.q, opts: d.opts, a: d.a, why: d.why });
      });
    });
    var items = {
      vocab: (l.vocab || []).slice(),
      grammar: grammarItems,
      listening: (l.listening || []).slice(),
      speaking: (l.speaking || []).slice()
    };
    var total = {}, pending = {}, done = {}, correct = {};
    DATA.MODES.forEach(function (m) {
      total[m.key] = items[m.key].length;
      pending[m.key] = items[m.key].map(function (_, i) { return i; });
      done[m.key] = 0;
      correct[m.key] = 0;
    });
    return {
      id: lessonId, info: info, lang: info.lang, items: items,
      total: total, pending: pending, done: done, correct: correct,
      active: DATA.MODES.filter(function (m) { return items[m.key].length > 0; })[0].key,
      revealed: false, answering: null, speakFx: null, said: "", repeats: {}, finished: false
    };
  }

  function startLesson(lessonId) {
    var s = buildSession(lessonId);
    if (!s) { toast("没有找到这一课", "bad"); go("#/courses"); return; }
    LC = s;
    App.innerHTML = Views.lessonShell(lessonId);
    paintLesson();
  }

  function nextIncompleteMode(exceptKey) {
    var found = null;
    DATA.MODES.forEach(function (m) {
      if (!found && m.key !== exceptKey && LC.pending[m.key].length) found = m.key;
    });
    if (!found) DATA.MODES.forEach(function (m) { if (!found && LC.pending[m.key].length) found = m.key; });
    return found;
  }

  function allDone() {
    return DATA.MODES.every(function (m) { return LC.pending[m.key].length === 0; });
  }

  function updateLessonProgress() {
    var sumT = 0, sumD = 0;
    DATA.MODES.forEach(function (m) { sumT += LC.total[m.key]; sumD += LC.done[m.key]; });
    var pct = sumT ? Math.round(sumD / sumT * 100) : 100;
    var bar = document.querySelector("#lp-bar .bar-fill");
    var lbl = document.getElementById("lp-pct");
    if (bar) bar.style.width = pct + "%";
    if (lbl) lbl.textContent = pct + "%";
  }

  function paintLesson() {
    var body = document.getElementById("lesson-body");
    if (!body || !LC) return;

    if (LC.finished) {
      body.innerHTML = Views.stageResult(LC.resultCtx);
      var b = document.querySelector("#lp-bar .bar-fill");
      if (b) b.style.width = "100%";
      var lb = document.getElementById("lp-pct"); if (lb) lb.textContent = "100%";
      return;
    }

    var totals = {}, dones = {};
    DATA.MODES.forEach(function (m) { totals[m.key] = LC.total[m.key]; dones[m.key] = LC.done[m.key]; });

    var mode = LC.active;
    var stage;
    if (!LC.pending[mode].length) {
      stage = Views.stageModeDone(mode, LC.correct[mode], LC.total[mode], nextIncompleteMode(mode));
    } else {
      var cur = LC.pending[mode][0];
      var useIdx = LC.answering ? LC.answering.idx : LC.done[mode];
      var item = LC.answering && LC.answering.mode === mode ? LC.answering.item : LC.items[mode][cur];
      var ctx = { lessonId: LC.id, idx: useIdx, total: LC.total[mode], item: item };
      if (mode === "vocab") stage = LC.revealed ? Views.stageVocabRevealed(ctx) : Views.stageVocab(ctx);
      else if (mode === "grammar") stage = Views.stageGrammar(ctx, LC.answering && LC.answering.mode === mode ? LC.answering : null);
      else if (mode === "listening") stage = Views.stageListening(ctx, LC.revealed, LC.answering && LC.answering.mode === mode ? LC.answering : null);
      else stage = Views.stageSpeaking(ctx, LC.speakFx || "");
    }

    body.innerHTML = Views.modeToggle(mode, totals, dones) + '<div class="stage">' + stage + "</div>";
    updateLessonProgress();
  }

  /* ---- 作答处理 ---- */
  function handleAnswer(opt) {
    var mode = LC.active;
    if (LC.answering) return;
    var cur = LC.pending[mode][0];
    var item = LC.items[mode][cur];
    var correct = opt === item.a;
    LC.answering = { mode: mode, idx: LC.done[mode], item: item, opt: opt, correct: correct, isLast: LC.pending[mode].length === 1 };
    var p = Store.progress();
    Store.recordSkill(p, mode, correct);
    Store.saveProgress(p);
    paintLesson();
  }

  function handleContinue() {
    var a = LC.answering;
    if (!a) return;
    LC.done[a.mode] += 1;
    if (a.correct) LC.correct[a.mode] += 1;
    LC.pending[a.mode].shift();
    LC.answering = null;
    LC.revealed = false;
    if (allDone()) return finishLesson(a.mode);
    paintLesson();
  }

  function handleVocab(known) {
    var mode = "vocab";
    var cur = LC.pending[mode][0];
    var p = Store.progress();
    Store.updateVocabBox(p, LC.id, cur, known);
    Store.recordSkill(p, mode, known);
    Store.saveProgress(p);
    var idx = LC.pending[mode].shift();
    if (known) {
      LC.done[mode] += 1; LC.correct[mode] += 1;
    } else if (!LC.repeats[idx]) {
      LC.repeats[idx] = true;
      LC.pending[mode].push(idx);      // 本轮末尾再出现一次
    } else {
      LC.done[mode] += 1;
    }
    LC.revealed = false;
    if (allDone()) return finishLesson(mode);
    paintLesson();
  }

  /* ---- 口语 ---- */
  function handleMic() {
    if (!LC) return;
    var mode = "speaking";
    if (!LC.pending[mode].length) return;
    var btn = document.getElementById("mic-btn");
    var hint = document.getElementById("mic-hint");
    if (!Speech.asrSupported) {
      hint.textContent = "当前浏览器不支持语音识别，可点击下方按钮直接完成本句。";
      LC.speakFx = '<div class="speak-result"><div class="tiny muted">浏览器未提供语音识别能力（建议使用 Chrome / Edge 并允许麦克风权限）。你仍然可以听示范并跟读，然后手动确认。</div>' +
        '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-sm" data-action="speak-target">听示范</button>' +
        '<button class="btn btn-sm btn-primary" data-action="next" style="margin-left:auto">我已完成朗读</button></div></div>';
      paintLesson();
      return;
    }
    var cur = LC.pending[mode][0];
    var item = LC.items[mode][cur];
    LC.said = "";
    if (btn) btn.classList.add("rec");
    if (hint) hint.textContent = "正在聆听…请朗读上面的句子";
    LC.rec = Speech.listen(LC.lang.locale, {
      onPartial: function (t) { if (hint) hint.textContent = "听到：" + t; },
      onResult: function (t) { LC.said = t; },
      onError: function (msg) {
        if (btn) btn.classList.remove("rec");
        if (hint) hint.textContent = msg || "识别失败，请重试";
        if (msg) toast(msg, "bad");
      },
      onEnd: function () {
        if (btn) btn.classList.remove("rec");
        evaluateSpeech(item);
      }
    });
  }

  function evaluateSpeech(item) {
    var mode = "speaking";
    var said = LC.said || "";
    var sc = Speech.score(item.text, said, LC.lang.code);
    var marks = Speech.mark(item.text, said, LC.lang.code);
    var ok = sc >= 70;
    LC.speakFxScore = { score: sc, ok: ok, said: said, marks: marks };
    LC.speakFx = Views.speakResult(sc, marks, said, ok);
    if (hintEl()) hintEl().textContent = "识别完成，可重录或继续下一句";
    paintLesson();
  }
  function hintEl() { return document.getElementById("mic-hint"); }

  function commitSpeaking(manual) {
    var mode = "speaking";
    var fx = LC.speakFxScore;
    var p = Store.progress();
    if (manual) {
      // 无识别能力的兜底：不计入正确率，只记完成次数
      p.skills.speaking.total += 1;
      Store.saveProgress(p);
      LC.done[mode] += 1;
    } else {
      var ok = fx ? fx.ok : false;
      Store.recordSkill(p, mode, ok);
      p.skills.speaking.scoreSum += fx ? fx.score : 0;
      Store.saveProgress(p);
      LC.done[mode] += 1;
      if (ok) LC.correct[mode] += 1;
    }
    LC.pending[mode].shift();
    LC.speakFx = null; LC.speakFxScore = null; LC.said = "";
    if (allDone()) return finishLesson(mode);
    paintLesson();
  }

  /* ---- 完成 ---- */
  function finishLesson(lastMode) {
    var total = 0, correct = 0, modes = {};
    DATA.MODES.forEach(function (m) {
      total += LC.total[m.key];
      correct += LC.correct[m.key];
      modes[m.key] = LC.total[m.key] ? Math.round(LC.correct[m.key] / LC.total[m.key] * 100) : 0;
    });
    var res = Store.completeLesson(LC.id, { total: total, correct: correct, perfect: correct === total, modes: modes });
    LC.finished = true;
    LC.resultCtx = {
      lessonId: LC.id, result: res,
      perfectLabel: correct === total ? "全对" : Math.round(correct / Math.max(1, total) * 100) + "%"
    };
    paintLesson();
    if (res.badges && res.badges.length) {
      res.badges.forEach(function (b, i) {
        setTimeout(function () { toast("解锁成就：" + b.name, "good"); }, 400 + i * 420);
      });
    }
  }

  /* ======================================================================
     事件
     ====================================================================== */
  document.addEventListener("click", function (ev) {
    var t = ev.target;

    // 落地页锚点平滑滚动
    var anchor = t.closest && t.closest('a[href^="#"]');
    if (anchor) {
      var href = anchor.getAttribute("href");
      if (href && href.indexOf("#/") !== 0) {
        ev.preventDefault();
        var node = document.querySelector(href);
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      return; // 交由 hash 路由处理
    }

    // 朗读
    var sp = t.closest && t.closest("[data-speak]");
    if (sp) {
      if (!Speech.ttsSupported) { toast("当前浏览器不支持语音朗读", "bad"); return; }
      Speech.speak(sp.getAttribute("data-speak"), sp.getAttribute("data-locale"), { rate: 0.9 });
      return;
    }

    // 路由跳转
    var link = t.closest && t.closest("[data-link]");
    if (link) { go(link.getAttribute("data-link")); return; }

    // 行为
    var act = t.closest && t.closest("[data-action]");
    if (!act) return;
    var action = act.getAttribute("data-action");

    switch (action) {
      case "logout":
        Store.logout(); toast("已退出登录"); go("#/"); break;
      case "reset":
        if (confirm("确定要清空本机保存的全部数据吗？此操作不可恢复。")) Store.resetAll();
        break;
      case "post": doPost(); break;
      case "like": Store.toggleLike(act.getAttribute("data-id")); render(); break;
      case "toggle-comments": {
        var post = act.closest(".post");
        var box = post && post.querySelector(".comments");
        if (box) box.style.display = box.style.display === "none" ? "flex" : "none";
        break;
      }
      case "comment": doComment(act.getAttribute("data-id")); break;
      case "del-post":
        if (confirm("删除这条动态？")) { Store.deletePost(act.getAttribute("data-id")); render(); }
        break;
      case "mode": if (LC) { LC.active = act.getAttribute("data-mode"); LC.answering = null; LC.revealed = false; LC.speakFx = null; LC.speakFxScore = null; paintLesson(); } break;
      case "reveal": if (LC) { LC.revealed = true; paintLesson(); } break;
      case "known": if (LC) handleVocab(true); break;
      case "unknown": if (LC) handleVocab(false); break;
      case "speak-vocab":
        if (LC) { var cv = LC.items.vocab[LC.pending.vocab[0]]; if (cv) Speech.speak(cv.t, LC.lang.locale); }
        break;
      case "answer": if (LC) handleAnswer(+act.getAttribute("data-opt")); break;
      case "continue": if (LC) handleContinue(); break;
      case "play": playAudio(1); break;
      case "play-slow": playAudio(0.65); break;
      case "toggle-script":
        if (LC) { LC.revealed = !LC.revealed; paintLesson(); }
        break;
      case "speak-target":
        if (LC) { var sp2 = LC.items.speaking[LC.pending.speaking[0]]; if (sp2) Speech.speak(sp2.text, LC.lang.locale); }
        break;
      case "mic": handleMic(); break;
      case "next":
        if (LC && LC.active === "speaking") commitSpeaking(!LC.speakFxScore);
        break;
      case "redo": if (LC) { startLesson(LC.id); } break;
    }
  });

  function playAudio(rate) {
    if (!LC || LC.active !== "listening") return;
    var item = LC.items.listening[LC.pending.listening[0]];
    if (!item) return;
    var big = document.getElementById("play-big");
    if (big) big.classList.add("playing");
    Speech.speak(item.text, LC.lang.locale, { rate: rate }).then(function () {
      var b = document.getElementById("play-big");
      if (b) b.classList.remove("playing");
    });
  }

  function doPost() {
    var ta = document.getElementById("post-text");
    if (!ta || !ta.value.trim()) { toast("写点什么再发布吧", "bad"); return; }
    var sel = document.querySelector('input[name="post-lang"]:checked');
    var res = Store.addPost(ta.value, sel ? sel.value : "all", []);
    if (res) {
      toast("已发布", "good");
      if (res.badges && res.badges.length) res.badges.forEach(function (b) { toast("解锁成就：" + b.name, "good"); });
      render();
    }
  }

  function doComment(id) {
    var input = document.querySelector('[data-comment-input="' + id + '"]');
    if (!input || !input.value.trim()) return;
    Store.addComment(id, input.value);
    render();
  }

  /* ---- 表单 ---- */
  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (form.id === "auth-form") {
      ev.preventDefault();
      var fd = new FormData(form);
      var box = document.getElementById("auth-err");
      var data = {
        name: fd.get("name"), email: fd.get("email"), password: fd.get("password"),
        level: fd.get("level"), dailyGoal: +(fd.get("dailyGoal") || 30),
        targetLangs: fd.getAll("targetLangs")
      };
      var isReg = form.querySelector('[name="name"]') !== null;
      var res = isReg ? Store.register(data) : Store.login(fd.get("email"), fd.get("password"));
      if (res.error) {
        if (box) box.innerHTML = '<div class="form-err">' + Views.esc(res.error) + "</div>";
        return;
      }
      toast(isReg ? "档案创建成功，欢迎加入" : "欢迎回来，" + res.user.name, "good");
      go("#/dashboard");
      return;
    }
    if (form.id === "profile-form") {
      ev.preventDefault();
      var f2 = new FormData(form);
      var langs = f2.getAll("targetLangs");
      if (!langs.length) { toast("至少保留一门目标语言", "bad"); return; }
      Store.updateUser({
        name: (f2.get("name") || "").trim() || Store.currentUser().name,
        bio: (f2.get("bio") || "").trim(),
        targetLangs: langs,
        level: f2.get("level"),
        dailyGoal: +(f2.get("dailyGoal") || 30)
      });
      toast("已保存", "good");
      render();
    }
  });

  document.addEventListener("click", function (ev) {
    if (ev.target && ev.target.id === "demo-login") {
      var res = Store.register({ name: "演示学员", email: "demo@lingua.app", password: "lingua2026", targetLangs: ["en", "ja"], level: "A1", dailyGoal: 30 });
      if (res.error) res = Store.login("demo@lingua.app", "lingua2026");
      if (res.user) { seedDemo(); toast("已进入演示账号，数据可随时清空", "good"); go("#/dashboard"); }
    }
  });

  /* 演示账号预置学习记录，让图表与排行有内容 */
  function seedDemo() {
    var p = Store.progress();
    var ids = DATA.lessonsOfLang("en").slice(0, 3);
    ids.forEach(function (id, i) {
      var info = DATA.lessonOf(id);
      p.lessons[id] = { done: true, best: 78 + i * 6, attempts: 1 + (i % 2), xp: info.lesson.xp, at: Date.now() - i * 86400000, modes: { vocab: 80, grammar: 75, listening: 70, speaking: 72 } };
      (info.lesson.vocab || []).forEach(function (_, vi) {
        p.vocabBox[id + "#" + vi] = { box: 3, seen: 3, correct: 3, next: 0 };
      });
    });
    var today = new Date();
    for (var i = 0; i < 20; i++) {
      var k = Store._util.dateKey(Store._util.addDays(today, -i));
      p.days[k] = i < 9 ? 22 + ((i * 17) % 52) : 0;
    }
    p.xp = 690;
    p.streak = { count: 6, last: Store._util.todayKey() };
    p.bestStreak = 6;
    p.skills = {
      vocab: { total: 42, correct: 37 }, grammar: { total: 24, correct: 19 },
      listening: { total: 16, correct: 12 }, speaking: { total: 9, correct: 7, scoreSum: 9 * 76 }
    };
    Store.saveProgress(p);
    Store.evaluateBadges();
  }

  /* ---------------- 启动 ---------------- */
  window.addEventListener("hashchange", render);
  render();
})();