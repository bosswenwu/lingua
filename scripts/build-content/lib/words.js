/* 词表装配：三份开放词表 → 统一词条结构 {t, m, r, level} */
const fs = require("fs");
const path = require("path");
const U = require("./util");
const C = require("./csv");
const CFG = require("./config");
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

/* 清洗 ECDICT 中文释义为简短可用形式 */
function cleanMeaning(raw) {
  if (!raw) return "";
  let s = String(raw).replace(/\\n/g, "/").replace(/\r?\n/g, "/");
  const parts = s.split("/").map(x => x.trim()).filter(Boolean);
  let core = "";
  for (const p of parts) {
    if (/^\[.*\]/.test(p)) continue;     // 丢弃 [医][经] 之类领域标签
    core = p; break;
  }
  if (!core) core = parts[0] || "";
  core = core.replace(/^(n|v|vt|vi|a|adj|ad|adv|prep|conj|pron|art|num|int|aux|abbr|pl|vt\.|vi\.)\s*\.?\s+/i, "");
  const senses = core.split(/[,，;；]/).map(x => x.trim()).filter(Boolean);
  let out = senses.slice(0, 2).join("；");
  out = out.replace(/^[.·、\s]+|[.·、\s]+$/g, "");
  if (out.length > 26) out = out.slice(0, 26);
  return out;
}

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

/* 英语：按 ECDICT 词频分词级 */
function enLevel(e) {
  const rank = e.frq || e.bnc || 0;
  if (rank) {
    if (rank <= 1600) return "a1";
    if (rank <= 3200) return "a2";
    if (rank <= 6000) return "b1";
    return "b2";
  }
  if (e.oxford) return "a2";
  if (/\b(zk|gk)\b/.test(e.tag)) return "a2";
  if (e.collins >= 3) return "b1";
  return "b2";
}

/* 日语：JLPT N5–N2 → A1–B2 */
const JA_LEVEL = { n5: "a1", n4: "a2", n3: "b1", n2: "b2" };
/* 韩语：NIKL 등급 A/B/C → A1/A2/B1；TOPIK 초급/중급/고급 */
const KO_NIKL = { a: "a1", b: "a2", c: "b1" };
const KO_TOPIK = { "초급": "a1", "중급": "b1", "고급": "b2" };

/* ---------------- 各语言计划 ---------------- */

function planEnglish(ecdict) {
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
    words.push({
      t, level: enLevel(e),
      m: cleanMeaning(e.zh),
      r: e.ph ? "/" + e.ph.replace(/^\/|\/$/g, "") + "/" : "",
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

function planEnglishSupplement(ecdict, exclude) {
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
    t: o.w, level: enLevel(o.e), m: cleanMeaning(o.e.zh),
    r: o.e.ph ? "/" + o.e.ph.replace(/^\/|\/$/g, "") + "/" : "", en: "", src: "ecdict"
  }));
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
      if (!expr || seen.has(expr)) return;
      seen.add(expr);
      const m = zhFromGloss(meaning, ecdict);
      words.push({ t: expr, level: JA_LEVEL[lv], m, en: meaning, r: reading, src: "jlpt-" + lv });
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

/* 把词表均匀切成每课 15–20 词 */
function splitEvenly(list) {
  const n = list.length;
  if (!n) return [];
  let count = Math.max(1, Math.round(n / CFG.WORDS_PER_LESSON));
  while (Math.ceil(n / count) > 20) count++;
  while (count > 1 && Math.floor(n / count) < 15) count--;
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

function materialize(lang, byLevel) {
  const levels = [];
  for (const L of CFG.LEVELS) {
    const list = byLevel[L.id] || [];
    if (!list.length) continue;
    const chunks = splitEvenly(list);
    const units = [];
    let unitNo = 0;
    for (let i = 0; i < chunks.length; i++) {
      if (i % CFG.LESSONS_PER_UNIT === 0) {
        unitNo++;
        units.push({ id: lang + "-" + L.id + "-u" + unitNo, name: L.badge + " · 第 " + unitNo + " 单元", lessons: [] });
      }
      const chunk = chunks[i];
      const lNo = ((i % CFG.LESSONS_PER_UNIT) + 1);
      const unit = units[units.length - 1];
      const id = lang + "-" + L.id + "-u" + unitNo + "-l" + lNo;
      const first = chunk[0].t, last = chunk[chunk.length - 1].t;
      unit.lessons.push({
        id, title: L.badge + " 第 " + unitNo + "-" + lNo + " 课",
        sub: first + " — " + last, minutes: 8, xp: 50, focus: L.badge + " 核心词汇",
        vocab: chunk.map(w => {
          const o = { t: w.t, m: w.m || w.en || w.t, r: w.r || "" };
          if (w.ex && w.ex.length) o.ex = w.ex;
          return o;
        }),
        grammar: [], listening: [], speaking: []
      });
    }
    levels.push({ id: lang + "-" + L.id, name: L.name, badge: L.badge, target: list.length, units });
  }
  return { code: lang, levels };
}

module.exports = {
  loadEcdict, loadKengdic, cleanMeaning, zhFromGloss,
  planEnglish, planEnglishSupplement, planJapanese, planKorean,
  pickLevelWords, materialize
};
