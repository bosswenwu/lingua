/* 词表装配：三份开放词表 → 统一词条结构 {t, m, r, level} */
const fs = require("fs");
const path = require("path");
const U = require("./util");
const C = require("./csv");
const CFG = require("./config");
const ZH = require("./zh");
const TH = require("./theme");
const { romanize } = require("./roman");

/* ---------------- 词典 ---------------- */

function loadEcdict() {
  const f = path.join(U.RAW, "dict", "ecdict.csv");
  if (!fs.existsSync(f)) throw new Error("缺少 " + f);
  const m = new Map();
  C.eachRow(f, (r) => {
    const w = (r[0] || "").toLowerCase().trim();
    if (!w || m.has(w)) return;
    m.set(w, {
      ph: r[1] || "", zh: r[3] || "",
      bnc: parseInt(r[8], 10) || 0, frq: parseInt(r[9], 10) || 0,
      collins: parseInt(r[5], 10) || 0, oxford: (r[6] || "").trim() === "1", tag: r[7] || ""
    });
  });
  return m;
}

function loadKengdic() {
  const f = path.join(U.RAW, "ko", "kengdic.tsv");
  if (!fs.existsSync(f)) throw new Error("缺少 " + f);
  const m = new Map();
  C.eachTsvRow(f, (r, i) => {
    if (i === 0) return;
    const surface = (r[1] || "").trim();
    const gloss = (r[3] || "").trim();
    if (!surface || !gloss) return;
    if (!m.has(surface)) m.set(surface, []);
    m.get(surface).push(gloss);
  });
  return m;
}

/* 词典式义项：不是词的本义，直接丢弃（例：第一个字母 A / 面孔的一部分(如眼、口等)） */
const DROP_SENSE = /字母|第一个|的一部分|的缩写|^是$|^表示$|^同上$|^见上$/;
const CJK_RE = /[\u3400-\u9fff]/;
/* ECDICT 行首词性标注 */
const POS_SET = new Set(["n", "v", "vt", "vi", "a", "adj", "adv", "ad", "prep", "conj", "pron", "art",
  "num", "int", "interj", "aux", "abbr", "pl", "na", "det", "part", "suff", "pref", "poss", "neg", "aux"]);

function stripPos(line) {
  let out = line;
  for (;;) {
    const m = out.match(/^\s*([A-Za-z][A-Za-z.]{0,7})\s*\.\s*&?\s*/);
    if (!m) break;
    const tag = m[1].toLowerCase().replace(/\.$/, "");
    if (!POS_SET.has(tag)) break;
    out = out.slice(m[0].length);
  }
  return out;
}

/* 清洗 ECDICT 中文释义为精简的 1–2 个常用义项（每个 ≤8 字，总长 ≤16） */
function cleanMeaning(raw) {
  if (!raw) return "";
  const s = String(raw).replace(/\\r\\n|\\n/g, "\n").replace(/\\r/g, "").replace(/\r/g, "");
  const senses = [];
  for (const line of s.split("\n")) {
    if (/^\s*\[/.test(line)) continue;                                     // 整行是 [计][经] 领域标签
    const q = stripPos(line.replace(/\[[^\]]*\]/g, " "));                   // 去词性标注与 [计] 标签
    for (const seg of q.split(/[,，;；]/)) {
      if (/[A-Za-z]{2,}/.test(seg)) continue;                              // 含英文单词 → 丢弃（P0-1/P0-2）
      const t = seg.replace(/<[^>]*>/g, "").replace(/[（(][^）)]*[）)]/g, "")
        .replace(/^[.·、\s]+|[.·、\s]+$/g, "").trim();
      if (!t) continue;
      if (DROP_SENSE.test(t)) continue;                                    // 词典式义项
      if (!CJK_RE.test(t)) continue;                                       // 纯英文残留
      if (senses.indexOf(t) >= 0) continue;                                // 同一词内义项去重
      senses.push(t);
    }
    if (senses.length >= 2) break;
  }
  const out = senses.slice(0, 2).join("；").slice(0, 16);
  return out;
}

/* 英语音标统一成标准 IPA 符号（ECDICT 兜底路径：去分隔点号、统一符号） */
function ipa(s) {
  if (!s) return "";
  return String(s)
    .replace(/ә/g, "ə").replace(/'/g, "ˈ").replace(/:/g, "ː")
    .replace(/\.(?=[a-zæʃʒθðɔəɪʊːˈˌ])/gi, "")   // 点号是音节分隔符，不是重音符号，去掉
    .replace(/^\.+|\.+$/g, "");
}

/* 释义是否含中文（无中文的占位词条不产出） */
function hasCjk(m) { return !!m && CJK_RE.test(m); }

/* 英文释义（如 "to meet, to see"）→ 中文 */
function zhFromGloss(gloss, ecdict) {
  if (!gloss) return "";
  const seg = String(gloss).split(/[,;]/)[0].trim();
  const stripped = seg.replace(/^(to|a|an|the)\s+/i, "").replace(/[.。]$/, "");
  for (const cand of [stripped, stripped.split(/\s+/)[0]]) {
    const hit = ecdict.get(String(cand).toLowerCase());
    if (hit && hit.zh) { const z = cleanMeaning(hit.zh); if (z) return z; }
  }
  return "";
}

/* ---------------- 分级 ---------------- */

/* 抽象名词后缀：NGSL/ECDICT 是词频表，抽象词按词频混进低级别；
   这些词一律不进 A1/A2（city/pity/ship 等短词靠最小长度豁免） */
const ABSTRACT = [
  /tion$|sion$/, /sis$/, /ment$/, /ness$/, /^.{6,}ity$/, /ance$|ence$/,
  /ism$/, /olog(y|ies)$/, /^.{7,}ship$/, /^.{6,}hood$/
];
/* 无后缀特征但确属抽象词的（A1/A2 不收） */
const ABSTRACT_EXTRA = new Set(["analysis", "behavior", "aspect", "concept", "context", "factor", "issue", "process", "approach"]);
function isAbstract(w) { return ABSTRACT.some(re => re.test(w)) || ABSTRACT_EXTRA.has(w); }

/* 英语：按 ECDICT 词频分词级（A1=前1000 具体词，A2=1001–2000，抽象词推到 B1） */
function enLevel(e, word) {
  const rank = e.frq || e.bnc || 0;
  let lv;
  if (rank) {
    if (rank <= 1000) lv = "a1";
    else if (rank <= 2000) lv = "a2";
    else if (rank <= 4800) lv = "b1";
    else lv = "b2";
  } else {
    if (e.oxford) lv = "a2";
    else if (/\b(zk|gk)\b/.test(e.tag)) lv = "a2";
    else if (e.collins >= 3) lv = "b1";
    else lv = "b2";
  }
  if ((lv === "a1" || lv === "a2") && word && isAbstract(word)) lv = "b1";
  return lv;
}

/* 日语：JLPT N5–N2 → A1–B2 */
const JA_LEVEL = { n5: "a1", n4: "a2", n3: "b1", n2: "b2" };
/* 韩语：NIKL 등급 A/B/C → A1/A2/B1；TOPIK 초급/중급/고급 */
const KO_NIKL = { a: "a1", b: "a2", c: "b1" };
const KO_TOPIK = { "초급": "a1", "중급": "b1", "고급": "b2" };

/* ---------------- 各语言计划 ---------------- */

function planEnglish(ecdict, cmudict) {
  const f = path.join(U.RAW, "dict", "ngsl.csv");
  if (!fs.existsSync(f)) throw new Error("缺少 " + f);
  const ngsl = [];
  const seen = new Set();
  U.readLines(f, (ln) => {
    if (!ln || ln.startsWith("##")) return;
    const head = ln.split(",")[0].trim().toLowerCase();
    if (!head || seen.has(head)) return;
    seen.add(head);
    ngsl.push(head);
  });

  const words = [];
  const push = (t, e, extra) => {
    const r = (cmudict && cmudict.get(t)) || (e.ph ? "/" + ipa(e.ph).replace(/^\/|\/$/g, "") + "/" : "");
    words.push({
      t, level: enLevel(e, t),
      m: cleanMeaning(e.zh),
      r,
      en: extra || "", src: "ngsl"
    });
  };
  for (const h of ngsl) {
    const e = ecdict.get(h);
    if (!e || !e.zh) { if (e) push(h, e); continue; }
    push(h, e);
  }
  return words;
}

function planEnglishSupplement(ecdict, exclude, cmudict) {
  const extra = [];
  ecdict.forEach((e, w) => {
    if (exclude.has(w)) return;
    if (!/^[a-z]+$/.test(w) || w.length < 3) return;
    const rank = e.frq || e.bnc || 0;
    if (!rank || rank < 1601 || rank > 14000) return;
    if (e.collins < 2 && !/\b(cet4|cet6|gk)\b/.test(e.tag)) return;
    if (!e.zh) return;
    extra.push({ w, e, rank });
  });
  extra.sort((a, b) => a.rank - b.rank);
  return extra.map(o => ({
    t: o.w, level: enLevel(o.e, o.w), m: cleanMeaning(o.e.zh),
    r: (cmudict && cmudict.get(o.w)) || (o.e.ph ? "/" + ipa(o.e.ph).replace(/^\/|\/$/g, "") + "/" : ""),
    en: "", src: "ecdict"
  }));
}

/* 词条原文形如「足; 脚」：分号前是主词，其余变备注，别整串当标题 */
function splitTermNote(expr) {
  const parts = String(expr).split(/[;；]/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return { term: parts[0] || "", note: "" };
  return { term: parts[0], note: parts.slice(1).join("；") };
}

function planJapanese(ecdict) {
  const words = [];
  const seen = new Set();
  const order = ["n5", "n4", "n3", "n2"];
  for (const lv of order) {
    const f = path.join(U.RAW, "ja", "jlpt-" + lv + ".csv");
    if (!fs.existsSync(f)) throw new Error("缺少 " + f);
    C.eachRow(f, (r) => {
      const expr = (r[0] || "").trim();
      const reading = (r[1] || "").trim();
      const meaning = (r[2] || "").trim();
      if (!expr) return;
      const { term, note } = splitTermNote(expr);
      if (!term || seen.has(term)) return;
      seen.add(term);
      const m = zhFromGloss(meaning, ecdict);
      const w = { t: term, level: JA_LEVEL[lv], m, en: meaning, r: reading, src: "jlpt-" + lv };
      if (note) w.note = note;
      words.push(w);
    });
  }
  return words;
}

function planKorean(ecdict, kengdic) {
  const f = path.join(U.RAW, "ko", "nikl-topik.tsv");
  if (!fs.existsSync(f)) throw new Error("缺少 " + f);
  const words = [];
  const seen = new Set();
  const SKIP_POS = /^(접사|어미|조사|의존명사|관형사|부사격조사)$/;
  C.eachTsvRow(f, (r, i) => {
    if (i === 0) return;
    const rawWord = (r[1] || "").trim();
    const pos = (r[2] || "").trim();
    const nikl = (r[5] || "").trim().toLowerCase();
    const topik = (r[6] || "").trim();
    if (!rawWord) return;
    if (SKIP_POS.test(pos)) return;
    let term = rawWord.replace(/^[-^]/, "").replace(/\d+$/, "").trim();
    if (!term || term.length < 1 || seen.has(term)) return;
    if (!/[가-힣]/.test(term)) return;
    let level = KO_NIKL[nikl] || KO_TOPIK[topik] || "a2";
    seen.add(term);
    const glosses = kengdic.get(term) || [];
    let m = "";
    for (const g of glosses) { m = zhFromGloss(g, ecdict); if (m) break; }
    words.push({ t: term, level, m, en: glosses.join("; "), r: romanize(term), src: "nikl-topik", pos, rank: parseInt(r[0], 10) || 0 });
  });

  // 词表最高只到 TOPIK 중급，B2 需要借用词频在「中高级池」内部再拆一层
  const pool = words.filter(w => w.level === "b1");
  pool.sort((a, b) => (a.rank || 1e9) - (b.rank || 1e9));
  pool.forEach((w, i) => { w.level = i < CFG.PER_LEVEL_CAP ? "b1" : "b2"; });
  return words;
}

/* ---------------- 装配成课程 JSON ---------------- */

function pickLevelWords(words, cap) {
  const byLevel = { a1: [], a2: [], b1: [], b2: [] };
  for (const w of words) {
    const b = byLevel[w.level] || (byLevel[w.level] = []);
    if (b.length < cap) b.push(w);
  }
  return byLevel;
}

/* 把词表均匀切成每课 target±1 词（A1 每课 6–8，其余 8–10；末课兜底允许 target-2） */
function splitEvenly(list, target) {
  const n = list.length;
  if (!n) return [];
  target = target || CFG.WORDS_PER_LESSON;
  let count = Math.max(1, Math.round(n / target));
  while (Math.ceil(n / count) > target + 1) count++;
  while (count > 1 && Math.floor(n / count) < target - 2) count--;
  const base = Math.floor(n / count), extra = n % count;
  const out = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    const size = base + (i < extra ? 1 : 0);
    out.push(list.slice(p, p + size));
    p += size;
  }
  return out;
}

/* 可疑释义（宁缺毋滥，先下架；等 LLM 重生后再上）：
   单字释义、以 在/是/表示 开头或含「表示」、含连续英文字母、释义等于原词 */
function isSuspicious(w) {
  const m = String(w && w.m || "").trim();
  if (!m) return true;
  if ([...m].length <= 1) return true;                    // 单字释义（渇く=在 这类）
  if (/^(在|是|表示)/.test(m)) return true;
  if (m.indexOf("表示") >= 0) return true;
  if (/[A-Za-z]/.test(m)) return true;                    // 中文释义不应含任何拉丁字母（含 u201c 等转义残留）
  if (m === String(w.t || "").trim()) return true;
  return false;
}

/* 课名代表词：该课前 3 个有实义的词（跳过单字与常见功能词），不足取实际数量 */
function repWords(chunk) {
  const picks = chunk.filter(w => TH.isRepresentative(w.t)).slice(0, 3).map(w => w.t);
  return (picks.length ? picks : chunk.slice(0, 3).map(w => w.t)).join(" ");
}

function materialize(lang, byLevel) {
  const levels = [];
  for (const L of CFG.LEVELS) {
    // 无中文释义、可疑释义（单字/在是有/英文残留）或释义等于原词的词条不产出：宁可少词，也不要错条目
    const list = (byLevel[L.id] || []).filter(w => hasCjk(w.m) && !isSuspicious(w));
    if (!list.length) continue;
    const target = CFG.wordsPerLesson(L.id);
    const range = CFG.lessonSizeRange(L.id);
    const inRange = (chunks) => chunks.every(c => c.length >= range.min && c.length <= range.max);

    /* 先分桶：逐词按释义归主题（主题内保持原字母序/原顺序），保证每课成员同主题 */
    const buckets = new Map([["base", []]]);
    for (const w of list) {
      const slug = TH.wordTheme(w.m).slug;
      if (!buckets.has(slug)) buckets.set(slug, []);
      buckets.get(slug).push(w);
    }
    /* 切不出 2 课、或切出来有课超出每课词数区间的主题，整桶并入基础词汇，避免碎单元 */
    for (const t of TH.THEMES) {
      if (t.slug === "base") continue;
      const ws = buckets.get(t.slug);
      if (!ws || !ws.length) continue;
      const chunks = splitEvenly(ws, target);
      if (chunks.length < 2 || !inRange(chunks)) {
        buckets.get("base").push(...ws);
        buckets.set(t.slug, []);
      }
    }
    /* 基础桶自身切不出合法课时，把最小的主题桶并入（整桶并入不破坏其余课的主题纯度） */
    let bChunks = splitEvenly(buckets.get("base"), target);
    while (!inRange(bChunks)) {
      let minSlug = "";
      for (const t of TH.THEMES) {
        if (t.slug === "base") continue;
        const ws = buckets.get(t.slug);
        if (ws && ws.length && (!minSlug || ws.length < buckets.get(minSlug).length)) minSlug = t.slug;
      }
      if (!minSlug) break;
      buckets.get("base").push(...buckets.get(minSlug));
      buckets.set(minSlug, []);
      bChunks = splitEvenly(buckets.get("base"), target);
    }

    /* 单元 = 主题：unit.id 形如 ja-a1-food（跨级别唯一稳定），unit.name = 主题名；
       单元按主题定义顺序排列（基础词汇殿后），单元内课保持主题内原顺序；
       课 id 按新顺序重排（u{单元序}-l{课序}，格式不变、级别内唯一） */
    const units = [];
    let unitNo = 0;
    for (const t of TH.THEMES) {
      const ws = buckets.get(t.slug);
      if (!ws || !ws.length) continue;
      unitNo++;
      const unit = { id: lang + "-" + L.id + "-" + t.slug, name: t.name, lessons: [] };
      splitEvenly(ws, target).forEach((chunk, i) => {
        unit.lessons.push({
          id: lang + "-" + L.id + "-u" + unitNo + "-l" + (i + 1),
          title: t.name + " · " + repWords(chunk),
          sub: t.name + "词汇 · 第 " + (i + 1) + " 课", minutes: 8, xp: 50,
          focus: L.badge + " " + t.name + "词汇",
          vocab: chunk.map(w => {
            const o = { t: w.t, m: ZH.normalizeZh(w.m), r: w.r || "" };
            if (w.note) o.note = ZH.normalizeZh(w.note);
            if (w.ex && w.ex.length) o.ex = w.ex.map(e => ({ t: e.t, tr: ZH.normalizeZh(e.tr) }));
            return o;
          }),
          grammar: [], listening: [], speaking: []
        });
      });
      units.push(unit);
    }
    levels.push({ id: lang + "-" + L.id, name: L.name, badge: L.badge, target: list.length, units });
  }
  return { code: lang, levels };
}

module.exports = {
  loadEcdict, loadKengdic, cleanMeaning, zhFromGloss, ipa, hasCjk, isSuspicious, isAbstract,
  planEnglish, planEnglishSupplement, planJapanese, planKorean,
  pickLevelWords, splitEvenly, materialize
};
