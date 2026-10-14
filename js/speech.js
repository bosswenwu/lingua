/* ==========================================================================
   Lingua · 语音能力
   朗读（TTS）与跟读识别（ASR）+ 相似度评分
   ========================================================================== */
(function () {
  var synth = window.speechSynthesis || null;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var voicesReady = null;
  var asrBlocked = false;   // 识别服务不可用（如国内网络无法访问识别后端）时置位

  function loadVoices() {
    if (!synth) return Promise.resolve([]);
    var v = synth.getVoices();
    if (v && v.length) return Promise.resolve(v);
    if (!voicesReady) {
      voicesReady = new Promise(function (resolve) {
        var done = false;
        var fin = function () { if (!done) { done = true; resolve(synth.getVoices() || []); } };
        synth.addEventListener("voiceschanged", fin);
        setTimeout(fin, 1200);
      });
    }
    return voicesReady;
  }

  function pickVoice(locale) {
    return loadVoices().then(function (voices) {
      if (!voices.length) return null;
      var base = locale.split("-")[0].toLowerCase();
      var exact = voices.filter(function (v) { return (v.lang || "").toLowerCase().replace("_", "-") === locale.toLowerCase(); });
      if (exact.length) return pickBest(exact);
      var loose = voices.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(base) === 0; });
      if (loose.length) return pickBest(loose);
      return null;
    });
  }

  function pickBest(list) {
    var prefer = ["google", "microsoft", "natural", "premium", "siri"];
    for (var i = 0; i < prefer.length; i++) {
      var hit = list.filter(function (v) { return (v.name || "").toLowerCase().indexOf(prefer[i]) >= 0; });
      if (hit.length) return hit[0];
    }
    return list[0];
  }

  function speak(text, locale, opts) {
    opts = opts || {};
    if (!synth) return Promise.reject(new Error("当前浏览器不支持语音朗读"));
    return new Promise(function (resolve) {
      try { synth.cancel(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(text);
      u.lang = locale || "en-US";
      u.rate = opts.rate || 0.92;
      u.pitch = 1;
      pickVoice(locale).then(function (v) {
        if (v) u.voice = v;
        var settled = false;
        var fin = function () { if (!settled) { settled = true; resolve(true); } };
        u.onend = fin;
        u.onerror = fin;
        setTimeout(fin, Math.max(2200, text.length * 130));
        try { synth.speak(u); } catch (e) { fin(); }
      });
    });
  }

  function stop() { if (synth) { try { synth.cancel(); } catch (e) {} } }

  /* ---------------- 跟读识别 ---------------- */
  function listen(locale, handlers) {
    handlers = handlers || {};
    if (!SR) { handlers.onUnsupported && handlers.onUnsupported(); return { stop: function () {} }; }
    var rec = new SR();
    rec.lang = locale || "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    var got = false;

    rec.onresult = function (ev) {
      var interim = "", final = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript;
      }
      if (interim && handlers.onPartial) handlers.onPartial(interim);
      if (final) { got = true; handlers.onResult && handlers.onResult(final.trim()); }
    };
    rec.onerror = function (ev) {
      var map = {
        "not-allowed": "麦克风权限被拒绝，请在浏览器地址栏允许后重试",
        "service-not-allowed": "浏览器未授权语音识别服务",
        "no-speech": "没有听到声音，请靠近麦克风再试一次",
        "audio-capture": "没有找到可用的麦克风",
        "network": "语音识别需要网络连接",
        "aborted": ""
      };
      // 识别后端不可达（国内常见）→ 标记为不可用，上层将降级为「录音回放 + 自评」
      if (ev.error === "network" || ev.error === "service-not-allowed") {
        asrBlocked = true;
        window.Speech.asrBlocked = true;
      }
      var msg = map[ev.error] !== undefined ? map[ev.error] : ("识别出错：" + ev.error);
      handlers.onError && handlers.onError(msg, ev.error);
    };
    rec.onend = function () { handlers.onEnd && handlers.onEnd(got); };
    try { rec.start(); } catch (e) { handlers.onError && handlers.onError("无法启动识别，请稍后重试", "start"); }
    return {
      stop: function () { try { rec.stop(); } catch (e) {} }
    };
  }

  /* ---------------- 相似度评分 ---------------- */
  /* 片假名 → 平假名：日语 ASR 常返回片假名/汉字，统一假名后再比对 */
  function toKana(s) {
    return (s || "").replace(/[\u30A1-\u30F6]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0x60);
    });
  }

  function normalize(s, lang) {
    var n = (s || "")
      .toLowerCase()
      .replace(/[\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F]/g, " ")
      .replace(/[.,!?;:'"“”‘’()\[\]{}<>~!@#$%^&*_+=|\\/`-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (lang === "ja") n = toKana(n);
    return n;
  }

  function tokenize(s, lang) {
    var n = normalize(s, lang);
    if (!n) return [];
    if (lang === "ja" || lang === "ko") return n.split(" ").join("").split("");
    return n.split(" ");
  }

  function lcs(a, b) {
    var m = a.length, n = b.length;
    if (!m || !n) return 0;
    var prev = new Array(n + 1).fill(0), cur = new Array(n + 1).fill(0);
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
      }
      var t = prev; prev = cur; cur = t;
      for (var k = 0; k <= n; k++) cur[k] = 0;
    }
    return prev[n];
  }

  /* reading：可选的目标语读音（如 vocab.r）。提供时取「原句 / 读音」中较优的一项，
     以缓解日语 ASR 返回汉字、而文本为假名时的误判。 */
  function score(target, said, lang, reading) {
    var best = 0;
    var cands = reading ? [target, reading] : [target];
    cands.forEach(function (cand) {
      var T = tokenize(cand, lang), S = tokenize(said, lang);
      if (!T.length || !S.length) return;
      var L = lcs(T, S);
      var v = 0.68 * (L / T.length) + 0.32 * (L / S.length);
      if (v > best) best = v;
    });
    return Math.max(0, Math.min(100, Math.round(best * 100)));
  }

  /* 标记目标句中哪些词被正确读出 */
  function mark(target, said, lang, reading) {
    if (reading && score(reading, said, lang) > score(target, said, lang)) target = reading;
    var T = tokenize(target, lang), S = tokenize(said, lang);
    var used = new Array(S.length).fill(false);
    var out = [];
    T.forEach(function (w) {
      var found = false;
      for (var i = 0; i < S.length; i++) {
        if (!used[i] && S[i] === w) { used[i] = true; found = true; break; }
      }
      out.push({ token: w, hit: found });
    });
    return out;
  }

  window.Speech = {
    ttsSupported: !!synth,
    asrSupported: !!SR,
    asrAvailable: function () { return !!SR && !asrBlocked; },
    asrBlocked: false,
    speak: speak,
    stop: stop,
    listen: listen,
    score: score,
    mark: mark,
    pickVoice: pickVoice
  };
})();