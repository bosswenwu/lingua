/* ==========================================================================
   Lingua · 视图层
   所有页面与学习模块的 HTML 模板
   ========================================================================== */
(function () {
  var D = window.DATA, S = window.Store;

  /* ---------------- 图标 ---------------- */
  var ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5Z"/><path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6h5.5a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-8"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M17.5 14.8c2.1.6 3.5 2.3 3.5 4.6"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.8-1.3 7 4.8-2.6 4.8 2.6-1.3-7"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.4-6.8a1 1 0 0 0 0-1.7L9.6 4.3A1 1 0 0 0 8 5.2Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19Z"/><path d="M15 9.5a3.5 3.5 0 0 1 0 5"/><path d="M17.8 7a7 7 0 0 1 0 10"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3.5"/></svg>',
    ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9a5 5 0 0 1 9.9-1c0 3-3 3.6-3 6a2.5 2.5 0 0 1-4.6 1.4"/><path d="M7.6 8.8A4 4 0 0 0 9.5 14"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="13" rx="2.2"/><path d="M7.5 7V5.2A2.2 2.2 0 0 1 9.7 3H19a2 2 0 0 1 2 2v9.3a2.2 2.2 0 0 1-2.2 2.2H17"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5 20.5 7.5 9 19H5v-4Z"/><path d="m14 6 4 4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 5-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9.5 5 7 7-7 7"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S3.5 15.2 3.5 9.4A4.9 4.9 0 0 1 12 6.2a4.9 4.9 0 0 1 8.5 3.2c0 5.8-8.5 11.1-8.5 11.1Z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5S3.5 15.2 3.5 9.4A4.9 4.9 0 0 1 12 6.2a4.9 4.9 0 0 1 8.5 3.2c0 5.8-8.5 11.1-8.5 11.1Z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12c0 4.1-3.8 7.5-8.5 7.5-1 0-2-.15-2.9-.43L4 21l1.4-3.9A7 7 0 0 1 3.5 12C3.5 7.9 7.3 4.5 12 4.5s8.5 3.4 8.5 7.5Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l1 13h9l1-13"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14"/><path d="M17.5 8.5 21 12l-3.5 3.5"/><path d="M10.5 12H21"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 2.5s.6 2.7-1.3 4.6c-1.6 1.6-3.9 3.5-3.9 6.6a5.7 5.7 0 0 0 11.4 0c0-2.2-1-3.5-1.8-4.4-.3 1-1 1.6-1.6 1.6.8-2.6-.3-6.3-2.8-8.4Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
    retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8a8.5 8.5 0 1 1-.5 8"/><path d="M3 3.5V8h4.5"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2Z"/></svg>',
    dict: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10.6 4.8 8.4 4 5.5 4H3v15.5h3.5c2.3 0 4.2.6 5.5 2 1.3-1.4 3.2-2 5.5-2H21V4h-3.5c-2.9 0-5.1.8-6.5 2.5Z"/><path d="M12 6.5v15"/></svg>'
  };
  function icon(n, cls) { return '<span class="ico ' + (cls || "") + '" aria-hidden="true">' + (ICONS[n] || "") + "</span>"; }

  /* ---------------- 小工具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function avatar(name, variant, size) {
    var ch = (name || "?").trim().charAt(0).toUpperCase();
    return '<span class="avatar ' + (size || "") + " v" + (variant || 1) + '">' + esc(ch) + "</span>";
  }
  function bar(pct, cls) {
    pct = Math.max(0, Math.min(100, pct || 0));
    return '<div class="bar ' + (cls || "") + '"><i class="bar-fill" style="width:0" data-target="' + pct + '"></i></div>';
  }
  function ring(pct, size, centerHtml) {
    size = size || 118;
    var r = (size - 10) / 2, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<div class="rc-ring" style="width:' + size + "px;height:" + size + 'px">' +
      '<svg class="ring-svg" width="' + size + '" height="' + size + '">' +
      '<circle class="ring-bg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"/>' +
      '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '" data-ring="' + off + '"/>' +
      "</svg>" +
      '<div class="ring-center">' + (centerHtml || ("<b>" + Math.round(pct) + "%</b>")) + "</div></div>";
  }
  function langOf(code) { return D.langIndex[code]; }
  function langChip(code) {
    var l = langOf(code);
    if (!l) return "";
    return '<span class="chip chip-plain">' + l.flag + " " + esc(l.name) + "</span>";
  }
  function lastNDays(n) {
    var out = [], today = new Date();
    for (var i = n - 1; i >= 0; i--) out.push(S._util.dateKey(S._util.addDays(today, -i)));
    return out;
  }
  function nextUp() {
    var u = S.actor();
    var st = S.stats();
    var langs = (u && u.targetLangs && u.targetLangs.length) ? u.targetLangs.slice() : [D.languages[0].code];
    langs = langs.filter(function (c) { return D.langIndex[c]; });
    if (!langs.length) langs = [D.languages[0].code];
    for (var i = 0; i < langs.length; i++) {
      var ids = D.lessonsOfLang(langs[i]);
      for (var j = 0; j < ids.length; j++) {
        if (!st.lessons[ids[j]] || !st.lessons[ids[j]].done) return ids[j];
      }
    }
    var first = D.lessonsOfLang(langs[0]);
    return first.length ? first[first.length - 1] : D.order[0];
  }

  /* ======================================================================
     落地页
     ====================================================================== */
  function landing() {
    var st = D.stats();
    var scripts = D.languages.map(function (l) {
      return '<div class="script-row" data-lang="' + l.code + '">' +
        '<div class="script-main"><span class="script-word">' + esc(l.greeting) + "</span>" +
        '<div class="script-meta">' + l.flag + " " + esc(l.native) + " · " + esc(l.name) + "</div></div>" +
        '<button class="speak-btn" data-speak="' + esc(l.greeting) + '" data-locale="' + l.locale + '" aria-label="朗读' + esc(l.name) + '">' + icon("speaker") + "</button>" +
        "</div>";
    }).join("");

    var features = [
      { n: "01", c: "#2F4B7C", t: "分级课程体系", d: "A1 → B2 逐级进阶，每门语言按「问候—日常—叙述—表达」四段式组织单元，学完一节能明确说出自己掌握了什么。" },
      { n: "02", c: "#E0483C", t: "四类互动训练", d: "单词翻卡记忆、语法选择练习、听力理解、口语跟读评分。一节课内四关连打，输入输出闭环。" },
      { n: "03", c: "#0F8271", t: "学习进度追踪", d: "连续天数、经验值、技能正确率、活跃热力图，把「学过」变成看得见的数据。" },
      { n: "04", c: "#7A4FA3", t: "进度保存在本机", d: "建立本机学习档案后，课程进度、单词熟练度与金币成就保存在这台设备的浏览器里，无需注册、不联网也能用。" },
      { n: "05", c: "#C2751B", t: "个性化学习路径", d: "按目标语言、当前级别与薄弱技能，自动排出今日该学哪一课、明天补哪一项。" },
      { n: "06", c: "#2F4B7C", t: "成就与示例社区", d: "解锁 " + S.BADGES.length + " 枚成就徽章。社区与排行榜为本地示例数据，用于演示功能，不与真实用户互通。" }
    ].map(function (f) {
      return '<article class="feature" style="--feature-c:' + f.c + '">' +
        '<span class="fnum">' + f.n + "</span><h3>" + f.t + "</h3><p>" + f.d + "</p></article>";
    }).join("");

    var langCards = D.languages.map(function (l) {
      return '<article class="lang-card" style="border-top:3px solid ' + l.color + '">' +
        '<div class="lc-flag">' + l.flag + "</div>" +
        '<div class="lc-serif" style="color:' + l.color + '">' + esc(l.greeting) + "</div>" +
        "<h3>" + esc(l.name) + " · " + esc(l.native) + "</h3>" +
        "<p>" + esc(l.blurb) + "</p>" +
        '<div class="lesson-tags" style="margin-top:14px">' +
        l.highlights.map(function (h) { return '<span class="chip chip-plain">' + esc(h) + "</span>"; }).join("") +
        "</div>" +
        '<div class="tiny muted" style="margin-top:14px">共 ' + D.countByLang[l.code] + " 节课 · " + esc(l.levels.map(function (x) { return x.badge; }).join(" / ")) + "</div>" +
        "</article>";
    }).join("");

    return '<div class="landing">' +
      '<header class="landing-nav">' +
      '<div class="brand"><span class="seal">语</span><div><div class="brand-name">Lingua</div></div></div>' +
      '<nav class="links"><a href="#features">课程特色</a><a href="#languages">语种</a><a href="#/achievements">成就</a></nav>' +
      '<div class="actions"><button class="btn btn-ghost" data-link="#/login">选择档案</button><button class="btn btn-ink" data-link="#/register">免费开始</button></div>' +
      "</header>" +

      '<section class="hero"><div class="hero-inner">' +
      "<div>" +
      '<h1>把一门语言<em>真正说出口</em></h1>' +
      '<p class="hero-lede">英语、日语、韩语，三门主流语言分级课程。单词、语法、听力、口语跟读四类训练连打，每天 15 分钟，进度与成就会替你记住每一步。</p>' +
      '<div class="hero-cta"><button class="btn btn-primary btn-lg" data-link="#/learn/' + D.order[0] + '">立即试学第一课</button>' +
      '<button class="btn btn-outline-light btn-lg" data-link="#/courses">先逛逛课程</button>' +
      '<button class="btn btn-outline-light btn-lg" data-link="#/register">创建档案保存进度</button></div>' +
      '<div class="hero-stats">' +
      "<div class=\"hero-stat\"><b>" + st.languages + "</b><span>门语言课程</span></div>" +
      "<div class=\"hero-stat\"><b>" + st.lessons + "</b><span>节分级课程</span></div>" +
      "<div class=\"hero-stat\"><b>" + st.exercises + "</b><span>个互动练习</span></div>" +
      "</div></div>" +
      '<div class="script-card">' + scripts +
      '<div class="tiny" style="color:rgba(255,255,255,.45);padding:10px 14px 6px">点击喇叭，先听听这三门语言的问候。</div>' +
      "</div></div></section>" +

      '<section class="section" id="features"><div class="section-head"><h2>六件事，构成一次完整的学习</h2>' +
      "<p>从课程结构到社区激励，每一环都为了同一个目标：让你在离开页面时，真的多会说一句。</p></div>" +
      '<div class="feature-grid">' + features + "</div></section>" +

      '<section class="section" id="languages" style="padding-top:0"><div class="section-head"><h2>选择你的第一门语言</h2>' +
      "<p>注册后随时可以在个人中心添加或切换目标语言，进度互不干扰。</p></div>" +
      '<div class="lang-strip">' + langCards + "</div></section>" +

      '<section class="hero" style="padding:56px clamp(20px,5vw,56px)"><div class="hero-inner" style="align-items:center">' +
      '<div><h2 style="font-size:clamp(26px,3.4vw,36px);color:#fff">今天就上一节，明天就多会一句。</h2>' +
      '<p class="hero-lede" style="margin-top:14px">创建档案后，系统会根据你的目标语言和水平，直接排出第一节课。</p></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-start"><button class="btn btn-primary btn-lg" data-link="#/register">免费开始学习</button>' +
      '<button class="btn btn-outline-light btn-lg" data-link="#/login">选择档案</button></div></div></section>' +

      '<footer class="landing-foot"><div class="brand"><span class="seal">语</span><span class="brand-name">Lingua</span></div>' +
      "<span>多语种沉浸式学习平台 · 英语 / 日语 / 韩语</span></footer></div>";
  }

  /* ======================================================================
     登录 / 注册
     ====================================================================== */
  function auth(mode) {
    var isReg = mode === "register";
    var aside = '<aside class="auth-aside">' +
      '<div class="brand"><span class="seal">语</span><div class="brand-name" style="color:#fff">Lingua</div></div>' +
      '<div style="margin-top:auto"><h2>每一次开口，都算数。</h2>' +
      '<div class="script-mini">' +
      D.languages.map(function (x) { return "<span>" + esc(x.greeting) + " <em style=\"font-style:normal;font-size:13px;opacity:.6\">" + esc(x.name) + "</em></span>"; }).join("") +
      "</div>" +
      '<p class="quote">学习档案会记录你的连续天数、单词熟练度和技能正确率，随时可以回来看见自己的变化。</p></div></aside>';

    var body;
    if (isReg) {
      body = '<form id="auth-form" autocomplete="off">' +
        '<h1>创建本机学习档案</h1><p class="sub">只需一个昵称，档案与进度保存在这台设备的浏览器里。</p>' +
        '<div id="auth-err"></div>' +
        '<div class="field"><label for="f-name">昵称</label><input id="f-name" name="name" placeholder="例如：林小满" maxlength="16">' +
        '<div class="hint">纯本地档案，无需邮箱与密码；换设备或清缓存会重置。</div></div>' +
        '<div class="field"><label>我想学习</label><div class="lang-picker">' +
        D.languages.map(function (x, i) {
          return '<input type="checkbox" id="lang-' + x.code + '" name="targetLangs" value="' + x.code + '"' + (i === 0 ? " checked" : "") + ">" +
            '<label for="lang-' + x.code + '">' + x.flag + " " + esc(x.name) + "</label>";
        }).join("") + "</div></div>" +
        '<div class="field-row">' +
        '<div class="field"><label for="f-level">当前水平</label><select id="f-level" name="level"><option value="A1">A1 零基础</option><option value="A2">A2 学过一点</option><option value="B1">B1 能简单交流</option></select></div>' +
        '<div class="field"><label for="f-goal">每日目标</label><select id="f-goal" name="dailyGoal"><option value="15">15 分钟</option><option value="30" selected>30 分钟</option><option value="60">60 分钟</option></select></div>' +
        "</div>" +
        '<button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:8px">创建档案并进入</button>' +
        '<div class="auth-switch">已有本机档案？<a href="#/login">切换档案</a></div>' +
        "</form>";
    } else {
      var pros = S.profiles();
      body = '<h1>选择本机档案</h1><p class="sub">档案与进度都保存在这台设备，没有账号密码，直接选一个继续。</p>' +
        '<div id="auth-err"></div>' +
        (pros.length ?
          '<div style="margin:4px 0 20px">' + pros.map(function (p) {
            return '<button class="btn btn-block profile-pick" type="button" data-action="pick-profile" data-id="' + p.id + '" style="margin-bottom:10px;display:flex;align-items:center;gap:12px;justify-content:flex-start;text-align:left;padding:10px 14px">' +
              avatar(p.name, p.avatarVar, "sm") + '<span style="flex:1;font-weight:600">' + esc(p.name) + "</span>" +
              '<span class="tiny muted-2">建于 ' + S._util.dateKey(new Date(p.createdAt)) + "</span></button>";
          }).join("") + "</div>"
          : '<div class="tiny muted" style="margin:4px 0 20px">这台设备上还没有档案。</div>') +
        '<button class="btn btn-primary btn-block btn-lg" data-link="#/register">新建本机档案</button>' +
        '<button class="btn btn-block" type="button" id="demo-login" style="margin-top:10px">使用演示档案体验</button>';
    }

    return '<div class="auth-wrap">' + aside + '<div class="auth-main"><div class="auth-card">' + body + "</div></div></div>";
  }

  /* ======================================================================
     应用外壳
     ====================================================================== */
  var NAV = [
    { group: "今天", items: [
      { href: "#/dashboard", icon: "home", text: "今天", primary: true },
      { href: "#/courses", icon: "book", text: "课程" }
    ]},
    { group: "复习", items: [
      { href: "#/review", icon: "retry", text: "复习", primary: true },
      { href: "#/challenge", icon: "bolt", text: "限时挑战" },
      { href: "#/glossary", icon: "dict", text: "词汇库" }
    ]},
    { group: "我的", items: [
      { href: "#/profile", icon: "user", text: "我的", primary: true },
      { href: "#/achievements", icon: "award", text: "成就" }
    ]}
  ];

  function shell(active, title, sub, contentHtml) {
    var u = S.actor();
    var st = S.stats();
    var navHtml = NAV.map(function (g) {
      return '<div class="nav-label">' + g.group + "</div>" + g.items.map(function (it) {
        return '<a class="nav-item ' + (active === it.href ? "active" : "") + (it.primary ? " nav-primary" : "") + '" href="' + it.href + '">' +
          icon(it.icon) + '<span class="nav-text">' + it.text + "</span></a>";
      }).join("");
    }).join("");

    var foot = u.guest ?
      '<div class="sidebar-foot guest-foot">' +
      '<button class="btn btn-primary btn-sm btn-block" data-link="#/register">创建档案，保存进度</button>' +
      '<button class="btn btn-sm btn-block" data-link="#/login" style="margin-top:8px">切换档案</button>' +
      '<div class="tiny muted-2" style="margin-top:8px;text-align:center">游客进度保存在本机，创建档案后自动继承</div></div>'
      :
      '<div class="sidebar-foot"><a class="sidebar-user" href="#/profile">' +
      avatar(u.name, u.avatarVar) +
      '<div style="min-width:0"><div class="su-name">' + esc(u.name) + '</div><div class="su-sub">' + st.xp + " XP · " + (u.targetLangs || []).map(function (c) { return langOf(c) ? langOf(c).name : ""; }).filter(Boolean).join("/") + "</div></div>" +
      "</a></div>";

    return '<div class="shell">' +
      '<aside class="sidebar">' +
      '<div class="brand"><span class="seal">语</span><div><div class="brand-name">Lingua</div><div class="brand-sub">Language Lab</div></div></div>' +
      '<nav class="nav">' + navHtml + "</nav>" + foot + "</aside>" +
      '<div class="main">' +
      '<header class="topbar"><div><h1>' + esc(title) + "</h1>" + (sub ? '<div class="tb-sub">' + esc(sub) + "</div>" : "") + "</div>" +
      '<div class="topbar-right">' +
      '<span class="pill-stat"><span class="ps-ico">' + icon("flame", "ico-flame") + "</span>" + st.streak + "<small>天</small></span>" +
      '<span class="pill-stat"><span class="ps-ico">⭐</span>' + st.xp.toLocaleString() + "<small>XP</small></span>" +
      (u.guest ? "" : '<button class="btn btn-sm btn-ghost" data-action="logout" title="退出登录">' + icon("logout") + "</button>") +
      "</div></header>" +
      '<div class="content fade-in">' + contentHtml + "</div></div></div>";
  }

  /* ======================================================================
     学习中心
     ====================================================================== */
  function dashboard() {
    var u = S.actor(), st = S.stats();
    var nextId = nextUp();
    var info = D.lessonOf(nextId);
    var vs = S.vocabSummary();
    var goalPct = Math.min(100, Math.round(st.todayXp / Math.max(1, u.dailyGoal * 2) * 100));
    var hasData = st.lessonsDone + st.todayXp > 0;

    /* 继续学习大按钮 */
    var resume = '<div class="resume-card">' +
      '<div><div class="rc-kicker">继续学习</div>' +
      "<h2>" + esc(info.lang.flag + " " + info.lesson.title) +
      (info.lesson.sub ? " <span class=\"sub-lang\">" + esc(info.lesson.sub) + "</span>" : "") + "</h2>" +
      "<p>" + esc(info.level.name + " · " + info.unit.name + " · " + info.lesson.focus) + "</p>" +
      '<div class="rc-meta"><span>约 ' + info.lesson.minutes + " 分钟</span><span>+" + info.lesson.xp + " XP</span><span>" +
      info.lesson._counts.vocab + " 词 · " + info.lesson._counts.grammar + " 题 · " + info.lesson._counts.listening + " 听 · " + info.lesson._counts.speaking + " 说</span></div>" +
      '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" data-link="#/learn/' + nextId + '">开始这一课</button>' +
      '<button class="btn btn-outline-light" data-link="#/courses/' + info.lang.code + '">浏览课程</button></div></div>' +
      ring(goalPct, 118, "<div><b>" + st.todayXp + "</b><span style=\"font-size:11px;color:rgba(255,255,255,.6)\">今日 XP</span></div>") +
      "</div>";

    /* 到期复习提示 */
    var reviewHint = "";
    if (vs.due || st.mistakes) {
      reviewHint = '<div class="panel" style="margin-top:18px">' +
        '<div class="panel-head"><h2>复习</h2><a class="btn btn-sm btn-ghost" href="#/review">前往复习</a></div>' +
        '<div class="review-hint-row">' +
        (vs.due ? '<div class="hint-chip hint-chip-red"><b>' + vs.due + '</b><span>个单词到期</span></div>' : "") +
        (st.mistakes ? '<div class="hint-chip"><b>' + st.mistakes + '</b><span>道错题待攻克</span></div>' : "") +
        '</div></div>';
    }

    /* 统计块：只在有数据时显示 */
    var stats4 = "", skills = "", bars = "", recs = "", quick = "";
    if (hasData) {
      stats4 = '<div class="grid grid-4" style="margin-top:18px">' +
        statCard("连续学习", st.streak + " 天", "最长记录 " + st.bestStreak + " 天") +
        statCard("累计经验", st.xp.toLocaleString(), "今日 " + st.todayXp + " XP") +
        statCard("完成课程", st.lessonsDone + " 节", "共 " + D.order.length + " 节") +
        statCard("平均得分", st.avgScore + " 分", "掌握 " + st.wordsMastered + " 个单词") +
        "</div>";

      skills = ["vocab", "grammar", "listening", "speaking"].map(function (k) {
        var m = D.MODES.filter(function (x) { return x.key === k; })[0];
        var s = st.skills[k];
        var val = k === "speaking" ? (s.total ? s.avg : 0) : Math.round(s.acc * 100);
        return '<div class="skill-row"><span class="sr-name">' + m.name + "</span>" + bar(val, k === "speaking" ? "jade" : "") +
          '<span class="sr-val">' + (s.total ? val + "%" : "—") + "</span></div>";
      }).join("");

      var days = lastNDays(7);
      var maxXp = Math.max(20, Math.max.apply(null, days.map(function (d) { return st.days[d] || 0; })));
      var bars = '<div class="bars">' + days.map(function (d) {
        var v = st.days[d] || 0;
        var h = Math.round(v / maxXp * 100);
        var dow = ["日", "一", "二", "三", "四", "五", "六"][new Date(d + "T00:00:00").getDay()];
        return '<div class="bwrap" title="' + d + " · " + v + ' XP"><span class="tiny muted-2 mono" style="font-size:10px">' + v + '</span><div class="bcol" style="height:0" data-target-h="' + h + '"></div><span class="blbl">' + dow + "</span></div>";
      }).join("") + "</div>";

      var quick =
        '<div class="grid grid-3" style="margin-top:18px">' +
        '<button class="panel quick-card" data-link="#/review" style="text-align:left;cursor:pointer">' +
        '<div class="qc-ico" style="background:rgba(224,72,60,.12);color:var(--vermilion-dark)">' + icon("retry") + "</div>" +
        '<div><h3 style="margin-bottom:4px">复习</h3><div class="tiny muted">' + (vs.due ? "<b style=\"color:var(--vermilion-dark)\">" + vs.due + "</b> 个单词到期" : "单词都复习过了") + ' · ' + (st.mistakes ? "<b style=\"color:var(--vermilion-dark)\">" + st.mistakes + "</b> 道错题" : "无错题") + "</div></div></button>" +
        '<button class="panel quick-card" data-link="#/challenge" style="text-align:left;cursor:pointer">' +
        '<div class="qc-ico" style="background:rgba(194,117,27,.12);color:var(--gold)">' + icon("bolt") + "</div>" +
        '<div><h3 style="margin-bottom:4px">限时挑战</h3><div class="tiny muted">' + (st.challengeBest ? "最高纪录 <b>" + st.challengeBest + "</b> XP · 来破纪录" : "60 秒快答，连击加成") + "</div></div></button>" +
        '<button class="panel quick-card" data-link="#/glossary" style="text-align:left;cursor:pointer">' +
        '<div class="qc-ico" style="background:rgba(15,130,113,.12);color:var(--jade)">' + icon("dict") + "</div>" +
        '<div><h3 style="margin-bottom:4px">词汇库</h3><div class="tiny muted">已掌握 ' + st.wordsMastered + " / " + D.stats().exercises + " 词</div></div></button>" +
        "</div>";
    }

    /* 今日任务 */
    var quests = S.questState();
    var questsCard = '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>今日任务</h2>' +
      '<span class="tiny muted" style="margin-left:auto">每项 +15 XP · 全部完成额外 +20 XP</span></div>' +
      '<div class="quest-list">' +
      quests.map(function (q) {
        return '<div class="quest-row' + (q.done ? " done" : "") + '">' +
          '<span class="q-check">' + (q.done ? icon("check") : "") + "</span>" +
          '<div class="q-main"><div class="q-label">' + esc(q.label) + "</div>" + bar(q.pct, q.done ? "jade" : "") + "</div>" +
          '<span class="q-reward tiny muted-2 mono">' + q.value + " / " + q.target + "</span></div>";
      }).join("") +
      "</div>" +
      '<div class="tiny muted-2" style="margin-top:10px">已完成 ' + quests.filter(function (q) { return q.done; }).length + " / " + quests.length + " · 每天凌晨刷新</div></div>";

    var content = resume + reviewHint + questsCard +
      (quick ? quick : "") +
      (stats4 ? stats4 : "") +
      (stats4 ? '<div class="grid grid-2" style="margin-top:18px"><div class="panel"><div class="panel-head"><h2>技能掌握</h2><div class="ph-actions"><a class="btn btn-sm btn-ghost" href="#/progress">查看详情</a></div></div>' + skills + "</div>" +
      '<div class="panel"><div class="panel-head"><h2>近七天经验</h2><span class="tiny muted" style="margin-left:auto">单位 XP</span></div>' + bars + "</div></div>" : "") +
      (st.challengeBest || st.xp ? '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>为你推荐</h2><div class="ph-actions"><a class="btn btn-sm btn-ghost" href="#/courses">全部课程</a></div></div>' + recommend().slice(0, 3).map(function (r) {
        return '<div class="path-node ' + (r.today ? "today" : "") + '"><div class="path-card">' +
          '<div><h4>' + esc(r.title) + '</h4><div class="pc-sub">' + esc(r.sub) + "</div></div>" +
          '<div class="pc-right"><button class="btn btn-sm ' + (r.today ? "btn-primary" : "") + '" data-link="#/learn/' + r.id + '">' + (r.today ? "开始" : "学习") + "</button></div></div></div>";
      }).join("") + "</div>" : "");

    return shell("#/dashboard", "今天", greeting() + "，" + u.name, content);
  }

  function statCard(label, value, foot) {
    return '<div class="stat-card"><span class="sc-label">' + esc(label) + '</span><span class="sc-value">' + esc(value) + '</span><span class="sc-foot">' + esc(foot) + "</span></div>";
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 11) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  }

  /* ======================================================================
     课程目录
     ====================================================================== */
  function courses(code) {
    var u = S.actor();
    var st = S.stats();
    var langs = D.languages;
    if (!code || !D.langIndex[code]) {
      code = (u.targetLangs && u.targetLangs[0] && D.langIndex[u.targetLangs[0]]) ? u.targetLangs[0] : langs[0].code;
    }
    var lang = D.langIndex[code];

    var tabs = '<div class="lang-tabs">' + langs.map(function (l) {
      var done = st.perLang[l.code] ? st.perLang[l.code].done : 0;
      return '<button class="lang-tab ' + (l.code === code ? "active" : "") + '" data-link="#/courses/' + l.code + '">' +
        '<span class="lt-flag">' + l.flag + "</span>" + esc(l.name) +
        '<span class="tiny" style="opacity:.7">' + done + "/" + D.countByLang[l.code] + "</span></button>";
    }).join("") + "</div>";

    /* ---- 路径地图：线性解锁（自由模式全开），蜿蜒节点 + Boss 课 ---- */
    var freeMode = S.progress().freeMode;
    var langIds = D.lessonsOfLang(code);
    var firstUndone = null;
    langIds.forEach(function (id) {
      if (firstUndone === null && !(st.lessons[id] && st.lessons[id].done)) firstUndone = id;
    });
    if (freeMode) firstUndone = null;

    var flip = 0;
    function pmNode(ls, isBoss) {
      var rec = st.lessons[ls.id];
      var done = rec && rec.done;
      var state = done ? "done" : (ls.id === firstUndone ? "current" : (freeMode ? "open" : "locked"));
      var side = (flip++ % 2) ? "s-right" : "s-left";
      var meta = done ?
        '<span class="pm-meta"><span class="pm-star">⭐</span>' + rec.best + " 分</span>" :
        '<span class="pm-meta">+' + ls.xp + " XP</span>";
      if (state === "current") meta += '<span class="chip chip-red pm-go">开始</span>';
      var inner = state === "locked" ? icon("lock") : (state === "done" ? "⭐" : icon("play"));
      var click = state === "locked" ? ' data-action="locked"' : ' data-link="#/learn/' + ls.id + '"';
      return '<div class="pm-row ' + side + '">' +
        '<button class="pm-node ' + state + (isBoss ? " boss" : "") + '"' + click + ' aria-label="' + esc(ls.title) + '">' + inner + "</button>" +
        '<div class="pm-bubble"><div class="pm-title">' + esc(ls.title) + "</div>" +
        (ls.sub ? '<span class="sub-lang">' + esc(ls.sub) + "</span>" : "") +
        '<div class="pm-sub">' + esc(ls.focus) + "</div>" + meta + "</div></div>";
    }

    var levelsHtml = lang.levels.map(function (level) {
      var units = level.units.map(function (unit) {
        var rows = unit.lessons.map(function (ls, li) {
          return pmNode(ls, li === unit.lessons.length - 1);
        }).join("");
        var unitDone = unit.lessons.filter(function (l) { return st.lessons[l.id] && st.lessons[l.id].done; }).length;
        return '<div class="pm-unit"><div class="pm-unit-head"><h3>' + esc(unit.name) +
          (unit.sub ? ' <span class="sub-lang">' + esc(unit.sub) + "</span>" : "") + "</h3>" +
          '<span class="tiny muted">' + esc(unit.theme) + "</span>" +
          '<span class="chip chip-plain" style="margin-left:auto">' + unitDone + " / " + unit.lessons.length + "</span></div>" +
          '<div class="pm-track">' + rows + "</div></div>";
      }).join("");

      var doneCount = level.units.reduce(function (a, un) {
        return a + un.lessons.filter(function (l) { return st.lessons[l.id] && st.lessons[l.id].done; }).length;
      }, 0);
      var totalCount = level.units.reduce(function (a, un) { return a + un.lessons.length; }, 0);

      return '<div class="level-block panel"><div class="panel-head">' +
        '<span class="level-badge ' + level.badge.toLowerCase() + '">' + level.badge + "</span>" +
        "<div><h2>" + esc(level.name) + '</h2><div class="tiny muted">' + esc(level.goal) + "</div></div>" +
        '<div class="ph-actions"><span class="chip chip-plain">' + doneCount + "/" + totalCount + " 完成</span></div></div>" +
        units + "</div>";
    }).join("");

    var head = '<div class="panel" style="margin-bottom:18px;display:flex;gap:20px;align-items:center;flex-wrap:wrap">' +
      '<div style="font-size:38px;line-height:1">' + lang.flag + "</div>" +
      '<div style="flex:1;min-width:220px"><h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:4px">' + esc(lang.name) + " · " + esc(lang.native) + "</h2>" +
      '<p class="tiny muted">' + esc(lang.blurb) + "</p></div>" +
      '<div style="min-width:180px;width:180px">' + bar(st.perLang[code] ? Math.round((st.perLang[code].done / D.countByLang[code]) * 100) : 0, "jade") +
      '<div class="tiny muted" style="margin-top:6px">已完成 ' + (st.perLang[code] ? st.perLang[code].done : 0) + " / " + D.countByLang[code] + " 节</div></div>" +
      "</div>";

    return shell("#/courses", "课程目录", "英语 / 日语 / 韩语 · 分级递进的课程体系", tabs + head + levelsHtml);
  }

  /* ======================================================================
     学习路径
     ====================================================================== */
  function recommend() {
    var u = S.actor(), st = S.stats();
    var langs = (u.targetLangs && u.targetLangs.length) ? u.targetLangs.filter(function (c) { return D.langIndex[c]; }) : [D.languages[0].code];
    if (!langs.length) langs = [D.languages[0].code];
    var out = [];
    var seen = {};
    langs.forEach(function (code) {
      var ids = D.lessonsOfLang(code);
      for (var i = 0; i < ids.length && out.length < 6; i++) {
        var rec = st.lessons[ids[i]];
        if (!rec || !rec.done) {
          var info = D.lessonOf(ids[i]);
          out.push({
            id: ids[i],
            title: info.lang.flag + " " + info.lesson.title,
            sub: info.level.name + " · " + info.unit.name + " · " + info.lesson.focus,
            today: out.length === 0,
            lang: code
          });
        }
      }
    });
    // 用复习补充
    var reviewables = Object.keys(st.lessons).filter(function (id) {
      return st.lessons[id].done && st.lessons[id].best < 90 && D.lessonOf(id);
    }).slice(0, 2);
    reviewables.forEach(function (id) {
      var info = D.lessonOf(id);
      out.push({
        id: id, title: info.lang.flag + " " + info.lesson.title + "（复习）",
        sub: "上次 " + st.lessons[id].best + " 分 · 建议重做一次", today: false, lang: info.lang.code
      });
    });
    return out;
  }

  function pathPage() {
    var u = S.actor(), st = S.stats();
    var recs = recommend();
    if (!recs.length) recs = [{ id: D.order[0], title: "从第一课开始", sub: "还没有学习记录", today: true, lang: D.languages[0].code }];

    // 薄弱技能
    var weakKey = null, weakVal = 2;
    ["vocab", "grammar", "listening", "speaking"].forEach(function (k) {
      var s = st.skills[k];
      if (!s.total) return;
      var v = k === "speaking" ? s.avg / 100 : s.acc;
      if (v < weakVal) { weakVal = v; weakKey = k; }
    });
    var focusHtml;
    if (!weakKey) {
      focusHtml = '<div class="focus-card" style="border-color:rgba(15,130,113,.3);background:rgba(15,130,113,.05)">' +
        '<div class="fc-ico" style="background:var(--jade)">' + icon("target") + "</div>" +
        "<div><h4>先建立基线</h4><p>完成任意一节课，系统就会根据你的正确率找出最需要加强的技能，并写入下面的路径。</p></div></div>";
    } else {
      var m = D.MODES.filter(function (x) { return x.key === weakKey; })[0];
      var advice = {
        vocab: "单词熟练度偏低。建议今天先用翻卡模式把这一课的 6 个词过两遍，标记「不认识」的词会在下一轮重新出现。",
        grammar: "语法题正确率偏低。做错的题下方都有解析，读完解析再重做同类题，效果最好。",
        listening: "听力理解正确率偏低。先点「0.7x 慢速」听两遍，再回答；答完可以「显示原文」核对。",
        speaking: "跟读平均分偏低。注意跟着音频的节奏，先点小喇叭听一遍标准发音，再按下麦克风朗读。"
      }[weakKey];
      focusHtml = '<div class="focus-card"><div class="fc-ico">!</div><div><h4>今日重点：' + m.name + "（" + Math.round(weakVal * 100) + "%）</h4><p>" + advice + "</p></div></div>";
    }

    var nodes = recs.map(function (r) {
      return '<div class="path-node ' + (r.today ? "today" : "") + '"><div class="path-card">' +
        '<div><h4>' + esc(r.title) + '</h4><div class="pc-sub">' + esc(r.sub) + "</div></div>" +
        '<div class="pc-right"><button class="btn btn-sm ' + (r.today ? "btn-primary" : "") + '" data-link="#/learn/' + r.id + '">' + (r.today ? "今日开始" : "学习") + "</button></div></div></div>";
    }).join("");

    // 一周计划
    var week = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(); d.setDate(d.getDate() + i);
      var key = S._util.dateKey(d);
      var r = recs[i] || recs[recs.length - 1];
      var isToday = i === 0;
      var studied = st.days[key] || 0;
      week.push('<div class="path-node ' + (isToday ? "today" : (studied ? "done" : "")) + '"><div class="path-card">' +
        '<span class="day-pill">' + (isToday ? "今天" : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()]) + "</span>" +
        "<div><h4>" + esc(r.title) + '</h4><div class="pc-sub">' + esc(r.sub) + (studied ? " · 已学习 " + studied + " XP" : "") + "</div></div>" +
        '<div class="pc-right">' + (isToday ? '<button class="btn btn-sm btn-primary" data-link="#/learn/' + r.id + '">开始</button>' : '<span class="tiny muted-2">' + S._util.dateKey(d).slice(5) + "</span>") + "</div></div></div>");
    }

    var content = focusHtml +
      '<div class="grid grid-2" style="margin-top:18px">' +
      '<div class="panel"><div class="panel-head"><h2>推荐学习顺序</h2><span class="tiny muted" style="margin-left:auto">依据：目标语言 · 级别 · 薄弱技能</span></div>' +
      '<div class="path-rail">' + nodes + "</div></div>" +
      '<div class="panel"><div class="panel-head"><h2>未来七天节奏</h2><span class="tiny muted" style="margin-left:auto">每日目标 ' + u.dailyGoal + " 分钟</span></div>" +
      '<div class="path-rail">' + week.join("") + "</div></div></div>";

    return shell("#/path", "学习路径", "根据你的水平与薄弱环节自动生成", content);
  }

  /* ======================================================================
     进度追踪
     ====================================================================== */
  function progressPage() {
    var st = S.stats();
    var days = lastNDays(84);
    var cells = days.map(function (d) {
      var v = st.days[d] || 0;
      var lvl = v === 0 ? "" : v < 20 ? "l1" : v < 45 ? "l2" : v < 80 ? "l3" : "l4";
      return '<div class="heat-cell ' + lvl + '" title="' + d + " · " + v + ' XP"></div>';
    }).join("");

    var skills = ["vocab", "grammar", "listening", "speaking"].map(function (k) {
      var m = D.MODES.filter(function (x) { return x.key === k; })[0];
      var s = st.skills[k];
      var pct = k === "speaking" ? (s.total ? s.avg : 0) : Math.round(s.acc * 100);
      var sub = k === "speaking" ? s.total + " 次跟读" : s.correct + "/" + s.total + " 正确";
      return '<div style="padding:12px 0;border-bottom:1px solid var(--line-soft)">' +
        '<div class="skill-row" style="padding:0"><span class="sr-name">' + m.name + "</span>" + bar(pct, k === "speaking" ? "jade" : k === "listening" ? "gold" : "") +
        '<span class="sr-val">' + (s.total ? pct + "%" : "—") + "</span></div>" +
        '<div class="tiny muted-2" style="margin-top:6px">' + (s.total ? sub : "还没有练习记录") + "</div></div>";
    }).join("");

    var perLang = D.languages.map(function (l) {
      var p = st.perLang[l.code] || { done: 0, xp: 0, total: 0 };
      var total = D.countByLang[l.code];
      return '<tr style="border-bottom:1px solid var(--line-soft)">' +
        '<td style="padding:12px 0"><span style="font-size:18px">' + l.flag + "</span> " + esc(l.name) + "</td>" +
        '<td class="mono" style="text-align:right">' + p.done + " / " + total + "</td>" +
        '<td class="mono" style="text-align:right">' + p.xp + "</td>" +
        '<td style="width:150px"><div style="display:flex;justify-content:flex-end">' + bar(Math.round(p.done / total * 100), "jade") + "</div></td></tr>";
    }).join("");

    var days7 = lastNDays(14);
    var maxXp = Math.max(20, Math.max.apply(null, days7.map(function (d) { return st.days[d] || 0; })));
    var bars = '<div class="bars">' + days7.map(function (d) {
      var v = st.days[d] || 0;
      return '<div class="bwrap" title="' + d + " · " + v + ' XP"><div class="bcol" style="height:0" data-target-h="' + Math.round(v / maxXp * 100) + '"></div><span class="blbl">' + d.slice(8) + "</span></div>";
    }).join("") + "</div>";

    var content =
      '<div class="grid grid-4">' +
      statCard("累计经验", st.xp.toLocaleString(), "今日 " + st.todayXp + " XP") +
      statCard("连续学习", st.streak + " 天", "最长 " + st.bestStreak + " 天") +
      statCard("完成课程", st.lessonsDone + " 节", "平均 " + st.avgScore + " 分") +
      statCard("单词掌握", st.wordsMastered + " 个", "接触过 " + st.wordsSeen + " 个") +
      "</div>" +
      '<div class="grid grid-2" style="margin-top:18px">' +
      '<div class="panel"><div class="panel-head"><h2>技能正确率</h2></div>' + skills + "</div>" +
      '<div class="panel"><div class="panel-head"><h2>近十四天活跃</h2></div>' + bars +
      '<div class="panel-head" style="margin:24px 0 10px"><h2 style="font-size:15px">十二周学习热力图</h2></div>' +
      '<div class="heatmap">' + cells + "</div>" +
      '<div class="heat-legend"><span>少</span><span class="heat-cell" style="width:13px;display:inline-block"></span><span class="heat-cell l1" style="width:13px;display:inline-block"></span><span class="heat-cell l2" style="width:13px;display:inline-block"></span><span class="heat-cell l3" style="width:13px;display:inline-block"></span><span class="heat-cell l4" style="width:13px;display:inline-block"></span><span>多</span></div>' +
      "</div></div>" +
      '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>各语种进度</h2></div>' +
      '<table style="width:100%;border-collapse:collapse"><thead><tr class="tiny muted"><th style="text-align:left;padding-bottom:8px">语言</th><th style="text-align:right">完成课程</th><th style="text-align:right">经验</th><th></th></tr></thead><tbody>' + perLang + "</tbody></table></div>";

    return shell("#/progress", "进度追踪", "把每一天的学习变成可回看的数据", content);
  }

  /* ======================================================================
     社区
     ====================================================================== */
  function community(filter) {
    var u = S.actor();
    var all = S.feed();
    var list = filter && filter !== "all" ? all.filter(function (p) { return p.lang === filter; }) : all;

    var intro = '<div class="panel" style="margin-bottom:18px"><div class="tiny muted">' +
      (u.guest ? "你正在以游客身份浏览示例社区。" : "") +
      "社区与排行榜内容为本地示例数据，用于演示功能，不会与其他真实用户互通。</div>" +
      (u.guest ? '<div style="margin-top:12px"><button class="btn btn-primary btn-sm" data-link="#/register">创建本机档案，参与互动</button></div>' : "") +
      "</div>";
    var composer = u.guest ? "" : '<div class="panel" style="margin-bottom:18px"><div class="composer">' +
      avatar(u.name, u.avatarVar) +
      '<div class="cp-body"><textarea id="post-text" placeholder="分享你今天的学习心得、记单词的小技巧，或者一句刚学会的句子…" maxlength="500"></textarea>' +
      '<div class="cp-foot">' +
      D.languages.map(function (l) {
        return '<label class="chip chip-plain" style="cursor:pointer"><input type="radio" name="post-lang" value="' + l.code + '" style="margin-right:2px">' + l.flag + " " + esc(l.name) + "</label>";
      }).join("") +
      '<label class="chip chip-plain" style="cursor:pointer"><input type="radio" name="post-lang" value="all" checked style="margin-right:2px">综合</label>' +
      '<button class="btn btn-primary btn-sm" data-action="post" style="margin-left:auto">发布动态</button>' +
      '<span class="cp-hint">发布后可在成就中解锁「社区活跃」</span>' +
      "</div></div></div></div>";

    var tabs = '<div class="lang-tabs">' +
      '<button class="lang-tab ' + (!filter || filter === "all" ? "active" : "") + '" data-link="#/community">全部</button>' +
      D.languages.map(function (l) {
        return '<button class="lang-tab ' + (filter === l.code ? "active" : "") + '" data-link="#/community/' + l.code + '"><span class="lt-flag">' + l.flag + "</span>" + esc(l.name) + "</button>";
      }).join("") + "</div>";

    var posts = list.length ? list.map(function (p) {
      var comments = p.comments.map(function (c) {
        return '<div class="comment">' + avatar(c.authorName, c.avatarVar, "sm") +
          '<div class="cm-body"><div class="cm-name">' + esc(c.authorName) + ' <span class="post-time">' + S._util.relTime(c.createdAt) + "</span></div>" +
          '<div class="cm-text">' + esc(c.text) + "</div></div></div>";
      }).join("");
      return '<article class="post" data-post="' + p.id + '">' +
        '<div class="post-head">' + avatar(p.authorName, p.avatarVar) +
        '<div><div class="post-name">' + esc(p.authorName) + (p.mine ? ' <span class="chip chip-red" style="font-size:10px">我</span>' : "") + "</div>" +
        '<div class="post-time">' + S._util.relTime(p.createdAt) + "</div></div>" +
        (p.lang && p.lang !== "all" ? '<div style="margin-left:auto">' + langChip(p.lang) + "</div>" : "") +
        "</div>" +
        '<div class="post-body">' + esc(p.text) + "</div>" +
        (p.tags && p.tags.length ? '<div class="post-tags">' + p.tags.map(function (t) { return '<span class="chip chip-plain">#' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
        '<div class="post-foot">' +
        '<button class="react-btn ' + (p.liked ? "on" : "") + '" data-action="like" data-id="' + p.id + '">' + icon(p.liked ? "heartFill" : "heart") + "<span>" + p.likeCount + "</span></button>" +
        '<button class="react-btn" data-action="toggle-comments">' + icon("comment") + "<span>" + p.comments.length + "</span></button>" +
        (p.mine ? '<button class="react-btn" style="margin-left:auto" data-action="del-post" data-id="' + p.id + '">' + icon("trash") + "<span>删除</span></button>" : "") +
        "</div>" +
        '<div class="comments" style="display:none">' + comments +
        '<div class="comment-form">' + avatar(u.name, u.avatarVar, "sm") +
        '<input placeholder="写一句鼓励或回应…" data-comment-input="' + p.id + '" maxlength="200">' +
        '<button class="btn btn-sm btn-ink" data-action="comment" data-id="' + p.id + '">发送</button></div></div>' +
        "</article>";
    }).join("") : '<div class="empty"><div class="em-ico">💬</div><h3>这个语种还没有动态</h3><p>成为第一个分享学习心得的人。</p></div>';

    return shell("#/community", "学习社区（示例）", "本地示例数据，用于演示社区功能", intro + composer + tabs + posts);
  }

  /* ======================================================================
     成就 & 排行
     ====================================================================== */
  function achievements() {
    var st = S.stats();
    var badges = S.badgeState();
    var earned = badges.filter(function (b) { return b.earned; }).length;

    var grid = badges.map(function (b) {
      return '<div class="badge-card ' + (b.earned ? "" : "locked") + '">' +
        '<div class="badge-ico">' + (b.earned ? b.icon : icon("lock")) + "</div>" +
        "<h4>" + esc(b.name) + "</h4><p>" + esc(b.desc) + "</p>" +
        (b.earned ? '<span class="chip chip-gold">已解锁</span>' :
          '<div class="badge-prog">' + bar(b.pct, "gold") + '<div class="tiny muted-2" style="margin-top:6px">' + b.value + " / " + b.target + "</div></div>") +
        "</div>";
    }).join("");

    var board = S.leaderboard();
    var me = S.actor();
    var rows = board.slice(0, 12).map(function (r, i) {
      var isMe = r.real && r.id === me.id;
      return '<div class="leader-row ' + (i === 0 ? "top1 " : "") + (isMe ? "me" : "") + '">' +
        '<span class="leader-rank">' + (i + 1) + "</span>" +
        avatar(r.name, r.avatarVar, "sm") +
        "<span>" + esc(r.name) + (isMe ? ' <span class="chip chip-red" style="font-size:10px">我</span>' : "") + "</span>" +
        '<span class="leader-xp">' + r.xp.toLocaleString() + "</span></div>";
    }).join("");
    var myRank = board.findIndex(function (r) { return r.real && r.id === me.id; }) + 1;

    var content = '<div class="grid grid-3" style="margin-bottom:18px">' +
      statCard("已解锁成就", earned + " / " + badges.length, earned === badges.length ? "全部达成" : "继续努力") +
      statCard("当前排名", "#" + (myRank || "-"), "共 " + board.length + " 位学习者") +
      statCard("累计经验", st.xp.toLocaleString(), "最快提升排名的方式") +
      "</div>" +
      '<div class="panel" style="margin-bottom:18px"><div class="panel-head"><h2>成就徽章</h2><span class="tiny muted" style="margin-left:auto">' + earned + " / " + badges.length + " 已解锁</span></div>" +
      '<div class="badge-grid">' + grid + "</div></div>" +
      '<div class="panel"><div class="panel-head"><h2>经验排行榜（示例）</h2><span class="tiny muted" style="margin-left:auto">本地示例数据 · 非真实用户</span></div>' + rows + "</div>";

    return shell("#/achievements", "成就与排行", "徽章对应真实学习行为，排行榜为示例数据", content);
  }

  /* ======================================================================
     个人中心
     ====================================================================== */
  function profile() {
    var u = S.actor(), st = S.stats();
    if (u.guest) {
      var g = '<div class="grid grid-2">' +
        '<div class="panel"><div class="panel-head"><h2>游客模式</h2></div>' +
        '<div class="tiny muted" style="margin-bottom:16px">你正在以游客身份学习，进度保存在这台设备的浏览器里。创建一个本机档案，即可拥有独立的昵称与档案，解锁成就与排行，游客进度会自动继承。</div>' +
        '<button class="btn btn-primary" data-link="#/register">创建本机档案</button>' +
        '<button class="btn" data-link="#/login" style="margin-left:10px">切换本机档案</button></div>' +
        '<div><div class="panel"><div class="panel-head"><h2>我的数据</h2></div><div class="grid grid-2">' +
        statCard("累计经验", st.xp.toLocaleString(), "") +
        statCard("连续天数", st.streak + " 天", "") +
        statCard("完成课程", st.lessonsDone + " 节", "") +
        statCard("单词掌握", st.wordsMastered + " 个", "") +
        "</div></div>" +
        '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>学习方式</h2></div>' +
        '<label class="free-mode-row"><input type="checkbox" name="free-mode"' + (S.progress().freeMode ? " checked" : "") + '>' +
        "<span><b>自由模式</b><div class=\"tiny muted\">开启后跳过线性解锁，全部课程随意学习；关闭则按顺序一课一课解锁。</div></span></label></div>" +
        '<div class="panel" style="margin-top:18px;border-color:rgba(224,72,60,.3)"><div class="panel-head"><h2 style="color:var(--vermilion-dark)">危险操作</h2></div>' +
        '<p class="tiny muted" style="margin-bottom:14px">清空本机保存的全部档案、进度与社区数据，恢复到初始状态。此操作不可撤销。</p>' +
        '<button class="btn" data-action="reset" style="border-color:var(--vermilion);color:var(--vermilion-dark)">清空所有数据</button></div>' +
        "</div></div>";
      return shell("#/profile", "我的", "游客模式 · 进度保存在本机", g);
    }
    var pros = S.profiles();
    var content = '<div class="grid grid-2">' +
      '<div class="panel"><div class="panel-head"><h2>学习档案</h2></div>' +
      '<div style="display:flex;gap:16px;align-items:center;margin-bottom:22px">' + avatar(u.name, u.avatarVar, "lg") +
      "<div><div style=\"font-size:19px;font-weight:700\">" + esc(u.name) + "</div>" +
      '<div class="tiny muted">本机档案 · 数据保存在此浏览器</div>' +
      '<div class="tiny muted-2">创建于 ' + S._util.dateKey(new Date(u.createdAt)) + "</div></div></div>" +
      '<form id="profile-form">' +
      '<div class="field"><label for="p-name">昵称</label><input id="p-name" name="name" value="' + esc(u.name) + '" maxlength="16"></div>' +
      '<div class="field"><label for="p-bio">一句话简介</label><input id="p-bio" name="bio" value="' + esc(u.bio || "") + '" maxlength="60" placeholder="例如：正在攻克日语 N4"></div>' +
      '<div class="field"><label>目标语言</label><div class="lang-picker">' +
      D.languages.map(function (l) {
        return '<input type="checkbox" id="pl-' + l.code + '" name="targetLangs" value="' + l.code + '"' + (u.targetLangs.indexOf(l.code) >= 0 ? " checked" : "") + ">" +
          '<label for="pl-' + l.code + '">' + l.flag + " " + esc(l.name) + "</label>";
      }).join("") + "</div></div>" +
      '<div class="field-row">' +
      '<div class="field"><label for="p-level">当前水平</label><select id="p-level" name="level">' +
      ["A1", "A2", "B1"].map(function (x) { return '<option value="' + x + '"' + (u.level === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div>" +
      '<div class="field"><label for="p-goal">每日目标</label><select id="p-goal" name="dailyGoal">' +
      [15, 30, 60].map(function (x) { return '<option value="' + x + '"' + (u.dailyGoal === x ? " selected" : "") + ">" + x + " 分钟</option>"; }).join("") + "</select></div>" +
      "</div>" +
      '<button class="btn btn-primary" type="submit">保存修改</button>' +
      "</form></div>" +

      '<div><div class="panel"><div class="panel-head"><h2>我的数据</h2></div>' +
      '<div class="grid grid-2">' +
      statCard("累计经验", st.xp.toLocaleString(), "") +
      statCard("连续天数", st.streak + " 天", "") +
      statCard("完成课程", st.lessonsDone + " 节", "") +
      statCard("单词掌握", st.wordsMastered + " 个", "") +
      "</div></div>" +
      '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>学习方式</h2></div>' +
      '<label class="free-mode-row"><input type="checkbox" name="free-mode"' + (S.progress().freeMode ? " checked" : "") + '>' +
      "<span><b>自由模式</b><div class=\"tiny muted\">开启后跳过线性解锁，全部课程随意学习；关闭则按顺序一课一课解锁。</div></span></label></div>" +
      '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>语言能力自评</h2></div>' +
      '<div class="tiny muted" style="margin-bottom:14px">当前设定：' + esc(u.level) + " · 每日 " + u.dailyGoal + " 分钟。学习路径会据此排序。</div>" +
      D.languages.map(function (l) {
        var p = st.perLang[l.code] || { done: 0, xp: 0 };
        var on = u.targetLangs.indexOf(l.code) >= 0;
        return '<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line-soft)">' +
          '<span style="font-size:18px">' + l.flag + "</span><span style=\"flex:1\">" + esc(l.name) +
          (on ? ' <span class="chip chip-jade" style="font-size:10px">学习中</span>' : "") + "</span>" +
          '<span class="mono tiny muted">' + p.done + "/" + D.countByLang[l.code] + " 课 · " + p.xp + " XP</span></div>";
      }).join("") + "</div>" +
      '<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>本机档案</h2></div>' +
      '<div class="tiny muted" style="margin-bottom:12px">这台设备上的全部档案，切换后将加载对应档案的进度：</div>' +
      pros.map(function (p) {
        return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line-soft)">' +
          avatar(p.name, p.avatarVar, "sm") + '<span style="flex:1;font-weight:600">' + esc(p.name) +
          (p.id === u.id ? ' <span class="chip chip-jade" style="font-size:10px">当前</span>' : "") + "</span>" +
          (p.id === u.id ? "" : '<button class="btn btn-sm" data-action="pick-profile" data-id="' + p.id + '">切换</button>') +
          "</div>";
      }).join("") +
      '<div style="margin-top:14px"><button class="btn btn-sm" data-link="#/register">新建档案</button></div></div>' +
      '<div class="panel" style="margin-top:18px;border-color:rgba(224,72,60,.3)"><div class="panel-head"><h2 style="color:var(--vermilion-dark)">危险操作</h2></div>' +
      '<p class="tiny muted" style="margin-bottom:14px">清空本机保存的全部档案、进度与社区数据，恢复到初始状态。此操作不可撤销。</p>' +
      '<button class="btn" data-action="reset" style="border-color:var(--vermilion);color:var(--vermilion-dark)">清空所有数据</button></div>' +
      "</div></div>";

    return shell("#/profile", "我的", "管理本机学习档案与偏好", content);
  }

  /* ======================================================================
     学习模块
     ====================================================================== */
  function lessonShell(lessonId) {
    var info = D.lessonOf(lessonId);
    return '<div class="lesson-shell"><div class="lesson-top">' +
      '<button class="lt-back" data-link="#/courses/' + info.lang.code + '" aria-label="返回课程">' + icon("left") + "</button>" +
      '<div class="lesson-progress"><div class="lp-labels"><span id="lp-title">' + esc(info.lang.flag + " " + info.lesson.title) +
      (info.lesson.sub ? " · " + esc(info.lesson.sub) : "") + "</span><span id=\"lp-pct\">0%</span></div>" +
      '<div class="bar" id="lp-bar"><i class="bar-fill" style="width:0"></i></div></div>' +
      "</div><div id=\"lesson-body\"></div></div>";
  }

  function modeToggle(active, counts, done) {
    return '<div class="mode-toggle">' + D.MODES.map(function (m) {
      var c = counts[m.key] || 0;
      var d = done[m.key] || 0;
      return '<button data-action="mode" data-mode="' + m.key + '" class="' + (active === m.key ? "active" : "") + (d >= c && c > 0 ? " mt-done" : "") + '">' +
        icon(m.icon) + m.name + '<span class="mt-count">' + d + "/" + c + "</span></button>";
    }).join("") + "</div>";
  }

  /* 单词卡 */
  function stageVocab(ctx) {
    var v = ctx.item;
    var front = '<div class="fc-face fc-front"><div class="fc-word">' + esc(v.t) + "</div>" +
      (v.r ? '<div class="fc-read">' + esc(v.r) + "</div>" : "") +
      '<span class="fc-hint">点击卡片查看释义</span></div>';
    var ex = v.ex ? esc(v.ex).replace(new RegExp(escapeRe(v.t), "gi"), function (m) { return '<span class="hl">' + m + "</span>"; }) : "";
    var back = '<div class="fc-face fc-back"><div class="fc-meaning">' + esc(v.m) + "</div>" +
      (ex ? '<div class="fc-ex">' + ex + "</div>" : "") +
      '<span class="fc-hint">记住了吗？</span></div>';

    return '<div class="stage-head"><h2>单词记忆</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="flashcard" id="flashcard"><div class="flashcard-inner">' + front + back + "</div></div>" +
      '<div class="flash-actions" id="flash-actions">' +
      '<button class="btn" data-action="speak-vocab">' + icon("speaker") + "听发音</button>" +
      '<button class="btn" data-action="reveal">看释义</button>' +
      "</div>" +
      '<div class="tiny muted-2" style="text-align:center;margin-top:16px">不认识的词会在本轮结束时再出现一次</div>';
  }

  function stageVocabRevealed(ctx) {
    var v = ctx.item;
    var front = '<div class="fc-face fc-front"><div class="fc-word">' + esc(v.t) + "</div>" +
      (v.r ? '<div class="fc-read">' + esc(v.r) + "</div>" : "") +
      '<span class="fc-hint">点击卡片返回</span></div>';
    var ex = v.ex ? esc(v.ex).replace(new RegExp(escapeRe(v.t), "gi"), function (m) { return '<span class="hl">' + m + "</span>"; }) : "";
    var back = '<div class="fc-face fc-back"><div class="fc-meaning">' + esc(v.m) + "</div>" +
      (ex ? '<div class="fc-ex">' + ex + "</div>" : "") +
      '<span class="fc-hint">记住了吗？</span></div>';
    return '<div class="stage-head"><h2>单词记忆</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="flashcard flipped" id="flashcard"><div class="flashcard-inner">' + front + back + "</div></div>" +
      '<div class="flash-actions">' +
      '<button class="btn btn-ink" data-action="speak-vocab">' + icon("speaker") + "听发音</button>" +
      '<button class="btn" data-action="unknown" style="border-color:var(--vermilion);color:var(--vermilion-dark)">' + icon("x") + "不认识</button>" +
      '<button class="btn btn-jade" data-action="known">' + icon("check") + "认识了</button>" +
      "</div>";
  }

  function stageVocabQuiz(ctx) {
    var v = ctx.item;
    var q = ctx.quiz;
    var optsHtml = q.opts.map(function (o, i) {
      return '<button class="opt" data-action="quiz-opt" data-opt="' + i + '"><span class="opt-key">' + "ABCD"[i] + "</span><span>" + esc(o.label) + "</span></button>";
    }).join("");
    var cls = "stage-quiz vocab-quiz";
    return '<div class="stage-head"><h2>快速验证</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="' + cls + '">' +
      '<div class="quiz-prompt">「<b>' + esc(v.t) + "</b>」哪个释义是正确的？</div>" +
      '<div class="opt-list">' + optsHtml + "</div>" +
      '<div class="tiny muted-2" style="margin-top:8px">检验通过才计入已掌握 ✓</div>' +
      "</div>";
  }

  function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* 语法题 */
  function optionList(opts, answer, fb) {
    return opts.map(function (o, i) {
      var cls = "";
      if (fb) { if (i === answer) cls = "correct"; else if (i === fb.opt) cls = "wrong"; }
      var attrs = fb ? ' disabled' : ' data-action="answer" data-opt="' + i + '"';
      return '<button class="opt ' + cls + '"' + attrs + '><span class="opt-key">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></button>";
    }).join("");
  }

  function explainBox(answer, why, fb) {
    if (!fb) return "";
    return '<div class="explain ' + (fb.correct ? "ok" : "no") + '">' + icon(fb.correct ? "check" : "x") +
      "<div><b>" + (fb.correct ? "回答正确" : "正确答案是 " + "ABCD"[answer]) + "</b>" + esc(why) + "</div></div>" +
      '<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="continue">' +
      (fb.isLast ? "完成本组" : "继续") + "</button></div>";
  }

  function stageGrammar(ctx, fb) {
    var d = ctx.item;
    return '<div class="stage-head"><h2>语法练习</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="quiz-q">' + esc(d.q) + "</div>" +
      '<div class="quiz-sub">' + esc(d.point) + "</div>" +
      '<div class="opts" id="opts">' + optionList(d.opts, d.a, fb) + "</div>" +
      explainBox(d.a, d.why, fb);
  }

  /* 听力 */
  function stageListening(ctx, revealed, fb, dictate) {
    var it = ctx.item;
    var trBox = fb ? '<div class="explain ok" style="margin-top:14px">' + icon("speaker") + "<div><b>原文与翻译</b>" + esc(it.text) + " —— " + esc(it.tr) + "</div></div>" : "";
    var dictateBox = "";
    if (!fb) {
      if (dictate && dictate.active) {
        var res = dictate.result;
        dictateBox = '<div class="dictate-box">' +
          '<div class="tiny muted" style="margin-bottom:8px">✍️ 听写模式：播放录音，把你听到的句子完整打出来</div>' +
          '<textarea id="dictate-input" class="dictate-input" rows="2" placeholder="在这里输入听到的内容…">' + esc(dictate.draft || "") + "</textarea>" +
          '<div style="display:flex;gap:10px;margin-top:10px">' +
          '<button class="btn btn-sm" data-action="play-slow">0.7x 慢速</button>' +
          '<button class="btn btn-sm btn-primary" data-action="dictate-submit" style="margin-left:auto">检查听写</button>' +
          '<button class="btn btn-sm btn-ghost" data-action="dictate">退出听写</button></div>' +
          (res ? '<div class="speak-result" style="margin-top:12px"><div style="display:flex;align-items:center;gap:14px">' +
            '<div class="score-big" style="color:' + (res.score >= 85 ? "var(--jade)" : res.score >= 60 ? "var(--gold)" : "var(--vermilion)") + '">' + res.score + '<span style="font-size:14px;color:var(--muted)">分</span></div>' +
            '<div class="tiny muted">' + (res.score >= 85 ? "听写优秀" : res.score >= 60 ? "大体正确，注意细节" : "再听几遍慢速，逐词核对") + "</div></div>" +
            '<div style="border-top:1px solid var(--line);padding-top:10px;margin-top:10px">' +
            res.marks.map(function (mk) { return '<span class="chip ' + (mk.hit ? "chip-jade" : "chip-red") + '" style="margin:0 5px 5px 0">' + esc(mk.token) + "</span>"; }).join("") + "</div>" +
            '<div class="tiny muted" style="margin-top:8px"><b>原文：</b>' + esc(it.text) + "</div></div>" : "") +
          "</div>";
      } else {
        dictateBox = '<div style="margin-bottom:16px"><button class="btn btn-sm btn-ghost" data-action="dictate">✍️ 听写这句（进阶练习）</button></div>';
      }
    }
    var listeningLabel = "点击播放，听录音后回答下面的问题";
    if (it.kind === "respond") listeningLabel = "点击播放，听这句话后选出最合适的回应";
    else if (it.kind === "judge") listeningLabel = "点击播放，听对话后判断哪个陈述正确";
    return '<div class="stage-head"><h2>听力训练</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="audio-deck">' +
      '<button class="play-big" id="play-big" data-action="play">' + icon("play") + "</button>" +
      '<div class="ad-label">' + listeningLabel + '</div>' +
      '<div class="ad-script" id="ad-script" style="display:' + (revealed || fb ? "block" : "none") + '">' + esc(it.text) + "</div>" +
      "</div>" +
      '<div class="play-tools" style="margin-bottom:20px">' +
      '<button class="btn btn-sm" data-action="play-slow">0.7x 慢速</button>' +
      '<button class="btn btn-sm" data-action="toggle-script">' + (revealed ? "隐藏原文" : "显示原文") + "</button></div>" +
      dictateBox +
      '<div class="quiz-q">' + esc(it.q || listeningLabel) + "</div>" +
      '<div class="opts" id="opts">' + optionList(it.opts, it.a, fb) + "</div>" +
      (fb ? trBox : "") +
      explainBox(it.a, fb && fb.correct ? "答对了，继续保持。" : "再听一遍录音，注意关键词。", fb);
  }

  /* 某一关完成 */
  function stageModeDone(mode, correct, total, nextMode) {
    var m = D.MODES.filter(function (x) { return x.key === mode; })[0];
    var pct = total ? Math.round(correct / total * 100) : 100;
    var color = pct >= 80 ? "var(--jade)" : pct >= 60 ? "var(--gold)" : "var(--vermilion)";
    var label = mode === "speaking" ? "本轮跟读已完成" : correct + " / " + total + " 正确";
    var nm = nextMode ? D.MODES.filter(function (x) { return x.key === nextMode; })[0] : null;
    return '<div class="stage-head"><h2>' + m.name + '</h2><span class="sh-step">本关完成</span></div>' +
      '<div style="text-align:center;padding:22px 0 8px">' +
      '<div style="font-family:var(--font-display);font-size:56px;line-height:1;color:' + color + '">' + pct + "%</div>" +
      '<div class="muted" style="margin-top:8px">' + label + "</div>" +
      '<div class="tiny muted-2" style="margin-top:6px">' + m.tip + "</div>" +
      '<div style="margin-top:24px">' + (nm ? '<button class="btn btn-primary btn-lg" data-action="mode" data-mode="' + nm.key + '">进入：' + nm.name + "</button>" : "") +
      "</div></div>";
  }

  /* 口语跟读 */
  function stageSpeaking(ctx, slot) {
    var it = ctx.item;
    var info = D.lessonOf(ctx.lessonId);
    var cls = info.lang.code === "ja" ? "ja" : info.lang.code === "ko" ? "ko" : "";
    return '<div class="stage-head"><h2>口语跟读</h2><span class="sh-step">' + (ctx.idx + 1) + " / " + ctx.total + "</span></div>" +
      '<div class="speak-stage">' +
      '<div class="tiny muted-2">先听标准发音，再按下麦克风朗读</div>' +
      '<div class="speak-target ' + cls + '">' + esc(it.text) + "</div>" +
      '<div class="speak-tr">' + esc(it.tr) + "</div>" +
      '<div style="display:flex;gap:12px;align-items:center">' +
      '<button class="btn" data-action="speak-target">' + icon("speaker") + "听示范</button>" +
      '<button class="mic-btn" id="mic-btn" data-action="mic" aria-label="开始朗读">' + icon("mic") + "</button>" +
      '<button class="btn btn-ghost" data-action="speak-skip" title="跳过本句，不计入正确率">跳过本句</button>' +
      "</div>" +
      '<div class="mic-hint" id="mic-hint">' + (Speech.asrAvailable() ? "点击麦克风开始识别" : "无法自动识别发音，可用「录音回放」自评") + "</div>" +
      (slot || "") +
      "</div>";
  }

  function speakResult(score, marks, said, ok) {
    var colors = score >= 85 ? "var(--jade)" : score >= 70 ? "var(--gold)" : "var(--vermilion)";
    var label = score >= 85 ? "非常接近母语者" : score >= 70 ? "基本清晰，再接再厉" : "再听一遍示范后重试";
    return '<div class="speak-result">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">' +
      '<div><div class="score-big" style="color:' + colors + '">' + score + '<span style="font-size:14px;color:var(--muted)">分</span></div>' +
      '<div class="tiny" style="color:' + colors + '">' + label + "</div></div>" +
      '<div style="flex:1;min-width:0"><div class="tiny muted" style="margin-bottom:6px">识别到的内容</div>' +
      '<div class="tiny" style="word-break:break-word">' + (esc(said) || '<span class="muted-2">（没有识别到语音）</span>') + "</div></div></div>" +
      '<div style="border-top:1px solid var(--line);padding-top:12px">' +
      marks.map(function (m) { return '<span class="chip ' + (m.hit ? "chip-jade" : "chip-red") + '" style="margin:0 5px 5px 0">' + esc(m.token) + "</span>"; }).join("") +
      '<div class="tiny muted-2" style="margin-top:8px">绿色为已读出的部分，红色需加强</div></div>' +
      '<div style="display:flex;gap:10px;margin-top:14px">' +
      '<button class="btn btn-sm" data-action="mic">' + icon("mic") + "重录一次</button>" +
      '<button class="btn btn-sm ' + (ok ? "btn-primary" : "") + '" data-action="next" style="margin-left:auto">下一句</button>' +
      "</div></div>";
  }

  /* 无 ASR 时的降级练习：听原音 → 录音回放 → 自评 */
  function speakPractice(state) {
    var recording = state === "recording";
    var recorded = state === "recorded";
    var hint = recording ? "正在录音…再点一次结束" : (recorded ? "回放听听看，满意就继续" : "点「录音」开始跟读");
    return '<div class="speak-result">' +
      '<div class="tiny muted">当前环境无法自动识别发音（Web Speech 识别服务不可用）。改用「听原音 → 录音回放 → 自评」练习。</div>' +
      '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center">' +
      '<button class="btn btn-sm" data-action="speak-target">' + icon("speaker") + "听原音</button>" +
      '<button class="btn btn-sm ' + (recording ? "btn-primary" : "") + '" data-action="rec">' + icon("mic") + (recording ? "停止录音" : (recorded ? "再录一次" : "录音")) + "</button>" +
      (recorded ? '<button class="btn btn-sm" data-action="rec-play">回放录音</button>' : "") +
      '<button class="btn btn-sm btn-ghost" data-action="speak-skip" style="margin-left:auto">跳过本句</button>' +
      "</div>" +
      '<div class="tiny muted-2" id="mic-hint" style="margin-top:8px">' + hint + "</div>" +
      (recorded ?
        '<div style="display:flex;gap:10px;margin-top:14px">' +
        '<button class="btn btn-sm btn-primary" data-action="next" style="margin-left:auto">自评：读得不错，继续</button></div>' : "") +
      "</div>";
  }

  /* 结果页 */
  function stageResult(ctx) {
    var info = D.lessonOf(ctx.lessonId);
    var r = ctx.result;
    var nextId = D.nextLessonId(ctx.lessonId);
    var badgeHtml = (r.badges || []).map(function (b) {
      return '<div class="badge-card" style="padding:14px;min-width:140px"><div class="badge-ico" style="width:44px;height:44px;font-size:20px">' + b.icon + "</div><h4>" + esc(b.name) + "</h4></div>";
    }).join("");
    /* 本课学会的词/句 */
    var vocabHtml = "";
    var lid = info.lessonId || ctx.lessonId;
    if (ctx.learnedVocab && ctx.learnedVocab.length) {
      vocabHtml = '<div class="lesson-summary" style="margin-top:20px"><div class="ls-head"><h3>本课 ' + ctx.learnedVocab.length + ' 个词</h3>' +
        '<button class="btn btn-sm btn-ghost" data-action="add-review" data-lesson-id="' + lid + '" data-target="vocab">全部加入复习</button></div>' +
        '<div class="vocab-chip-row">' + ctx.learnedVocab.slice(0, 10).map(function (v) {
          return '<span class="ls-chip"><b>' + esc(v.t) + "</b>" + esc(v.m) + "</span>";
        }).join("") +
        (ctx.learnedVocab.length > 10 ? '<span class="tiny muted-2">…共 ' + ctx.learnedVocab.length + " 词</span>" : "") +
        "</div></div>";
    }
    var sentHtml = "";
    if (ctx.learnedSentences && ctx.learnedSentences.length) {
      sentHtml = '<div class="lesson-summary" style="margin-top:14px"><div class="ls-head"><h3>本课 ' + ctx.learnedSentences.length + ' 句</h3>' +
        '<button class="btn btn-sm btn-ghost" data-action="add-review" data-lesson-id="' + lid + '" data-target="sentences">全部加入复习</button></div>' +
        '<div class="sent-list">' + ctx.learnedSentences.slice(0, 6).map(function (s) {
          return '<div class="sent-row"><span class="tiny muted-2">[' + esc(s.kind === "speaking" ? "口语" : "听力") + "]</span>" +
            '<b>' + esc(s.text) + '</b><span class="tiny muted-2">' + esc(s.tr) + "</span></div>";
        }).join("") + "</div></div>";
    }
    return '<div class="stage result-stage">' +
      '<div class="result-seal">' + icon("check") + "</div>" +
      "<h2>这一课完成了</h2>" +
      '<p class="muted">' + esc(info.lang.flag + " " + info.level.name + " · " + info.lesson.title) + (info.lesson.sub ? "（" + esc(info.lesson.sub) + "）" : "") + "</p>" +
      '<div class="result-stats">' +
      '<div class="result-stat"><b style="color:var(--jade)">' + r.accuracy + "%</b><span>总正确率</span></div>" +
      '<div class="result-stat"><b>+' + r.xp + '</b><span>获得经验</span></div>' +
      '<div class="result-stat"><b>' + ctx.perfectLabel + "</b><span>本轮表现</span></div>" +
      '<div class="result-stat"><b>' + S.stats().streak + "</b><span>连续天数</span></div>" +
      "</div>" +
      (r.bonus ? '<div class="chip chip-gold" style="margin-top:10px">全对奖励 +' + r.bonus + " XP</div>" : "") +
      (badgeHtml ? '<div style="margin-top:24px"><div class="tiny muted-2" style="margin-bottom:10px">解锁新成就</div><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' + badgeHtml + "</div></div>" : "") +
      vocabHtml + sentHtml +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:28px">' +
      (nextId ? '<button class="btn btn-primary btn-lg" data-link="#/learn/' + nextId + '">学习下一课</button>' : "") +
      '<button class="btn btn-lg" data-action="redo">再练一次</button>' +
      '<button class="btn btn-lg btn-ghost" data-link="#/courses/' + info.lang.code + '">返回课程目录</button>' +
      "</div></div>";
  }

  /* 模式小结 */
  function modeScoreCard(title, correct, total, extra) {
    var pct = total ? Math.round(correct / total * 100) : 0;
    return '<div class="panel" style="margin-top:16px"><div class="panel-head" style="margin-bottom:10px"><h2 style="font-size:15px">' + esc(title) + "</h2>" +
      '<span class="chip ' + (pct >= 80 ? "chip-jade" : pct >= 60 ? "chip-gold" : "chip-red") + '" style="margin-left:auto">' + pct + "%</span></div>" +
      bar(pct, pct >= 80 ? "jade" : pct >= 60 ? "gold" : "red") +
      '<div class="tiny muted" style="margin-top:8px">' + (extra || (correct + " / " + total + " 完成")) + "</div></div>";
  }

  /* ======================================================================
     星币商店 & 红心恢复（已下线，保留空壳兼容旧引用）
     ====================================================================== */
  function shopPage() { return ""; }
  function heartsOut(info) { return ""; }

  /* ======================================================================
     错题本与单词复习
     ====================================================================== */
  var MODE_NAME = { vocab: "单词", grammar: "语法", listening: "听力", speaking: "口语" };

  function reviewPage() {
    var list = S.mistakes();
    var st = S.stats();
    var vs = S.vocabSummary();

    var head = '<div class="grid grid-3">' +
      statCard("到期单词", vs.due + " 个", vs.due ? "按间隔复习，答对即延长下次间隔" : "今日已复习完") +
      statCard("待攻克错题", list.length + " 道", list.length ? "答对即移出错题本" : "太棒了") +
      statCard("已掌握单词", (st.wordsMastered || 0) + " 个", "熟练度达 3 级及以上") +
      "</div>";

    var wordPanel = '<div class="panel" style="margin-top:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      "<div><h2 style=\"font-size:17px\">单词间隔复习</h2><div class=\"tiny muted\">按 Leitner 间隔排期（1 / 3 / 7 / 16 天），到期的词会排在这里，答对延长间隔，答错回到最短间隔。</div></div>" +
      '<div style="margin-left:auto;display:flex;gap:10px;align-items:center">' +
      '<span class="chip chip-plain">已记录 ' + vs.total + " 个词</span>" +
      (vs.due ? '<button class="btn btn-primary" data-action="rv-words">开始单词复习（' + Math.min(vs.due, 20) + " 个）</button>" : "") +
      "</div></div>";

    var actions = '<div class="panel" style="margin-top:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      "<div><h2 style=\"font-size:17px\">错题重练</h2><div class=\"tiny muted\">逐题重做错题，答对一道就将其移出错题本，并计入「知错就改」成就。</div></div>" +
      '<div style="margin-left:auto;display:flex;gap:10px">' +
      (list.length ? '<button class="btn btn-primary" data-action="rv-start">开始重练（' + list.length + " 题）</button>" : "") +
      (list.length ? '<button class="btn btn-ghost" data-action="rv-clear">清空错题本</button>' : "") +
      "</div></div>";

    var cards = list.length ? list.map(function (m) {
      var lang = langOf(m.lang);
      return '<div class="panel rv-card">' +
        '<div class="rv-meta">' + (lang ? lang.flag + " " + esc(lang.name) : "") +
        '<span class="chip chip-plain">' + (MODE_NAME[m.mode] || m.mode) + "</span>" +
        '<span class="tiny muted-2">' + S._util.relTime(m.at) + "</span>" +
        (m.lessonId && D.lessonOf(m.lessonId) ? '<span class="tiny muted-2">出自「' + esc(D.lessonOf(m.lessonId).lesson.title) + "」</span>" : "") +
        "</div>" +
        '<div class="rv-prompt">' + esc(m.prompt) + "</div>" +
        '<div class="rv-answer">正确答案：<b>' + esc(m.opts && m.opts.length ? m.opts[m.answer] : m.answer) + "</b></div>" +
        (m.why ? '<div class="tiny muted" style="margin-top:6px">' + esc(m.why) + "</div>" : "") +
        '<div class="rv-actions">' +
        (m.text ? '<button class="btn btn-sm" data-speak="' + esc(m.text) + '" data-locale="' + (lang ? lang.locale : "") + '">' + icon("speaker") + "听原文</button>" : "") +
        '<button class="btn btn-sm btn-ghost" data-action="rv-remove" data-id="' + m.id + '" style="margin-left:auto">' + icon("trash") + "移除</button>" +
        "</div></div>";
    }).join("") : '<div class="panel"><div class="empty"><div class="em-ico">🎯</div><h3>错题本是空的</h3><p>学习过程中的语法、听力错题会自动收录到这里，方便针对性重练。</p><button class="btn btn-primary" data-link="#/courses" style="margin-top:14px">去上课</button></div></div>';

    return shell("#/review", "复习", "单词按间隔排期，错题反复重练", head + wordPanel + actions + '<div style="margin-top:18px;display:grid;gap:14px">' + cards + "</div>");
  }

  /* 重练答题界面（错题重练与单词复习共用） */
  function reviewStage(m, idx, total, fb) {
    var isWord = !!m.srs;
    var opts = (m.opts || []).map(function (o, i) {
      var cls = "";
      if (fb) { if (i === m.answer) cls = "correct"; else if (i === fb.opt) cls = "wrong"; }
      var attrs = fb ? " disabled" : ' data-action="rv-answer" data-opt="' + i + '"';
      return '<button class="opt ' + cls + '"' + attrs + '><span class="opt-key">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></button>";
    }).join("");
    var lang = langOf(m.lang);
    var okMsg = isWord ? "记住了，下次复习间隔已延长" : "答对了，已移出错题本";
    var noMsg = isWord ? "再巩固一下，稍后会再次遇到" : "还差一点，本题保留在错题本";
    return '<div class="lesson-shell"><div class="lesson-top">' +
      '<button class="lt-back" data-link="#/review" aria-label="返回复习">' + icon("left") + "</button>" +
      '<div class="lesson-progress"><div class="lp-labels"><span>' + (isWord ? "单词复习" : "错题重练") + "</span><span>" + (idx + 1) + " / " + total + "</span></div>" +
      '<div class="bar"><i class="bar-fill" style="width:' + Math.round(idx / total * 100) + '%"></i></div></div></div>' +
      '<div class="stage">' +
      '<div class="stage-head"><h2>' + (isWord ? "单词复习" : (MODE_NAME[m.mode] || "练习") + " · 错题重练") + '</h2><span class="sh-step">' + (lang ? lang.flag : "") + "</span></div>" +
      (m.mode === "listening" && m.text && !isWord ?
        '<div class="audio-deck"><button class="play-big" data-speak="' + esc(m.text) + '" data-locale="' + (lang ? lang.locale : "") + '">' + icon("play") + '</button>' +
        '<div class="ad-label">点击播放，听录音后回答</div></div>' : "") +
      '<div class="quiz-q">' + esc(m.prompt) +
      (isWord && m.speakText ? ' <button class="btn btn-sm" data-speak="' + esc(m.speakText) + '" data-locale="' + (lang ? lang.locale : "") + '">' + icon("speaker") + "</button>" : "") +
      "</div>" +
      (m.sub ? '<div class="quiz-sub">' + esc(m.sub) + "</div>" : "") +
      '<div class="opts">' + opts + "</div>" +
      (fb ? '<div class="explain ' + (fb.correct ? "ok" : "no") + '">' + icon(fb.correct ? "check" : "x") +
        "<div><b>" + (fb.correct ? okMsg : noMsg) + "</b>" + esc(m.why || "") + "</div></div>" +
        '<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="rv-next">' + (idx + 1 >= total ? "查看结果" : "下一题") + "</button></div>" : "") +
      "</div></div>";
  }

  function reviewResult(fixed, total, isWord) {
    var unit1 = isWord ? "记住" : "移出错题本";
    var unit2 = isWord ? "需巩固" : "仍待巩固";
    return '<div class="lesson-shell"><div class="stage result-stage">' +
      '<div class="result-seal">' + icon("check") + "</div>" +
      "<h2>" + (isWord ? "单词复习完成" : "重练完成") + "</h2>" +
      '<p class="muted">' + (isWord ? "本次记住 " + fixed + " / " + total + " 个单词" : "本次攻克 " + fixed + " / " + total + " 道错题") + "</p>" +
      '<div class="result-stats">' +
      '<div class="result-stat"><b style="color:var(--jade)">' + fixed + "</b><span>" + unit1 + "</span></div>" +
      '<div class="result-stat"><b>' + (total - fixed) + "</b><span>" + unit2 + "</span></div>" +
      "</div>" +
      '<div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-lg" data-link="#/review">返回复习</button>' +
      '<button class="btn btn-lg btn-ghost" data-link="#/dashboard">回学习中心</button>' +
      "</div></div></div>";
  }

  /* ======================================================================
     限时挑战
     ====================================================================== */
  function challengeSetup(setup) {
    var st = S.stats();
    var langs = [{ code: "all", flag: "🌍", name: "三语混合" }].concat(D.languages.map(function (l) { return { code: l.code, flag: l.flag, name: l.name }; }));
    return shell("#/challenge", "限时挑战", "在倒计时内连续作答，连击越高得分越高",
      '<div class="grid grid-2">' +
      '<div class="panel"><div class="panel-head"><h2>挑战设置</h2></div>' +
      '<div class="field"><label>题目范围</label><div class="lang-picker">' +
      langs.map(function (l) {
        return '<input type="radio" id="chl-' + l.code + '" name="ch-lang" value="' + l.code + '"' + (setup.lang === l.code ? " checked" : "") + ">" +
          '<label for="chl-' + l.code + '">' + l.flag + " " + esc(l.name) + "</label>";
      }).join("") + "</div></div>" +
      '<div class="field"><label>时长</label><div class="lang-picker">' +
      [60, 90].map(function (s) {
        return '<input type="radio" id="chs-' + s + '" name="ch-secs" value="' + s + '"' + (setup.secs === s ? " checked" : "") + ">" +
          '<label for="chs-' + s + '">' + s + " 秒</label>";
      }).join("") + "</div></div>" +
      '<button class="btn btn-primary btn-lg btn-block" data-action="ch-start" style="margin-top:10px">' + icon("bolt") + " 开始挑战</button>" +
      '<div class="tiny muted-2" style="margin-top:12px">题型：单词释义 · 语法选择 · 听力理解。答对 +' + "5 XP 起步，连击额外加成；听力题记得先点播放。</div>" +
      "</div>" +
      '<div class="panel"><div class="panel-head"><h2>我的纪录</h2></div>' +
      '<div class="grid grid-2">' +
      statCard("最高单局得分", (st.challengeBest || 0) + " XP", "") +
      statCard("最高连击", (st.bestCombo || 0) + " 连", "") +
      statCard("挑战次数", (st.challengePlays || 0) + " 局", "") +
      statCard("距离成就", (st.challengePlays >= 5 ? "已解锁" : "再玩 " + (5 - (st.challengePlays || 0)) + " 局"), "「限时挑战者」") +
      "</div>" +
      '<div class="tiny muted" style="margin-top:14px">完成 5 局解锁成就「限时挑战者」，单局 10 连击解锁「连击高手」。</div>' +
      "</div></div>");
  }

  function challengeStage(ch) {
    var q = ch.q;
    var fb = ch.answering;
    var kindName = { vocab: "单词", grammar: "语法", listening: "听力" }[q.kind];
    var opts = q.opts.map(function (o, i) {
      var cls = "";
      if (fb) { if (i === q.a) cls = "correct"; else if (i === fb.opt) cls = "wrong"; }
      var attrs = fb ? " disabled" : ' data-action="ch-answer" data-opt="' + i + '"';
      return '<button class="opt ' + cls + '"' + attrs + '><span class="opt-key">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></button>";
    }).join("");
    return '<div class="lesson-shell"><div class="ch-top">' +
      '<div class="ch-timer"><div class="bar ch-bar"><i class="bar-fill" id="ch-timer-fill" style="width:100%"></i></div><span class="ch-time" id="ch-time">' + Math.ceil(ch.left / 1000) + "s</span></div>" +
      '<div class="ch-stats"><span class="ch-score" id="ch-score">' + ch.gain + " XP</span>" +
      '<span class="ch-combo" id="ch-combo">' + (ch.combo >= 2 ? "🔥 " + ch.combo + " 连击" : "") + "</span></div></div>" +
      '<div class="stage">' +
      '<div class="stage-head"><h2>' + kindName + "题</h2><span class=\"sh-step\">第 " + (ch.n + 1) + " 题</span></div>" +
      (q.speakText ? '<div style="margin-bottom:14px"><button class="btn btn-sm" data-action="ch-play">' + icon("speaker") + (q.kind === "listening" ? "播放听力" : "听发音") + "</button></div>" : "") +
      '<div class="quiz-q ' + (q.kind === "vocab" ? "ch-vocab-q" : "") + '">' + esc(q.prompt) + "</div>" +
      '<div class="quiz-sub">' + esc(q.sub || "") + "</div>" +
      '<div class="opts">' + opts + "</div>" +
      (fb ? '<div class="explain ' + (fb.correct ? "ok" : "no") + '" style="margin-top:14px">' + icon(fb.correct ? "check" : "x") +
        "<div><b>" + (fb.correct ? "+" + fb.gain + " XP" : "正确答案是 " + "ABCD"[q.a]) + "</b>" + esc(q.why || "") + "</div></div>" : "") +
      "</div></div>";
  }

  function challengeResult(res) {
    return '<div class="lesson-shell"><div class="stage result-stage">' +
      '<div class="result-seal" style="background:var(--gold)">' + icon("bolt") + "</div>" +
      "<h2>时间到</h2>" +
      (res.isRecord ? '<div class="chip chip-gold" style="margin-top:8px">🎉 新纪录！</div>' : "") +
      '<div class="result-stats">' +
      '<div class="result-stat"><b style="color:var(--gold)">+' + res.gain + "</b><span>本局 XP</span></div>" +
      '<div class="result-stat"><b>' + res.correct + "/" + res.n + "</b><span>答对题数</span></div>" +
      '<div class="result-stat"><b style="color:var(--vermilion)">' + res.bestCombo + "</b><span>最高连击</span></div>" +
      '<div class="result-stat"><b>' + res.best + "</b><span>历史最佳</span></div>" +
      "</div>" +
      '<div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-lg" data-action="ch-again">' + icon("bolt") + " 再来一局</button>" +
      '<button class="btn btn-lg btn-ghost" data-link="#/dashboard">回学习中心</button>' +
      "</div></div></div>";
  }

  /* ======================================================================
     词汇库
     ====================================================================== */
  function glossaryRows(lang, q) {
    var st = S.stats();
    var all = D.glossary(lang || null);
    if (q) {
      var needle = q.trim().toLowerCase();
      all = all.filter(function (v) {
        return (v.t + " " + (v.r || "") + " " + v.m).toLowerCase().indexOf(needle) >= 0;
      });
    }
    if (!all.length) return '<div class="empty"><div class="em-ico">🔍</div><h3>没有匹配的词条</h3><p>换个关键词试试。</p></div>';
    return all.map(function (v) {
      var rec = st.vocabBox[v.key];
      var state = rec && rec.box >= 3 ? '<span class="chip chip-jade">已掌握</span>'
        : rec && rec.seen > 0 ? '<span class="chip chip-gold">学习中</span>'
        : '<span class="chip chip-plain">未学</span>';
      var langMeta = lang ? "" : '<span class="chip chip-plain">' + langOf(v.lang).flag + "</span>";
      return '<div class="gl-row">' +
        '<button class="speak-btn gl-speak" data-speak="' + esc(v.t) + '" data-locale="' + langOf(v.lang).locale + '" aria-label="朗读">' + icon("speaker") + "</button>" +
        '<div class="gl-main"><div class="gl-word">' + esc(v.t) + (v.r ? ' <span class="gl-read">' + esc(v.r) + "</span>" : "") + "</div>" +
        '<div class="gl-mean">' + esc(v.m) + "</div>" +
        (v.ex ? '<div class="gl-ex">' + esc(v.ex) + "</div>" : "") + "</div>" +
        '<div class="gl-side">' + state + langMeta +
        '<a class="tiny muted-2 gl-lesson" href="#/learn/' + v.lessonId + '">' + v.level + " · " + esc(v.lessonTitle) + "</a></div>" +
        "</div>";
    }).join("");
  }

  function glossary(lang, q) {
    var st = S.stats();
    var tabs = '<div class="lang-tabs">' +
      '<button class="lang-tab ' + (!lang ? "active" : "") + '" data-link="#/glossary">全部</button>' +
      D.languages.map(function (l) {
        var cnt = D.glossary(l.code).length;
        return '<button class="lang-tab ' + (lang === l.code ? "active" : "") + '" data-link="#/glossary/' + l.code + '"><span class="lt-flag">' + l.flag + "</span>" + esc(l.name) + '<span class="tiny" style="opacity:.7">' + cnt + "</span></button>";
      }).join("") + "</div>";

    var head = '<div class="panel" style="margin-bottom:18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:240px"><input id="gl-q" class="gl-search" placeholder="搜索词条 / 读音 / 释义…" value="' + esc(q || "") + '"></div>' +
      '<span class="tiny muted">已掌握 ' + st.wordsMastered + " 词 · 接触过 " + st.wordsSeen + " 词</span>" +
      "</div>";

    return shell("#/glossary", "词汇库", "全部课程词条一览，随时检索与跟读",
      tabs + head + '<div class="panel" style="padding:6px 18px" id="gl-body">' + glossaryRows(lang, q) + "</div>");
  }

  window.Views = {
    icon: icon, esc: esc, avatar: avatar, bar: bar, ring: ring, nextUp: nextUp, recommend: recommend,
    landing: landing, auth: auth, shell: shell,
    dashboard: dashboard, courses: courses, pathPage: pathPage, progressPage: progressPage,
    community: community, achievements: achievements, profile: profile,
    reviewPage: reviewPage, reviewStage: reviewStage, reviewResult: reviewResult,
    challengeSetup: challengeSetup, challengeStage: challengeStage, challengeResult: challengeResult,
    glossary: glossary, glossaryRows: glossaryRows,
    lessonShell: lessonShell, modeToggle: modeToggle, stageVocab: stageVocab, stageVocabRevealed: stageVocabRevealed, stageVocabQuiz: stageVocabQuiz,
    stageGrammar: stageGrammar, stageListening: stageListening, stageSpeaking: stageSpeaking, stageModeDone: stageModeDone,
    speakResult: speakResult, speakPractice: speakPractice, stageResult: stageResult, modeScoreCard: modeScoreCard,
    lastNDays: lastNDays, langChip: langChip
  };
})();