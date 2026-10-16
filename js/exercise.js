/* ==========================================================================
   Lingua · 题目自动生成器
   依据课程词条即时生成语法 / 听力 / 口语题目：数据文件里不存题目
   生成的题目结构与手写课程完全兼容（grammar / listening / speaking）
   ========================================================================== */
(function () {
  var CJK = /[\u4e00-\u9fff]/;

  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function hasZh(m) { return typeof m === "string" && CJK.test(m); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* 从池中随机取 n 个互不相同、且不等于 exclude 的值 */
  function takeDistract(pool, exclude, n) {
    var seen = {}, out = [], guard = 0, limit = pool.length * 4 + 40;
    seen[exclude] = 1;
    while (out.length < n && guard < limit) {
      guard++;
      var v = pool[Math.floor(Math.random() * pool.length)];
      if (v == null || seen[v]) continue;
      seen[v] = 1; out.push(v);
    }
    return out;
  }

  /* 等距抽样 n 条，避免总取开头几个 */
  function sample(list, n) {
    if (!list.length || n <= 0) return [];
    if (list.length <= n) return list.slice();
    var out = [], step = list.length / n;
    for (var i = 0; i < n; i++) out.push(list[Math.floor(i * step)]);
    return out;
  }

  function withAnswer(correct, distract) {
    var opts = shuffle([correct].concat(distract));
    return { opts: opts, a: opts.indexOf(correct) };
  }

  /* 把例句中的目标词挖成 ____；句子里找不到该词则返回 null */
  function blankOut(term, sentence, code) {
    if (!term || !sentence) return null;
    try {
      var word = code === "en";
      var probe = word ? new RegExp("\\b" + escRe(term) + "\\b", "i") : new RegExp(escRe(term));
      if (!probe.test(sentence)) return null;
      var g = word ? new RegExp("\\b" + escRe(term) + "\\b", "gi") : new RegExp(escRe(term), "g");
      return sentence.replace(g, "____");
    } catch (e) { return null; }
  }

  /* 例句归一化：新数据是 [{t,tr}]，旧课程里是纯字符串 */
  function exList(v) {
    var e = v && v.ex;
    if (!e) return [];
    if (typeof e === "string") return [{ t: e, tr: "" }];
    return e.filter(function (x) { return x && x.t; });
  }

  /* 适合朗读/听力的短句（太短没信息量，太长读着累） */
  function shortEx(v) {
    return exList(v).filter(function (e) { return e.t.length >= 4 && e.t.length <= 70; });
  }

  function generate(lesson, lang) {
    lesson = lesson || {};
    var code = (lang && lang.code) || "";
    var vocab = (lesson.vocab || []).filter(function (v) { return v && v.t; });
    var withZh = vocab.filter(function (v) { return hasZh(v.m); });
    var zhPool = withZh.map(function (v) { return v.m; });
    var tPool = vocab.map(function (v) { return v.t; });
    var trPool = [];
    vocab.forEach(function (v) {
      shortEx(v).forEach(function (e) { if (hasZh(e.tr) && trPool.indexOf(e.tr) < 0) trPool.push(e.tr); });
    });

    var grammar = [], listening = [], speaking = [];

    /* 生成题均为词义类（qtype:"meaning"），错题本据此记「词汇」而非「语法」 */

    /* 1) 释义选择：看目标词，选中文释义 */
    sample(withZh, 2).forEach(function (v) {
      var d = takeDistract(zhPool, v.m, 3);
      if (d.length < 2) return;
      var c = withAnswer(v.m, d);
      grammar.push({
        type: "choice", qtype: "meaning", point: "词义辨析",
        q: "「" + v.t + "」的意思是？", opts: c.opts, a: c.a,
        why: v.t + " —— " + v.m
      });
    });

    /* 2) 中译外：看中文释义，选目标词 */
    sample(withZh, 2).forEach(function (v) {
      var d = takeDistract(tPool, v.t, 3);
      if (d.length < 2) return;
      var c = withAnswer(v.t, d);
      grammar.push({
        type: "choice", qtype: "meaning", point: "中译外",
        q: "「" + v.m + "」对应哪个词？", opts: c.opts, a: c.a,
        why: v.m + " → " + v.t
      });
    });

    /* 3) 例句挖空 */
    var clozeCands = withZh.filter(function (v) {
      return shortEx(v).some(function (e) { return hasZh(e.tr) && blankOut(v.t, e.t, code); });
    });
    sample(clozeCands, 1).forEach(function (v) {
      var e = shortEx(v).filter(function (x) { return hasZh(x.tr) && blankOut(v.t, x.t, code); })[0];
      var q = blankOut(v.t, e.t, code);
      var d = takeDistract(tPool, v.t, 3);
      if (!q || d.length < 2) return;
      var c = withAnswer(v.t, d);
      grammar.push({
        type: "choice", qtype: "meaning", point: "例句填词",
        q: "选出合适的词补全句子：" + q, opts: c.opts, a: c.a,
        why: e.t + " —— " + e.tr
      });
    });

    /* 4) 拼写：仅英语（看释义拼单词，键盘输入） */
    if (code === "en") {
      sample(withZh, 1).forEach(function (v) {
        if (v.t.length < 3 || !/^[a-z]+$/i.test(v.t)) return;
        var d = takeDistract(tPool, v.t, 3);
        grammar.push({
          type: "spell", qtype: "meaning", point: "单词拼写",
          q: "根据释义拼出英文单词", hint: v.m, answer: v.t,
          distract: d, why: v.t + " —— " + v.m
        });
      });
    }

    /* 5) 听音选词：播放单词，选出正确词形 */
    sample(vocab, 2).forEach(function (v) {
      var d = takeDistract(tPool, v.t, 3);
      if (d.length < 2) return;
      var c = withAnswer(v.t, d);
      listening.push({
        kind: "word", text: v.t, tr: v.m || v.t, r: v.r || "",
        q: "你听到的是哪个词？", opts: c.opts, a: c.a
      });
    });

    /* 6) 听句选义：播放例句，选出中文意思 */
    var sentCands = [];
    vocab.forEach(function (v) {
      shortEx(v).forEach(function (e) { if (hasZh(e.tr)) sentCands.push({ v: v, e: e }); });
    });
    sample(sentCands, 1).forEach(function (p) {
      var d = takeDistract(trPool, p.e.tr, 3);
      if (d.length < 2) return;
      var c = withAnswer(p.e.tr, d);
      listening.push({
        kind: "sentence", text: p.e.t, tr: p.e.tr,
        q: "这句话的意思是？", opts: c.opts, a: c.a
      });
    });

    /* 7) 例句跟读：优先整句，无例句时退回单词 */
    var speakCands = sentCands.length ? sentCands : vocab.map(function (v) { return { v: v, e: null }; });
    sample(speakCands, 2).forEach(function (p) {
      speaking.push({
        text: p.e ? p.e.t : p.v.t,
        tr: p.e ? (p.e.tr || p.v.m || "") : (p.v.m || ""),
        r: p.e ? "" : (p.v.r || "")
      });
    });

    return { grammar: grammar, listening: listening, speaking: speaking };
  }

  window.Exercise = { generate: generate };
})();
