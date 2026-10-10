/* ==========================================================================
   Lingua · 应用控制器
   路由 / 事件 / 学习会话
   ========================================================================== */
(function () {
  var App = document.getElementById("app");
  var LC = null; // 当前学习会话
  var CH = null; // 限时挑战会话
  var RV = null; // 错题重练会话
  var chTimer = null;
  var CH_SETUP = { lang: "all", secs: 60 };
  var glQ = "";  // 词汇库搜索词

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
  var PROTECTED = { community: 1, profile: 1 }; // 游客可直接学习，仅社区与个人中心需登录

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
    if (chTimer) { clearInterval(chTimer); chTimer = null; }
    if (page !== "learn") LC = null;
    if (page !== "challenge") CH = null;
    if (page !== "review") RV = null;

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
      case "review":
        if (RV) paintReview(); else App.innerHTML = Views.reviewPage(); break;
      case "challenge":
        if (CH && CH.playing) paintChallenge(); else App.innerHTML = Views.challengeSetup(CH_SETUP); break;
      case "glossary":
        App.innerHTML = Views.glossary(r.arg || "", glQ); break;
      case "shop":
        App.innerHTML = Views.shopPage(); break;
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
      revealed: false, answering: null, speakFx: null, said: "", repeats: {}, finished: false,
      dictate: { active: false, result: null, draft: "" }
    };
  }

  function startLesson(lessonId) {
    if (Store.hearts().n <= 0) { LC = null; App.innerHTML = Views.heartsOut(null); return; }
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
      body.innerHTML = LC.resultCtx.heartsOut ? Views.heartsOut(LC.resultCtx) : Views.stageResult(LC.resultCtx);
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
      else if (mode === "listening") stage = Views.stageListening(ctx, LC.revealed, LC.answering && LC.answering.mode === mode ? LC.answering : null, LC.dictate);
      else stage = Views.stageSpeaking(ctx, LC.speakFx || "");
    }

    body.innerHTML = Views.modeToggle(mode, totals, dones) + '<div class="stage">' + stage + "</div>";
    updateLessonProgress();
    updateHearts();
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
    if (!correct) {
      Store.recordMistake(p, {
        lang: LC.lang.code, mode: mode, lessonId: LC.id,
        prompt: item.q, opts: item.opts || [], answer: item.a,
        why: item.why || (item.text ? item.text + " —— " + item.tr : ""),
        text: mode === "listening" ? item.text : "",
        tr: mode === "listening" ? item.tr : ""
      });
      if (mode !== "vocab") {
        var hr = Store.loseHeart();
        LC.hearts = hr.n;
        if (hr.exhausted) LC.outOfHearts = true;
      }
    }
    Store.saveProgress(p);
    if (LC.outOfHearts) { finishHeartsOut(); return; }
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
    LC.dictate = { active: false, result: null, draft: "" };
    if (allDone()) return finishLesson(a.mode);
    questPulse();
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
    questPulse();
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
      if (!ok) {
        var hr2 = Store.loseHeart();
        LC.hearts = hr2.n;
        if (hr2.exhausted) LC.outOfHearts = true;
      }
      Store.saveProgress(p);
      LC.done[mode] += 1;
      if (ok) LC.correct[mode] += 1;
    }
    if (LC.outOfHearts) { LC.pending[mode].shift(); finishHeartsOut(); return; }
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
    questToasts(res.quests, 1200);
  }

  /* ======================================================================
     听写模式
     ====================================================================== */
  function dictateItem() {
    return LC && LC.active === "listening" ? LC.items.listening[LC.pending.listening[0]] : null;
  }
  function toggleDictate() {
    if (!LC || LC.active !== "listening") return;
    var ta = document.getElementById("dictate-input");
    if (ta) LC.dictate.draft = ta.value;
    LC.dictate.active = !LC.dictate.active;
    LC.dictate.result = null;
    paintLesson();
  }
  function submitDictate() {
    var it = dictateItem();
    var ta = document.getElementById("dictate-input");
    if (!it || !ta) return;
    var val = ta.value.trim();
    LC.dictate.draft = val;
    if (!val) { toast("先输入你听到的内容", "bad"); return; }
    var score = Speech.score(it.text, val, LC.lang.code);
    var marks = Speech.mark(it.text, val, LC.lang.code);
    LC.dictate.result = { score: score, marks: marks };
    if (score >= 85) {
      var p = Store.progress();
      p.xp += 3;
      var t = Store._util.todayKey();
      p.days[t] = (p.days[t] || 0) + 3;
      Store.saveProgress(p);
      toast("听写优秀，+3 XP", "good");
    }
    questPulse();
    paintLesson();
    var nt = document.getElementById("dictate-input");
    if (nt) nt.focus();
  }

  /* ======================================================================
     错题重练
     ====================================================================== */
  function startReview() {
    var list = Store.mistakes();
    if (!list.length) { toast("错题本是空的", "good"); return; }
    RV = { items: list, idx: 0, fixed: 0, fb: null };
    paintReview();
  }
  function paintReview() {
    if (!RV) return;
    App.innerHTML = Views.reviewStage(RV.items[RV.idx], RV.idx, RV.items.length, RV.fb);
    window.scrollTo(0, 0);
  }
  function reviewAnswer(opt) {
    if (!RV || RV.fb) return;
    var m = RV.items[RV.idx];
    var correct = opt === m.answer;
    RV.fb = { opt: opt, correct: correct };
    var p = Store.progress();
    Store.recordSkill(p, m.mode, correct);
    Store.saveProgress(p);
    if (correct) {
      RV.fixed += 1;
      var out = Store.resolveMistake(m.id);
      ((out && out.badges) || []).forEach(function (b, i) { setTimeout(function () { toast("解锁成就：" + b.name, "good"); }, 400 + i * 420); });
      if (out && out.heartBack) setTimeout(function () { toast("错题攻克 3 题，回复 1 颗红心", "good"); }, 250);
      questToasts(out && out.quests, 900);
    }
    paintReview();
  }
  function reviewNext() {
    if (!RV) return;
    RV.idx += 1;
    RV.fb = null;
    if (RV.idx >= RV.items.length) {
      var fixed = RV.fixed, total = RV.items.length;
      RV = null;
      App.innerHTML = Views.reviewResult(fixed, total);
      window.scrollTo(0, 0);
      return;
    }
    paintReview();
  }

  /* ======================================================================
     限时挑战
     ====================================================================== */
  function startChallenge() {
    var codes = CH_SETUP.lang === "all" ? null : [CH_SETUP.lang];
    var pool = DATA.challengePool(codes);
    if (!pool.length) { toast("题库为空", "bad"); return; }
    CH = {
      playing: true, pool: pool,
      total: CH_SETUP.secs * 1000, left: CH_SETUP.secs * 1000,
      gain: 0, combo: 0, bestCombo: 0, n: 0, correct: 0,
      q: null, answering: null
    };
    nextChallengeQ();
    paintChallenge();
    chTimer = setInterval(chTick, 200);
  }
  function chTick() {
    if (!CH || !CH.playing) { clearInterval(chTimer); chTimer = null; return; }
    CH.left -= 200;
    var fill = document.getElementById("ch-timer-fill");
    var t = document.getElementById("ch-time");
    if (fill) fill.style.width = Math.max(0, CH.left / CH.total * 100) + "%";
    if (t) t.textContent = Math.ceil(Math.max(0, CH.left) / 1000) + "s";
    if (CH.left <= 0) endChallenge();
  }
  function nextChallengeQ() {
    CH.q = CH.pool[Math.floor(Math.random() * CH.pool.length)];
    CH.answering = null;
  }
  function paintChallenge() {
    App.innerHTML = Views.challengeStage(CH);
  }
  function challengeAnswer(opt) {
    if (!CH || !CH.playing || CH.answering) return;
    var q = CH.q;
    var correct = opt === q.a;
    var gain = 0;
    CH.n += 1;
    if (correct) {
      CH.combo += 1;
      CH.bestCombo = Math.max(CH.bestCombo, CH.combo);
      CH.correct += 1;
      gain = (5 + Math.min(CH.combo - 1, 10)) * Store.boostMult(); // 连击加成：5 → 15，双倍卡期间翻倍
      CH.gain += gain;
    } else {
      CH.combo = 0;
    }
    CH.answering = { opt: opt, correct: correct, gain: gain };
    var p = Store.progress();
    Store.recordSkill(p, q.kind, correct);
    if (!correct) {
      Store.recordMistake(p, {
        lang: q.lang, mode: q.kind, prompt: q.prompt,
        opts: q.opts, answer: q.a, why: q.why,
        text: q.kind === "listening" ? q.speakText : ""
      });
    }
    Store.saveProgress(p);
    paintChallenge();
    setTimeout(function () {
      if (!CH || !CH.playing || CH.left <= 0) return;
      nextChallengeQ();
      paintChallenge();
    }, correct ? 550 : 1100);
  }
  function endChallenge() {
    if (!CH) return;
    clearInterval(chTimer); chTimer = null;
    var res = Store.saveChallengeResult(CH.gain, CH.bestCombo);
    var out = { gain: CH.gain, correct: CH.correct, n: CH.n, bestCombo: CH.bestCombo, best: res.best, isRecord: res.isRecord };
    CH.playing = false;
    CH = null;
    App.innerHTML = Views.challengeResult(out);
    window.scrollTo(0, 0);
    (res.badges || []).forEach(function (b, i) { setTimeout(function () { toast("解锁成就：" + b.name, "good"); }, 400 + i * 420); });
    questToasts(res.quests, 1000);
  }

  /* ---- 红心 / 任务 辅助 ---- */
  function updateHearts() {
    var el = document.getElementById("lh-hearts");
    if (!el) return;
    var h = Store.hearts();
    el.innerHTML = h.n > 0 ? "❤️ × " + h.n : "💔";
    el.title = h.n > 0 ? "红心：语法、听力、口语答错会扣除，翻卡不扣" : "红心耗尽：去商店回满，或去错题本攻克 3 题回 1 心";
  }
  function finishHeartsOut() {
    var info = DATA.lessonOf(LC.id);
    LC.finished = true;
    LC.resultCtx = { heartsOut: true, langCode: info ? info.lang.code : "", title: info ? info.lesson.title : "" };
    paintLesson();
  }
  function questToasts(list, base) {
    (list || []).forEach(function (q, i) {
      setTimeout(function () {
        toast(q.allBonus ? "今日任务全部完成，+30 金币" : "任务完成：" + q.label + "（+20 金币 +10 XP）", "good");
      }, (base || 300) + i * 500);
    });
  }
  function questPulse(base) { questToasts(Store.checkQuests(), base); }

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
      case "mode": if (LC) { LC.active = act.getAttribute("data-mode"); LC.answering = null; LC.revealed = false; LC.speakFx = null; LC.speakFxScore = null; LC.dictate = { active: false, result: null, draft: "" }; paintLesson(); } break;
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
      case "dictate":
        toggleDictate();
        break;
      case "dictate-submit":
        submitDictate();
        break;
      case "speak-target":
        if (LC) { var sp2 = LC.items.speaking[LC.pending.speaking[0]]; if (sp2) Speech.speak(sp2.text, LC.lang.locale); }
        break;
      case "mic": handleMic(); break;
      case "next":
        if (LC && LC.active === "speaking") commitSpeaking(!LC.speakFxScore);
        break;
      case "redo": if (LC) { startLesson(LC.id); } break;
      /* 错题本 */
      case "rv-start": startReview(); break;
      case "rv-clear":
        if (confirm("确定要清空错题本吗？全部错题记录将被删除。")) Store.clearMistakes();
        render();
        break;
      case "rv-remove": Store.removeMistake(act.getAttribute("data-id")); render(); break;
      case "rv-answer":
        if (RV) reviewAnswer(+act.getAttribute("data-opt"));
        break;
      case "rv-next": reviewNext(); break;
      /* 限时挑战 */
      case "ch-start": startChallenge(); break;
      case "ch-again":
        go("#/challenge");
        setTimeout(function () { startChallenge(); }, 80);
        break;
      case "ch-answer":
        if (CH) challengeAnswer(+act.getAttribute("data-opt"));
        break;
      case "ch-play":
        if (CH && CH.q && CH.q.speakText) Speech.speak(CH.q.speakText, CH.q.locale, { rate: 0.9 });
        break;
      case "buy": {
        var br = Store.buy(act.getAttribute("data-item"));
        toast(br.msg, br.ok ? "good" : "bad");
        if (br.ok) render();
        break;
      }
      case "locked":
        toast("先完成前面的课程来解锁这一课", "bad");
        break;
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
      toast(isReg ? (res.inherited ? "档案创建成功，游客进度已继承到新账号" : "档案创建成功，欢迎加入") : "欢迎回来，" + res.user.name, "good");
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

  /* 挑战设置单选 & 词汇库搜索 */
  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!el || !el.name) return;
    if (el.name === "ch-lang") CH_SETUP.lang = el.value;
    if (el.name === "ch-secs") CH_SETUP.secs = +el.value;
    if (el.name === "free-mode") {
      var fp = Store.progress();
      fp.freeMode = el.checked;
      Store.saveProgress(fp);
      toast(el.checked ? "自由模式已开启，全部课程随意学" : "自由模式已关闭，按顺序解锁", "good");
    }
  });
  document.addEventListener("input", function (ev) {
    if (ev.target && ev.target.id === "gl-q") {
      glQ = ev.target.value;
      var body = document.getElementById("gl-body");
      if (body) {
        var lang = (parse().page === "glossary" ? parse().arg : "") || "";
        body.innerHTML = Views.glossaryRows(lang, glQ);
      }
    }
  });

  /* ---------------- 启动 ---------------- */
  window.addEventListener("hashchange", render);
  render();
})();