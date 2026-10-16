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

    /* 1)–4) 为词义类题（qtype:"meaning"），错题本据此记「词汇」而非「语法」；
       末尾追加的英语语法选择题为 qtype:"grammar"，错题本记「语法」 */

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

    /* ======================================================================
       英语语法选择题（qtype:"grammar"，仅英语课；面向中国初一学生）
       三类模板：一般现在时·三单 / be 动词 / 现在进行时。
       素材取自课内词条与例句：动词须命中形态表，名词须命中 be 动词词表。
       每课最多 3 道（三类各先取 1 道再补齐），候选不足 2 道则不出——宁缺毋滥。
       ====================================================================== */
    var VERBS = {
      /* 原形: { s 三单, ing 现在分词, past 过去式, s3 三单题句, prog 进行时题句 } */
      go:     { s: "goes",     ing: "going",     past: "went",    s3: "She ___ to school by bus every day." },
      have:   { s: "has",      ing: "having",    past: "had",     s3: "He ___ breakfast at seven every morning.",
                prog: "Look! She ___ lunch with her friends now." },
      do:     { s: "does",     ing: "doing",     past: "did",     s3: "She ___ her homework after dinner.",
                prog: "Look! He ___ his homework in his room." },
      watch:  { s: "watches",  ing: "watching",  past: "watched", s3: "He ___ TV for an hour every evening.",
                prog: "Look! She ___ TV in the living room." },
      study:  { s: "studies",  ing: "studying",  past: "studied", s3: "She ___ English every evening." },
      play:   { s: "plays",    ing: "playing",   past: "played",  s3: "He ___ basketball after school.",
                prog: "Look! The boy ___ basketball over there." },
      like:   { s: "likes",    ing: "liking",    past: "liked",   s3: "She ___ music very much." },
      eat:    { s: "eats",     ing: "eating",    past: "ate",     s3: "He ___ an apple after lunch.",
                prog: "Look! He ___ breakfast now." },
      read:   { s: "reads",    ing: "reading",   past: "read",    s3: "She ___ a story before bed.",
                prog: "Look! He ___ a book under the tree." },
      write:  { s: "writes",   ing: "writing",   past: "wrote",   s3: "He ___ to his pen pal every month.",
                prog: "Look! She ___ a letter at the desk." },
      speak:  { s: "speaks",   ing: "speaking",  past: "spoke",   s3: "She ___ English very well." },
      come:   { s: "comes",    ing: "coming",    past: "came",    s3: "He ___ to school early every day." },
      give:   { s: "gives",    ing: "giving",    past: "gave",    s3: "She ___ me a gift on my birthday." },
      live:   { s: "lives",    ing: "living",    past: "lived",   s3: "He ___ in Beijing with his parents." },
      teach:  { s: "teaches",  ing: "teaching",  past: "taught",  s3: "She ___ math at a middle school." },
      wash:   { s: "washes",   ing: "washing",   past: "washed",  s3: "He ___ his hands before every meal." },
      fly:    { s: "flies",    ing: "flying",    past: "flew",    s3: "She ___ a kite in spring.",
                prog: "Look! He ___ a kite on the playground." },
      carry:  { s: "carries",  ing: "carrying",  past: "carried", s3: "He ___ a heavy bag to school." },
      buy:    { s: "buys",     ing: "buying",    past: "bought",  s3: "She ___ some fruit every weekend." },
      know:   { s: "knows",    ing: "knowing",   past: "knew",    s3: "He ___ the answer to this question." },
      say:    { s: "says",     ing: "saying",    past: "said",    s3: "She ___ hello to her teacher every morning." },
      see:    { s: "sees",     ing: "seeing",    past: "saw",     s3: "He ___ a film with his friends on Sunday." },
      swim:   { s: "swims",    ing: "swimming",  past: "swam",    s3: "She ___ in the pool every summer.",
                prog: "Look! The boy ___ in the river." },
      run:    { s: "runs",     ing: "running",   past: "ran",     s3: "He ___ for half an hour every morning.",
                prog: "Look! The boy ___ over there." },
      sing:   { s: "sings",    ing: "singing",   past: "sang",    s3: "She ___ an English song every morning.",
                prog: "Look! The girl ___ in the music room." },
      dance:  { s: "dances",   ing: "dancing",   past: "danced",  s3: "He ___ after class every Friday.",
                prog: "Look! The girl ___ over there." },
      walk:   { s: "walks",    ing: "walking",   past: "walked",  s3: "She ___ to school with her friend." },
      open:   { s: "opens",    ing: "opening",   past: "opened",  s3: "He ___ the window every morning." },
      close:  { s: "closes",   ing: "closing",   past: "closed",  s3: "She ___ the door at nine every night." },
      get:    { s: "gets",     ing: "getting",   past: "got",     s3: "He ___ up at six thirty every day." },
      drink:  { s: "drinks",   ing: "drinking",  past: "drank",   s3: "She ___ a glass of milk every morning.",
                prog: "Look! She ___ tea with her grandma." },
      look:   { s: "looks",    ing: "looking",   past: "looked",  s3: "He ___ happy today." },
      make:   { s: "makes",    ing: "making",    past: "made",    prog: "Look! Mom ___ a cake for us." },
      draw:   { s: "draws",    ing: "drawing",   past: "drew",    prog: "Look! He ___ a picture of a cat." },
      sleep:  { s: "sleeps",   ing: "sleeping",  past: "slept",   prog: "Look! The baby ___ in the room." },
      talk:   { s: "talks",    ing: "talking",   past: "talked",  prog: "Look! He ___ on the phone." },
      sit:    { s: "sits",     ing: "sitting",   past: "sat",     prog: "Look! She ___ by the window." },
      stand:  { s: "stands",   ing: "standing",  past: "stood",   prog: "Look! He ___ at the door." },
      clean:  { s: "cleans",   ing: "cleaning",  past: "cleaned", prog: "Look! She ___ the classroom." },
      cook:   { s: "cooks",    ing: "cooking",   past: "cooked",  prog: "Look! Mom ___ dinner in the kitchen." },
      ride:   { s: "rides",    ing: "riding",    past: "rode",    prog: "Look! She ___ a bike to the park." },
      listen: { s: "listens",  ing: "listening", past: "listened", prog: "Look! The girl ___ to music." },
      wait:   { s: "waits",    ing: "waiting",   past: "waited",  prog: "Look! He ___ for the bus at the stop." }
    };

    /* be 动词题名词表（须在课内词条出现）：单数 p=人 t=物，另有复数/不规则复数 */
    var BE_SING = {
      friend: "p", teacher: "p", student: "p", doctor: "p", nurse: "p", worker: "p",
      driver: "p", farmer: "p", mother: "p", father: "p", sister: "p", brother: "p",
      cousin: "p", classmate: "p", girl: "p", boy: "p", singer: "p", player: "p",
      book: "t", pen: "t", pencil: "t", bag: "t", bike: "t", car: "t", phone: "t",
      photo: "t", picture: "t", desk: "t", chair: "t", ball: "t", kite: "t", toy: "t",
      box: "t", door: "t", window: "t", room: "t", school: "t", computer: "t",
      cat: "t", dog: "t", bird: "t", apple: "t", banana: "t", cake: "t", egg: "t",
      orange: "t", cup: "t", clock: "t", map: "t", key: "t", bed: "t", table: "t",
      flower: "t", tree: "t", hat: "t", coat: "t", game: "t", gift: "t", card: "t",
      letter: "t", camera: "t", family: "t"
    };
    var BE_PLUR = {};
    ["books", "pens", "pencils", "bags", "cats", "dogs", "birds", "apples", "bananas",
     "cakes", "eggs", "friends", "teachers", "students", "doctors", "parents",
     "sisters", "brothers", "desks", "chairs", "balls", "kites", "toys", "boxes",
     "photos", "pictures", "cars", "bikes", "girls", "boys", "rooms", "doors",
     "windows", "children", "people"].forEach(function (n) { BE_PLUR[n] = 1; });

    function beQ(q, ans, why) {
      var d = [];
      ["am", "is", "are"].forEach(function (w) { if (w !== ans) d.push(w); });
      var c = withAnswer(ans, d);
      return {
        type: "choice", qtype: "grammar", point: "be 动词",
        q: "从 am / is / are 中选词填空：" + q, opts: c.opts, a: c.a, why: why
      };
    }

    function s3Q(base, v) {
      var subj = v.s3.indexOf("He ") === 0 ? "He" : "She";
      var c = withAnswer(v.s, [base, v.ing, "is " + base]);
      return {
        type: "choice", qtype: "grammar", point: "一般现在时·三单",
        q: "用所给动词的适当形式填空：" + v.s3.replace("___", "___（" + base + "）"),
        opts: c.opts, a: c.a,
        why: "主语 " + subj + " 是第三人称单数，一般现在时动词要用三单形式 " + v.s + "。"
      };
    }

    function progQ(base, v) {
      var correct = "is " + v.ing;
      var pool = [base, v.s, v.past, "are " + v.ing], seen = {}, d = [];
      pool.forEach(function (w) {
        if (d.length < 3 && !seen[w] && w !== correct) { seen[w] = 1; d.push(w); }
      });
      var c = withAnswer(correct, d);
      return {
        type: "choice", qtype: "grammar", point: "现在进行时",
        q: "用所给动词的适当形式填空：" + v.prog.replace("___", "___（" + base + "）"),
        opts: c.opts, a: c.a,
        why: "Look! 提示动作正在进行，要用现在进行时（be + 动词-ing）：" + v.prog.replace("___", correct)
      };
    }

    var gq = [];
    if (code === "en") {
      var terms = {};
      vocab.forEach(function (v) { terms[String(v.t).toLowerCase()] = 1; });
      var allEx = "";
      vocab.forEach(function (v) {
        exList(v).forEach(function (e) { allEx += "\n" + e.t; });
      });

      function verbHit(forms) {
        for (var i = 0; i < forms.length; i++) if (terms[forms[i]]) return true;
        try { return new RegExp("\\b(" + forms.join("|") + ")\\b", "i").test(allEx); }
        catch (e) { return false; }
      }

      var gS3 = [], gBe = [], gProg = [];
      gBe.push(beQ("I ___ a student.", "am", "主语 I 固定与 am 搭配：I am a student。"));
      Object.keys(BE_SING).forEach(function (n) {
        if (!terms[n]) return;
        if (BE_SING[n] === "p") gBe.push(beQ("She ___ my " + n + ".", "is",
          "主语 She 是第三人称单数，be 动词用 is：She is my " + n + "。"));
        else gBe.push(beQ("This ___ my " + n + ".", "is",
          "主语 This 是单数，be 动词用 is：This is my " + n + "。"));
      });
      Object.keys(BE_PLUR).forEach(function (n) {
        if (!terms[n]) return;
        gBe.push(beQ("They ___ my " + n + ".", "are",
          "主语 They 是复数，be 动词用 are：They are my " + n + "。"));
      });
      Object.keys(VERBS).forEach(function (base) {
        var v = VERBS[base];
        if (!verbHit([base, v.s, v.ing, v.past])) return;
        if (v.s3) gS3.push(s3Q(base, v));
        if (v.prog) gProg.push(progQ(base, v));
      });

      /* 三类各先随机取 1 道，再从剩余候选补齐至 3 道；候选不足 2 道则不出 */
      [gS3, gBe, gProg].forEach(function (g) {
        if (g.length && gq.length < 3) gq.push(g[Math.floor(Math.random() * g.length)]);
      });
      if (gq.length > 0 && gq.length < 3) {
        var usedQ = {};
        gq.forEach(function (x) { usedQ[x.q] = 1; });
        var rest = shuffle(gS3.concat(gBe, gProg)).filter(function (x) { return !usedQ[x.q]; });
        while (gq.length < 3 && rest.length) gq.push(rest.pop());
      }
      if (gq.length >= 2) grammar = grammar.concat(gq);
    }

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
