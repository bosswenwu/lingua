/* CMUdict（cmudict-0.7b）→ 标准 IPA
   输入：raw/dict/cmudict.txt（ARPAbet，带 0/1/2 重音数字）
   输出：Map<word, "/ˈɪpa/">；取每个词的第一条发音（无 (n) 后缀者优先）
   重音：1 → ˈ（主），2 → ˌ（次），标在对应元音前
*/
const fs = require("fs");
const path = require("path");
const U = require("./util");

/* ARPAbet → IPA（美式） */
const VOWELS = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔː", AW: "aʊ", AY: "aɪ", EH: "ɛ",
  ER: "ɜːr", EY: "eɪ", IH: "ɪ", IY: "iː", OW: "oʊ", OY: "ɔɪ", UH: "ʊ", UW: "uː"
};
const CONS = {
  B: "b", CH: "tʃ", D: "d", DH: "ð", F: "f", G: "ɡ", HH: "h", JH: "dʒ",
  K: "k", L: "l", M: "m", N: "n", NG: "ŋ", P: "p", R: "r", S: "s", SH: "ʃ",
  T: "t", TH: "θ", V: "v", W: "w", Y: "j", Z: "z", ZH: "ʒ"
};
const STRESS_MARK = { "1": "ˈ", "2": "ˌ" };

function phonesToIpa(phones) {
  let out = "";
  for (const p of phones) {
    const m = p.match(/^([A-Z]+)(\d?)$/);
    if (!m) return "";
    const base = m[1], stress = m[2];
    if (VOWELS[base]) {
      let v = VOWELS[base];
      if (base === "AH" && stress === "0") v = "ə";       // 非重读 schwa
      if (base === "ER" && stress === "0") v = "ər";
      out += (STRESS_MARK[stress] || "") + v;
    } else if (CONS[base]) {
      out += CONS[base];
    } else {
      return "";                                           // 未知音素，整条弃用
    }
  }
  return out;
}

function loadCmudict() {
  const f = path.join(U.RAW, "dict", "cmudict.txt");
  if (!fs.existsSync(f)) return new Map();                 // 缺文件：回退 ECDICT 音标
  const m = new Map();
  const buf = fs.readFileSync(f, "utf8").split("\n");
  for (const ln of buf) {
    if (!ln || ln.startsWith(";;;")) continue;
    const sp = ln.trim().split(/\s+/);
    let word = sp[0] || "";
    if (!word) continue;
    word = word.replace(/\(\d+\)$/, "").toLowerCase();     // WORD(2) → word
    if (!/^[a-z' -]+$/.test(word)) continue;
    if (m.has(word)) continue;                             // 只留第一条发音
    const ipa = phonesToIpa(sp.slice(1));
    if (ipa) m.set(word, "/" + ipa + "/");
  }
  return m;
}

module.exports = { loadCmudict, phonesToIpa };
