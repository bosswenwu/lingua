/* ==========================================================================
   Lingua · 单元测试
   覆盖强化训练相关模块：
   - store.js  错题本 / 限时挑战成绩 / 数据迁移 / 新成就徽章
   - data.js   挑战题库 challengePool / 词汇库 glossary / shuffle
   - speech.js 听写评分 score / 逐词标记 mark
   - views.js  四个新页面与听写 UI 的渲染输出
   运行：node tests/run.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* ---------------- 浏览器环境 mock ---------------- */
function makeLocalStorage() {
  let m = {};
  return {
    getItem: k => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; },
    clear: () => { m = {}; },
    get length() { return Object.keys(m).length; }
  };
}

const sandbox = {
  console,
  setTimeout, clearTimeout,
  location: { hash: "", reload() {} },
  navigator: { language: "zh-CN" }
};
sandbox.window = sandbox;
sandbox.localStorage = makeLocalStorage();
vm.createContext(sandbox);

["data-en.js", "data-ja.js", "data-ko.js", "data-en-ext.js", "data-ja-ext.js", "data-ko-ext.js", "exercise.js", "data.js", "speech.js", "store.js", "views.js"]
  .forEach(f => {
    const file = path.join(__dirname, "..", "js", f);
    vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: f });
  });

const Store = sandbox.window.Store;
const DATA = sandbox.window.DATA;
const Speech = sandbox.window.Speech;
const Views = sandbox.window.Views;
const Exercise = sandbox.window.Exercise;

/* ---------------- 极简测试框架 ---------------- */
let pass = 0, fail = 0;
const failures = [];
function t(name, fn) {
  try { fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; failures.push(name + " :: " + e.message); console.log("  ✗ " + name + " — " + e.message); }
}
function ok(v, msg) { if (!v) throw new Error(msg || "期望为真，实际为 " + v); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || "相等断言") + " — 期望 " + JSON.stringify(b) + "，实际 " + JSON.stringify(a)); }
function isArr(x) { return Object.prototype.toString.call(x) === "[object Array]"; }
function has(html, s, msg) { if (String(html).indexOf(s) < 0) throw new Error((msg || "HTML 缺少片段") + "：" + s); }
function notHas(html, s, msg) { if (String(html).indexOf(s) >= 0) throw new Error((msg || "HTML 不应包含") + "：" + s); }
function count(html, re) { return (String(html).match(re) || []).length; }

let seq = 0;
function freshUser() {
  const name = "测试员" + Date.now() + "_" + (seq++);
  const r = Store.register({ name, targetLangs: ["en"], level: "A1", dailyGoal: 30 });
  if (r.error) throw new Error("创建档案失败：" + r.error);
  return { user: r.user, name };
}

/* ==========================================================================
   0. 模块加载
   ========================================================================== */
console.log("\n■ 模块加载");
t("Store / DATA / Speech / Views 均已导出", () => {
  ["recordMistake", "resolveMistake", "saveChallengeResult", "mistakes", "clearMistakes"].forEach(k => ok(typeof Store[k] === "function", "Store." + k));
  ["challengePool", "glossary", "shuffle"].forEach(k => ok(typeof DATA[k] === "function", "DATA." + k));
  ["score", "mark"].forEach(k => ok(typeof Speech[k] === "function", "Speech." + k));
  ["reviewPage", "reviewStage", "reviewResult", "challengeSetup", "challengeStage", "challengeResult", "glossary", "glossaryRows", "stageListening"].forEach(k => ok(typeof Views[k] === "function", "Views." + k));
});
t("课程规模：3 门语言 / 至少 72 课", () => {
  const s = DATA.stats();
  eq(s.languages, 3); ok(s.lessons >= 72, "课程数 " + s.lessons); ok(s.exercises > 1000, "练习题总量 " + s.exercises);
});
t("每门语言 ≥ 2000 词 / ≥ 120 课，四级齐全", () => {
  DATA.languages.forEach(l => {
    const ids = DATA.lessonsOfLang(l.code);
    ok(ids.length >= 120, l.code + " 课程数 " + ids.length);
    const words = DATA.glossary(l.code).length;
    ok(words >= 2000, l.code + " 词数 " + words);
    const badges = l.levels.map(x => x.badge).sort().join(",");
    eq(badges, "A1,A2,B1,B2", l.code + " 级别");
  });
});

/* ==========================================================================
   0b. 题目自动生成器（exercise）
   ========================================================================== */
console.log("\n■ 题目自动生成器");
t("Exercise 依词条生成三类题目，结构合法", () => {
  const lid = DATA.lessonsOfLang("en")[0];
  const info = DATA.lessonOf(lid);
  const gen = Exercise.generate(info.lesson, info.lang);
  ok(gen.grammar.length > 0, "语法题");
  ok(gen.listening.length > 0, "听力题");
  ok(gen.speaking.length > 0, "口语题");
  gen.grammar.forEach(d => {
    if (d.type === "spell") { ok(d.answer && d.hint, "拼写题字段"); return; }
    ok(isArr(d.opts) && d.opts.length >= 3, "选项数");
    ok(Number.isInteger(d.a) && d.a >= 0 && d.a < d.opts.length, "答案下标");
    eq(new Set(d.opts).size, d.opts.length, "选项重复：" + d.q);
    ok(d.why, "缺少解析");
  });
  gen.listening.forEach(d => {
    ok(d.text && d.q, "听力题文本");
    ok(isArr(d.opts) && Number.isInteger(d.a) && d.a < d.opts.length, "听力选项");
  });
  gen.speaking.forEach(d => ok(d.text, "跟读文本"));
});
t("挖空题的句中确实含目标词被挖空", () => {
  /* 取扩展课的末尾若干课（带结构化例句），确认真能挖出空 */
  let checked = 0;
  DATA.lessonsOfLang("en").slice(-30).forEach(lid => {
    const info = DATA.lessonOf(lid);
    const gen = Exercise.generate(info.lesson, info.lang);
    gen.grammar.filter(d => d.point === "例句填词").forEach(d => {
      checked++;
      ok(d.q.indexOf("____") >= 0, "未挖空：" + d.q);
      ok(d.opts[d.a] && d.why.toLowerCase().indexOf(d.opts[d.a].toLowerCase()) >= 0, "答案不在原句：" + d.why);
    });
  });
  ok(checked > 0, "扩展课应能生成挖空题");
});
t("生成题目可直接渲染为各关卡 HTML", () => {
  let spells = 0;
  DATA.lessonsOfLang("en").slice(-30).forEach(lid => {
    const info = DATA.lessonOf(lid);
    const gen = Exercise.generate(info.lesson, info.lang);
    gen.grammar.forEach((d, i) => {
      const html = Views.stageGrammar({ lessonId: lid, idx: i, total: gen.grammar.length, item: d }, null);
      has(html, "stage-head");
      if (d.type === "spell") { spells++; has(html, 'id="spell-input"'); has(html, 'data-action="spell-submit"'); }
      else has(html, 'data-action="answer"');
    });
    gen.listening.forEach((d, i) => {
      const html = Views.stageListening({ lessonId: lid, idx: i, total: gen.listening.length, item: d }, false, null, { active: false, result: null, draft: "" });
      has(html, 'data-action="play"');
      has(html, 'data-action="answer"');
    });
    gen.speaking.forEach((d, i) => {
      const html = Views.stageSpeaking({ lessonId: lid, idx: i, total: gen.speaking.length, item: d }, "");
      has(html, "speak-target");
      has(html, 'data-action="speak-skip"');
    });
  });
  ok(spells > 0, "英语课应生成拼写题");
});

/* ==========================================================================
   1. 错题本（store）
   ========================================================================== */
console.log("\n■ 错题本 · 数据层");
const uA = freshUser();
t("recordMistake 收录一条错题，字段完整", () => {
  const p = Store.progress();
  const item = Store.recordMistake(p, { lang: "en", mode: "grammar", lessonId: "en-l1", prompt: "She ___ to school.", opts: ["go", "goes", "going"], answer: 1, why: "三单" });
  Store.saveProgress(p);
  ok(item.id.indexOf("m_") === 0, "错题 id 前缀");
  const list = Store.mistakes();
  eq(list.length, 1);
  eq(list[0].prompt, "She ___ to school.");
  eq(list[0].answer, 1);
  eq(list[0].opts.length, 3);
});
t("同一题（lang|mode|prompt 相同）去重，不重复收录", () => {
  const p = Store.progress();
  const again = Store.recordMistake(p, { lang: "en", mode: "grammar", prompt: "She ___ to school.", opts: [], answer: 1 });
  Store.saveProgress(p);
  eq(Store.mistakes().length, 1);
  ok(again.id === Store.mistakes()[0].id, "去重后保持原 id");
});
t("同题不同 mode 视为不同错题", () => {
  const p = Store.progress();
  Store.recordMistake(p, { lang: "en", mode: "listening", prompt: "She ___ to school.", opts: [], answer: 1 });
  Store.saveProgress(p);
  eq(Store.mistakes().length, 2);
});
t("错题上限 120 条，最新在前", () => {
  const p = Store.progress();
  for (let i = 0; i < 130; i++) Store.recordMistake(p, { lang: "en", mode: "grammar", prompt: "Q" + i, opts: ["a", "b"], answer: 0 });
  Store.saveProgress(p);
  const list = Store.mistakes();
  eq(list.length, 120);
  eq(list[0].prompt, "Q129");
});
t("mistakes() 返回副本，外部修改不影响存储", () => {
  const arr = Store.mistakes();
  arr.push({ fake: 1 });
  eq(Store.mistakes().length, 120);
});
t("resolveMistake 答对移出并累计 mistakesFixed，返回 {badges,quests}", () => {
  const before = Store.progress().mistakesFixed || 0;
  const target = Store.mistakes()[0];
  const out = Store.resolveMistake(target.id);
  ok(isArr(out.badges), "badges 数组");
  ok(isArr(out.quests), "quests 数组");
  eq(Store.mistakes().length, 119);
  eq(Store.progress().mistakesFixed, before + 1);
});
t("resolveMistake 传入不存在的 id 不产生副作用", () => {
  const before = Store.progress().mistakesFixed;
  Store.resolveMistake("m_not_exist");
  eq(Store.mistakes().length, 119);
  eq(Store.progress().mistakesFixed, before);
});
t("removeMistake 只移除、不计入攻克数", () => {
  const fixed = Store.progress().mistakesFixed;
  Store.removeMistake(Store.mistakes()[0].id);
  eq(Store.mistakes().length, 118);
  eq(Store.progress().mistakesFixed, fixed);
});
t("clearMistakes 清空错题本", () => {
  Store.clearMistakes();
  eq(Store.mistakes().length, 0);
});
t("老数据迁移：缺失 mistakes/challenge 字段自动补齐", () => {
  const uB = freshUser();
  const key = "lingua.v1.progress." + uB.user.id;
  const old = JSON.parse(sandbox.localStorage.getItem(key));
  delete old.mistakes; delete old.mistakesFixed; delete old.challenge;
  sandbox.localStorage.setItem(key, JSON.stringify(old));
  Store.logout();
  const r = Store.pickProfile(uB.user.id);
  ok(!r.error, "重新选择本机档案");
  const p = Store.progress();
  ok(isArr(p.mistakes), "mistakes 补齐为数组");
  eq(p.mistakesFixed, 0);
  eq(p.challenge.plays, 0);
});

/* ==========================================================================
   2. 限时挑战成绩（store）
   ========================================================================== */
console.log("\n■ 限时挑战 · 数据层");
const uC = freshUser();
t("首局成绩：isRecord=true，XP 入账", () => {
  const p0 = Store.progress();
  p0.quests = { date: Store._util.todayKey(), list: [{ id: "lesson1", done: false }] };
  p0.questProg = { date: Store._util.todayKey(), correct: 0, lessons: 0, challenges: 0, reviewed: 0, words: 0 };
  Store.saveProgress(p0);
  const xp0 = Store.progress().xp;
  const r = Store.saveChallengeResult(50, 3);
  eq(r.plays, 1); eq(r.best, 50); eq(r.isRecord, true);
  eq(Store.progress().xp, xp0 + 50);
  const st = Store.stats();
  eq(st.challengePlays, 1); eq(st.challengeBest, 50); eq(st.bestCombo, 3);
});
t("低分不刷新最佳，但刷新最高连击", () => {
  const r = Store.saveChallengeResult(30, 5);
  eq(r.isRecord, false); eq(r.best, 50);
  eq(Store.stats().bestCombo, 5);
});
t("更高分刷新纪录", () => {
  const r = Store.saveChallengeResult(80, 1);
  eq(r.isRecord, true); eq(r.best, 80);
  eq(Store.stats().challengePlays, 3);
});

/* ==========================================================================
   3. 新成就徽章
   ========================================================================== */
console.log("\n■ 成就徽章");
t("徽章总数 15，含三枚新徽章", () => {
  eq(Store.BADGES.length, 15);
  ["reviewer", "challenger", "combo10"].forEach(id => ok(Store.BADGES.some(b => b.id === id), "缺少徽章 " + id));
});
t("完成 5 局挑战解锁「限时挑战者」", () => {
  let earned = [];
  earned = earned.concat(Store.saveChallengeResult(10, 2).badges); // 第 4 局
  earned = earned.concat(Store.saveChallengeResult(10, 2).badges); // 第 5 局
  ok(earned.some(b => b.id === "challenger"), "应解锁 challenger");
  eq(Store.stats().challengePlays, 5);
});
t("单局 10 连击解锁「连击高手」", () => {
  const earned = Store.saveChallengeResult(10, 10).badges;
  ok(earned.some(b => b.id === "combo10"), "应解锁 combo10");
});
t("攻克 10 道错题解锁「知错就改」", () => {
  const p = Store.progress();
  p.mistakesFixed = 10;
  Store.saveProgress(p);
  const earned = Store.evaluateBadges();
  ok(earned.some(b => b.id === "reviewer"), "应解锁 reviewer");
  const state = Store.badgeState().filter(b => b.id === "reviewer")[0];
  eq(state.earned, true);
});

/* ==========================================================================
   4. 挑战题库（data.challengePool）
   ========================================================================== */
console.log("\n■ 限时挑战 · 题库");
const pool = DATA.challengePool();
t("题库非空且题型合法", () => {
  ok(pool.length > 500, "题库规模 " + pool.length);
  pool.forEach(q => ok(["vocab", "grammar", "listening"].indexOf(q.kind) >= 0, "非法题型 " + q.kind));
});
t("每题选项与答案下标有效", () => {
  pool.forEach(q => {
    ok(isArr(q.opts) && q.opts.length >= 2, "选项不足：" + q.prompt);
    ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length, "答案越界：" + q.prompt);
    ok(typeof q.opts[q.a] === "string" && q.opts[q.a].length > 0, "答案为空");
  });
});
t("词汇题为 3 个互不相同的选项", () => {
  const vocab = pool.filter(q => q.kind === "vocab");
  ok(vocab.length > 0);
  vocab.forEach(q => {
    eq(q.opts.length, 3, "词汇题选项数");
    eq(new Set(q.opts).size, 3, "干扰项重复：" + q.prompt);
  });
});
t("听力题携带 speakText 供播放", () => {
  pool.filter(q => q.kind === "listening").forEach(q => ok(q.speakText && q.speakText.length > 0, "缺少 speakText"));
});
t("按语言过滤题库", () => {
  ["en", "ja", "ko"].forEach(code => {
    const sub = DATA.challengePool([code]);
    ok(sub.length > 0, code + " 题库为空");
    ok(sub.every(q => q.lang === code), code + " 混入其他语言");
  });
  eq(DATA.challengePool(["en"]).length + DATA.challengePool(["ja"]).length + DATA.challengePool(["ko"]).length, pool.length);
});
t("shuffle 不修改原数组且元素守恒", () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const out = DATA.shuffle(src);
  eq(src.join(","), "1,2,3,4,5,6,7,8,9,10");
  eq(out.slice().sort((a, b) => a - b).join(","), "1,2,3,4,5,6,7,8,9,10");
});

/* ==========================================================================
   5. 词汇库（data.glossary）
   ========================================================================== */
console.log("\n■ 词汇库 · 数据层");
const glos = DATA.glossary();
t("全量词条不少于 613", () => ok(glos.length >= 613, "词条数 " + glos.length));
t("每条词条字段完整，key 与课程可追溯", () => {
  glos.forEach(v => {
    ok(v.t && v.m, "词条缺目标词或释义");
    ok(v.key.indexOf(v.lessonId + "#") === 0, "key 格式错误 " + v.key);
    ok(DATA.lessonOf(v.lessonId), "lessonId 无法索引 " + v.lessonId);
    ok(v.level && v.lessonTitle, "缺级别或课程名");
  });
});
t("key 全局唯一", () => eq(new Set(glos.map(v => v.key)).size, glos.length));
t("按语言过滤且三门合计等于全量", () => {
  const en = DATA.glossary("en"), ja = DATA.glossary("ja"), ko = DATA.glossary("ko");
  ok(en.every(v => v.lang === "en") && ja.every(v => v.lang === "ja") && ko.every(v => v.lang === "ko"));
  eq(en.length + ja.length + ko.length, glos.length);
});

/* ==========================================================================
   6. 听写评分（speech.score / mark）
   ========================================================================== */
console.log("\n■ 听写模式 · 评分算法");
t("完全一致的句子得 100 分", () => eq(Speech.score("I go to school every day", "I go to school every day", "en"), 100));
t("忽略大小写与标点", () => eq(Speech.score("Hello, World!", "hello world", "en"), 100));
t("空输入得 0 分", () => {
  eq(Speech.score("I go to school", "", "en"), 0);
  eq(Speech.score("", "anything", "en"), 0);
});
t("部分正确得分介于 0-100", () => {
  const s = Speech.score("I go to school", "I go home", "en");
  ok(s > 0 && s < 100, "得分 " + s);
});
t("日语按字符比对", () => {
  eq(Speech.score("こんにちは", "こんにちは", "ja"), 100);
  const s = Speech.score("こんにちは", "こんにち", "ja");
  ok(s > 50 && s < 100, "日语部分听写得分 " + s);
});
t("mark 逐词标记命中与漏词", () => {
  const marks = Speech.mark("go to school", "go home school", "en");
  eq(marks.length, 3);
  eq(marks.map(m => m.hit).join(","), "true,false,true");
});
t("mark 一一对应：目标词重复时不多记", () => {
  const marks = Speech.mark("go go go", "go", "en");
  eq(marks.filter(m => m.hit).length, 1);
});
t("日语：片假名与平假名统一后视为一致", () => {
  eq(Speech.score("カタカナ", "かたかな", "ja"), 100);
  eq(Speech.score("コンピュータ", "こんぴゅーた", "ja"), 100);
});
t("提供读音时按读音比对（缓解汉字/假名不一致）", () => {
  eq(Speech.score("私は学生です", "わたしはがくせいです", "ja", "わたしはがくせいです"), 100);
  eq(Speech.mark("私は学生です", "わたしはがくせい", "ja", "わたしはがくせいです").filter(m => m.hit).length >= 4, true);
});

/* ==========================================================================
   7. 错题本视图（views）
   ========================================================================== */
console.log("\n■ 错题本 · 视图");
const uD = freshUser();
t("空错题本显示空状态与引导", () => {
  const html = Views.reviewPage();
  has(html, "错题本是空的");
  notHas(html, 'data-action="rv-start"');
});
t("错题卡渲染并转义 XSS", () => {
  const p = Store.progress();
  Store.recordMistake(p, { lang: "en", mode: "grammar", lessonId: "en-l1", prompt: "<img src=x onerror=alert(1)> ___", opts: ["a", "b"], answer: 0, why: "why" });
  Store.saveProgress(p);
  const html = Views.reviewPage();
  has(html, "rv-card");
  has(html, "&lt;img src=x onerror=alert(1)&gt;");
  notHas(html, "<img src=x onerror=alert(1)>", "存在未转义 HTML 注入");
  has(html, 'data-action="rv-start"');
  has(html, 'data-action="rv-clear"');
  has(html, 'data-action="rv-remove"');
});
t("reviewStage 未作答：渲染选项按钮、无下一题", () => {
  const m = Store.mistakes()[0];
  const html = Views.reviewStage(m, 0, 1, null);
  eq(count(html, /data-action="rv-answer"/g), m.opts.length);
  notHas(html, 'data-action="rv-next"');
});
t("reviewStage 已作答：高亮对错并出现下一题", () => {
  const m = Store.mistakes()[0];
  const html = Views.reviewStage(m, 0, 1, { opt: (m.answer + 1) % m.opts.length, correct: false });
  has(html, "opt wrong");
  has(html, "opt correct");
  has(html, 'data-action="rv-next"');
  has(html, "查看结果");
});
t("reviewResult 展示攻克统计", () => {
  const html = Views.reviewResult(2, 3);
  has(html, "重练完成");
  has(html, "2 / 3");
});

/* ==========================================================================
   7b. 单词间隔复习（SRS）
   ========================================================================== */
console.log("\n■ 单词间隔复习 · SRS");
const uS = freshUser();
t("新档案没有到期单词，summary 全为 0", () => {
  const vs = Store.vocabSummary();
  eq(vs.total, 0); eq(vs.due, 0); eq(vs.mastered, 0);
  eq(Store.vocabDue().length, 0);
});
t("学过单词后进入复习队列，首次答错即刻到期", () => {
  const p = Store.progress();
  Store.updateVocabBox(p, "en-l1", 0, false);
  Store.saveProgress(p);
  const vs = Store.vocabSummary();
  eq(vs.total, 1);
  eq(vs.due, 1);
  const due = Store.vocabDue();
  eq(due.length, 1);
  eq(due[0].key, "en-l1#0");
  eq(due[0].lessonId, "en-l1");
  ok(due[0].vocab && due[0].vocab.t, "附带词条");
});
t("答对后进入 box1，当天不再到期", () => {
  Store.reviewVocab("en-l1#0", true);
  eq(Store.progress().vocabBox["en-l1#0"].box, 1);
  eq(Store.vocabSummary().due, 0);
  eq(Store.vocabDue().length, 0);
});
t("熟练度 ≥ 3 计入已掌握", () => {
  const p = Store.progress();
  p.vocabBox["en-l1#0"].box = 3;
  Store.saveProgress(p);
  eq(Store.vocabSummary().mastered, 1);
});
t("到期单词按陌生优先排序", () => {
  const p = Store.progress();
  p.vocabBox["en-l1#1"] = { box: 0, seen: 1, correct: 0, next: 0 };   // 陌生
  p.vocabBox["en-l1#2"] = { box: 2, seen: 3, correct: 2, next: Date.now() - 1000 }; // 较熟
  Store.saveProgress(p);
  const due = Store.vocabDue();
  eq(due[0].box, 0);
});
t("reviewPage 展示单词复习与错题两个入口", () => {
  const html = Views.reviewPage();
  has(html, "单词间隔复习");
  has(html, "错题重练");
  has(html, 'data-action="rv-words"');
});
t("reviewStage 单词题使用复习文案", () => {
  const html = Views.reviewStage({ srs: true, mode: "vocab", lang: "en", prompt: "book", opts: ["书", "水", "猫"], answer: 0, sub: "chu shu · 选出正确释义" }, 0, 1, null);
  has(html, "单词复习");
  notHas(html, "错题重练");
});
t("reviewResult 单词复习文案", () => {
  const html = Views.reviewResult(3, 5, true);
  has(html, "单词复习完成");
  has(html, "3 / 5");
});

/* ==========================================================================
   8. 限时挑战视图（views）
   ========================================================================== */
console.log("\n■ 限时挑战 · 视图");
t("challengeSetup 渲染语言/时长选项与开始按钮", () => {
  const html = Views.challengeSetup({ lang: "en", secs: 90 });
  has(html, 'data-action="ch-start"');
  eq(count(html, /name="ch-lang"/g), 4, "全部 + 3 门语言");
  eq(count(html, /name="ch-secs"/g), 2, "60 / 90 秒");
  has(html, 'id="chl-en" name="ch-lang" value="en" checked');
  has(html, 'id="chs-90" name="ch-secs" value="90" checked');
});
t("challengeStage 渲染倒计时、XP、连击与选项", () => {
  const q = pool.filter(x => x.kind === "vocab")[0];
  const html = Views.challengeStage({ q, left: 45000, gain: 20, combo: 3, n: 4, answering: null });
  has(html, ">45s<");
  has(html, "20 XP");
  has(html, "3 连击");
  has(html, "ch-vocab-q");
  eq(count(html, /data-action="ch-answer"/g), q.opts.length);
});
t("challengeStage 作答后锁定选项并给出解析", () => {
  const q = pool.filter(x => x.kind === "grammar")[0];
  const wrong = (q.a + 1) % q.opts.length;
  const html = Views.challengeStage({ q, left: 30000, gain: 20, combo: 1, n: 0, answering: { opt: wrong, correct: false, gain: 0 } });
  has(html, "opt wrong");
  has(html, "正确答案是");
  eq(count(html, /data-action="ch-answer"/g), 0, "作答后选项应禁用");
});
t("challengeResult 新纪录标记与统计", () => {
  const rec = Views.challengeResult({ gain: 85, correct: 7, n: 10, bestCombo: 5, best: 120, isRecord: true });
  has(rec, "新纪录");
  has(rec, "+85");
  has(rec, "7/10");
  has(rec, 'data-action="ch-again"');
  const noRec = Views.challengeResult({ gain: 10, correct: 2, n: 5, bestCombo: 2, best: 120, isRecord: false });
  notHas(noRec, "新纪录");
});

/* ==========================================================================
   9. 词汇库与听写 UI（views）
   ========================================================================== */
console.log("\n■ 词汇库 / 听写 · 视图");
t("glossary 全量渲染（上限 400 条 + 提示）", () => {
  const html = Views.glossary("", "");
  const n = count(html, /class="gl-row"/g);
  ok(n > 0 && n <= 400, "渲染行数 " + n);
  has(html, 'id="gl-q"');
  has(html, "gl-more", "超出上限应有提示");
  ok(count(html, /class="lang-tab /g) >= 4, "语言筛选页签");
});
t("glossaryRows 搜索过滤与空结果提示", () => {
  const word = DATA.glossary("en")[0].t;
  const rows = Views.glossaryRows("en", word);
  const n = count(rows, /class="gl-row"/g);
  ok(n > 0 && n <= 400, "过滤后行数 " + n);
  has(rows, word.replace(/&/g, "&amp;").replace(/</g, "&lt;"), "结果包含搜索词");
  has(Views.glossaryRows("en", "zzz不存在zzz"), "没有匹配的词条");
});
t("glossaryRows 掌握状态：未学 / 学习中 / 已掌握", () => {
  const seen = Views.glossaryRows("en", "");
  has(seen, "未学");
  const p = Store.progress();
  const k = DATA.glossary("en")[0].key;
  const parts = k.split("#");
  Store.updateVocabBox(p, parts[0], Number(parts[1]), true);
  Store.updateVocabBox(p, parts[0], Number(parts[1]), true);
  Store.updateVocabBox(p, parts[0], Number(parts[1]), true); // box=3 → 已掌握
  Store.saveProgress(p);
  has(Views.glossaryRows("en", ""), "已掌握");
});
t("stageListening 听写关闭时显示入口按钮", () => {
  const ctx = { lessonId: "en-l1", idx: 0, total: 3, item: { text: "I go to school.", tr: "我每天上学。", q: "What did you hear?", opts: ["a", "b"], a: 0 } };
  const html = Views.stageListening(ctx, false, null, { active: false, result: null, draft: "" });
  has(html, 'data-action="dictate"');
  notHas(html, 'id="dictate-input"');
});
t("stageListening 听写开启：输入框与提交按钮", () => {
  const ctx = { lessonId: "en-l1", idx: 0, total: 3, item: { text: "I go to school.", tr: "我每天上学。", q: "q", opts: ["a", "b"], a: 0 } };
  const html = Views.stageListening(ctx, false, null, { active: true, result: null, draft: "I go" });
  has(html, 'id="dictate-input"');
  has(html, ">I go</textarea>", "草稿回填");
  has(html, 'data-action="dictate-submit"');
});
t("stageListening 听写结果：分数与逐词标记", () => {
  const ctx = { lessonId: "en-l1", idx: 0, total: 3, item: { text: "I go to school.", tr: "tr", q: "q", opts: ["a", "b"], a: 0 } };
  const marks = Speech.mark("I go to school.", "I go home", "en");
  const html = Views.stageListening(ctx, false, null, { active: true, result: { score: 96, marks }, draft: "x" });
  has(html, "score-big");
  has(html, ">96<");
  ok(count(html, /chip-jade|chip-red/g) >= marks.length, "逐词 chip 数量");
  has(html, "原文：");
});
t("dashboard 含继续学习、到期复习和今日任务", () => {
  const html = Views.dashboard();
  has(html, "继续学习");
  has(html, "今日任务");
});

/* ==========================================================================
   10. P0 游戏化：游客档案 / 红心 / 星币商店 / 每日任务 / 自由模式
   ========================================================================== */
console.log("\n■ P0 游戏化 · 数据层");
t("未登录走游客档案，actor 返回游客伪档案", () => {
  Store.logout();
  const p = Store.progress();
  ok(sandbox.localStorage.getItem("lingua.v1.progress.guest") !== null, "游客档案应写入 localStorage");
  const a = Store.actor();
  eq(a.id, "guest"); eq(a.guest, true); eq(a.name, "游客学习者");
  eq(p.freeMode, false, "默认线性解锁");
});
t("注册继承游客进度：进度迁移到新账号，游客档案重置", () => {
  const g = Store.progress();
  g.xp = 66;
  Store.recordMistake(g, { lang: "en", mode: "grammar", prompt: "继承测试题", opts: ["a", "b"], answer: 0 });
  Store.saveProgress(g);
  const r = Store.register({ name: "继承者", targetLangs: ["en"] });
  ok(!r.error, "注册成功");
  eq(r.inherited, true, "应标记 inherited");
  const np = Store.progress();
  eq(np.xp, 66, "XP 已继承");
  eq(np.mistakes.length, 1, "错题已继承");
  const gg = JSON.parse(sandbox.localStorage.getItem("lingua.v1.progress.guest"));
  eq(gg.xp, 0, "游客档案已重置");
});
/* （红心/星币/商店系统已在 Phase A 移除，相关测试跳过） */

/* ==========================================================================
   10. P0 游戏化：游客档案 / 每日任务 / 自由模式
   ========================================================================== */
console.log("\n■ P0 游戏化 · 数据层");
t("每日任务：每日 3 项，进度可查", () => {
  const p = Store.progress();
  p.quests = { date: null, list: [] };
  Store.saveProgress(p);
  const st = Store.questState();
  eq(st.length, 3);
  st.forEach(q => ok(q.label && q.target > 0 && typeof q.value === "number", "任务定义完整"));
  eq(Store.progress().quests.date, Store._util.todayKey(), "任务日期为今天");
});
t("checkQuests：完成发 15 XP，全完成额外 +20 XP", () => {
  const p = Store.progress();
  p.quests = { date: Store._util.todayKey(), list: [{ id: "challenge1", done: false }, { id: "lesson1", done: false }] };
  p.questProg = { date: Store._util.todayKey(), correct: 0, lessons: 0, challenges: 0, reviewed: 0, words: 0 };
  const x0 = p.xp;
  Store.saveProgress(p);
  p.questProg.challenges = 1; Store.saveProgress(p);
  const d1 = Store.checkQuests();
  eq(d1.length, 1); eq(d1[0].id, "challenge1");
  eq(Store.progress().xp, x0 + 15, "完成单项 +15 XP");
  eq(Store.progress().quests.list[0].done, true);
  const p2 = Store.progress(); p2.questProg.lessons = 1; Store.saveProgress(p2);
  const d2 = Store.checkQuests();
  ok(d2.some(x => x.allBonus), "全部完成应含 allBonus");
  eq(Store.progress().xp, x0 + 50, "15+15+20=50");
});

console.log("\n■ P0 游戏化 · 视图");
/* （商店页/红心耗尽页/顶栏金币 pill 已在 Phase A 移除） */
t("dashboard 渲染今日任务卡", () => {
  const p = Store.progress();
  p.quests = { date: Store._util.todayKey(), list: [{ id: "xp30", done: false }, { id: "lesson1", done: true }, { id: "correct10", done: false }] };
  Store.saveProgress(p);
  const html = Views.dashboard();
  has(html, "今日任务");
  eq(count(html, /class="quest-row/g), 3, "任务 3 行");
  has(html, "每项 +15 XP");
});
t("课程页路径地图：锁定 / 当前课 / 气泡", () => {
  const html = Views.courses();
  has(html, "pm-node");
  has(html, "pm-bubble");
  has(html, 'data-action="locked"', "未学课程应锁定");
  has(html, "current", "当前课高亮");
  has(html, 'data-link="#/learn/', "当前课可进入");
});
t("自由模式开启后路径地图全部开放", () => {
  const p = Store.progress(); p.freeMode = true; Store.saveProgress(p);
  notHas(Views.courses(), 'data-action="locked"', "自由模式不应有锁定节点");
  const p2 = Store.progress(); p2.freeMode = false; Store.saveProgress(p2);
});
/* （顶栏金币 pill 已在 Phase A 移除） */

/* ---------------- 汇总 ---------------- */
console.log("\n========================================");
console.log("通过 " + pass + " / " + (pass + fail));
if (fail) {
  console.log("失败用例：");
  failures.forEach(f => console.log("  - " + f));
  process.exit(1);
}
console.log("全部通过 ✓");
