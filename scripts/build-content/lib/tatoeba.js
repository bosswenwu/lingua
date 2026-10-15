/* 从 Tatoeba 分语言导出构建「目标语 ↔ 中文」例句索引
   输入：raw/tatoeba/{lang}_sentences.tsv（id, lang, text）
         raw/tatoeba/cmn_sentences.tsv
         raw/tatoeba/cmn-{lang}_links.tsv（id1 \\t id2）
   输出：Map<term, [{t, tr}, ...]>
*/
const fs = require("fs");
const path = require("path");
const U = require("./util");
const C = require("./csv");
const CFG = require("./config");

const MIN_LEN = 3;

/* 韩语常见助词/词尾，用于把 token 还原为词干 */
const KO_SUFFIX = ["에서", "에게", "으로", "부터", "까지", "에는", "에도", "이라는", "라고", "라고는",
  "은", "는", "이", "가", "을", "를", "에", "의", "와", "과", "도", "만", "로", "들", "나", "이나"];

function stripKo(token) {
  for (const s of KO_SUFFIX) {
    if (token.length > s.length + 1 && token.endsWith(s)) return token.slice(0, -s.length);
  }
  return token;
}

/* 载入 cmn 全量句子（体量小） */
function loadCmn() {
  const m = new Map();
  const f = path.join(U.RAW, "tatoeba", "cmn_sentences.tsv");
  if (!fs.existsSync(f)) throw new Error("缺少 " + f);
  C.eachTsvRow(f, (r) => { if (r[2]) m.set(r[0], r[2]); });
  return m;
}

/* 构建 term → 例句
   opts.levelOf : Map<term, level>   用于按级别筛句
   opts.easySet : Set<string>        该语言 a1/a2 词集合（仅英语用于「生词上限」判定）
*/
function buildExamples(lang, terms, opts) {
  opts = opts || {};
  const levelOf = opts.levelOf || new Map();
  const easySet = opts.easySet || null;
  const code = CFG.TATOEBA[lang];
  if (!code) throw new Error("未知语言 " + lang);
  const tSet = new Set(terms);
  const cmn = loadCmn();

  // 1. links：得到 targetId → cmnId
  const pairs = [];
  const needIds = new Set();
  const lf = path.join(U.RAW, "tatoeba", "cmn-" + code + "_links.tsv");
  if (!fs.existsSync(lf)) throw new Error("缺少 " + lf);
  C.eachTsvRow(lf, (r) => {
    const a = r[0], b = r[1];
    if (!a || !b) return;
    let tid = null, cid = null;
    if (cmn.has(a)) { cid = a; tid = b; }
    else if (cmn.has(b)) { cid = b; tid = a; }
    if (tid === null) return;
    pairs.push([tid, cid, cmn.get(cid)]);
    needIds.add(tid);
  });

  // 2. 只保留被链接到的目标语句子
  const tSent = new Map();
  const sf = path.join(U.RAW, "tatoeba", code + "_sentences.tsv");
  if (!fs.existsSync(sf)) throw new Error("缺少 " + sf);
  C.eachTsvRow(sf, (r) => {
    const id = r[0], text = r[2];
    if (text && needIds.has(id)) tSent.set(id, text);
  });

  // 3. 匹配
  const matcher = makeMatcher(lang, tSet);
  const out = new Map();
  const seen = new Map();       // term → Set<原文句> 去重（按原文，不按译文）
  for (const [tid, cid, ctext] of pairs) {
    const text = tSent.get(tid);
    if (!text || !ctext) continue;
    if (text.length > CFG.EX_LIMITS.maxLen || text.length < MIN_LEN) continue;
    const cands = matcher(text);
    for (const term of cands) {
      if (lang === "ko" && isKoTemplate(term, text)) continue;    // 模板补句形态，直接弃用
      if (!passLevel(lang, levelOf.get(term), text, easySet)) continue;
      if (!out.has(term)) { out.set(term, []); seen.set(term, new Set()); }
      const arr = out.get(term);
      if (arr.length >= 6) continue;
      if (seen.get(term).has(text)) continue;
      seen.get(term).add(text);
      arr.push({ t: text, tr: ctext });
    }
  }
  return out;
}

/* 级别筛句：a1/a2 只收短句；英语再限制「超出级别的生词」数量 */
function passLevel(lang, lv, text, easySet) {
  if (lv !== "a1" && lv !== "a2") return true;
  const cap = CFG.EX_LIMITS.short[lang];
  if (lang === "en") {
    const toks = text.toLowerCase().split(/[^a-z']+/).filter(Boolean);
    if (toks.length > cap) return false;
    if (easySet) {
      let unknown = 0;
      for (const tk of toks) if (!easySet.has(tk)) unknown++;
      if (unknown > CFG.EX_LIMITS.maxUnknown) return false;
    }
    return true;
  }
  return text.length <= cap;
}

/* 构造匹配器：一次性建索引，避免逐句遍历全词表 */
function makeMatcher(lang, tSet) {
  let maxLen = 1;
  tSet.forEach(t => { if (t.length > maxLen) maxLen = t.length; });

  if (lang === "ko") {
    return function (text) {
      const hits = [];
      const toks = text.split(/[\s,.!?;:()"'·…]+/);
      for (const raw of toks) {
        if (!raw) continue;
        if (tSet.has(raw)) { if (hits.indexOf(raw) < 0) hits.push(raw); continue; }
        const stem = stripKo(raw);
        if (stem !== raw && tSet.has(stem) && hits.indexOf(stem) < 0) hits.push(stem);
      }
      return hits;
    };
  }

  if (lang === "ja") {
    return function (text) {
      const hits = [];
      for (let i = 0; i < text.length; i++) {
        for (let L = maxLen; L >= 2; L--) {
          if (i + L > text.length) continue;
          const sub = text.substr(i, L);
          if (tSet.has(sub) && hits.indexOf(sub) < 0) hits.push(sub);
        }
      }
      return hits;
    };
  }

  // 英语：分词查表 + 短语整体匹配
  const phrases = [];
  tSet.forEach(t => { if (t.indexOf(" ") >= 0) phrases.push(t); });
  return function (text) {
    const hits = [];
    const low = text.toLowerCase();
    const toks = low.split(/[^a-z']+/);
    for (const tk of toks) {
      if (tk && tSet.has(tk) && hits.indexOf(tk) < 0) hits.push(tk);
    }
    if (phrases.length) {
      const pad = " " + low.replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ") + " ";
      for (const p of phrases) {
        if (pad.indexOf(" " + p + " ") >= 0 && hits.indexOf(p) < 0) hits.push(p);
      }
    }
    return hits;
  };
}

/* 写作「模板补句」判定：整句恰为 该词 + 固定句式（이것은…이에요 / …있어요 / …좋아해요 / …좋아요）
   构建期用它剔除这类句子；校验期用同一函数兜底，避免「宁可没有例句，也不要病句」。 */
function hasJong(ch) {
  const c = ch ? ch.charCodeAt(0) : 0;
  return c >= 0xac00 && c <= 0xd7a3 && ((c - 0xac00) % 28) !== 0;
}
function isKoTemplate(term, text) {
  if (!term || !text) return false;
  const j = hasJong(term[term.length - 1]);
  const forms = [
    "이것은 " + term + (j ? "이에요." : "예요."),
    term + (j ? "이" : "가") + " 있어요.",
    term + (j ? "을" : "를") + " 좋아해요.",
    term + (j ? "은" : "는") + " 좋아요."
  ];
  const s = text.trim();
  return forms.indexOf(s) >= 0;
}

/* 判断一句目标语中命中了哪些词条 */
function matchTerms(lang, text, tSet, matcher) {
  return matcher ? matcher(text) : makeMatcher(lang, tSet)(text);
}

/* 按最终词表裁剪例句：优先短句，最多 n 条 */
function pickExamples(all, term, n) {
  const list = (all.get(term) || []).slice();
  list.sort((a, b) => a.t.length - b.t.length);
  return list.slice(0, n).map(x => ({ t: x.t, tr: x.tr }));
}

module.exports = { buildExamples, pickExamples, stripKo, isKoTemplate };
