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

const MAX_LEN = 90;          // 过长句子不取
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

/* 构建 term → 例句 */
function buildExamples(lang, terms) {
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
  const seen = new Map();       // term → Set<中文句> 去重
  for (const [tid, cid, ctext] of pairs) {
    const text = tSent.get(tid);
    if (!text || !ctext) continue;
    if (text.length > MAX_LEN || text.length < MIN_LEN) continue;
    const cands = matcher(text);
    for (const term of cands) {
      if (!out.has(term)) { out.set(term, []); seen.set(term, new Set()); }
      const arr = out.get(term);
      if (arr.length >= 6) continue;
      const key = ctext.slice(0, 24);
      if (seen.get(term).has(key)) continue;
      seen.get(term).add(key);
      arr.push({ t: text, tr: ctext });
    }
  }
  return out;
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

module.exports = { buildExamples, pickExamples, stripKo };
