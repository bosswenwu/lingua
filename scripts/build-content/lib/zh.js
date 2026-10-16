/* 中文文本规范化：OpenCC 繁→简（t2s）+ 标点统一全角 + 空白清理
   opencc-js 仅作为构建期依赖，站点运行时保持零依赖。 */
const OpenCC = require("opencc-js");

let _conv = null;
function conv() {
  if (!_conv) _conv = OpenCC.Converter({ from: "tw", to: "cn" });
  return _conv;
}

/* 繁体 → 简体（含台湾异体字回正） */
function t2s(text) {
  if (!text) return "";
  let out;
  try { out = conv()(String(text)); } catch (e) { return String(text); }
  /* OpenCC tw→cn 会把「著」一律当成助词「着」，把显著、著作等词转错，这里改回 */
  return out.replace(/(显|卓|昭|土|名)着/g, "$1著").replace(/着(名|作|称|述)/g, "著$1");
}

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const PUNCT = { ",": "，", ".": "。", "!": "！", "?": "？", ":": "：", ";": "；", "(": "（", ")": "）" };

/* 半角标点 → 全角（仅当紧邻中日韩字符时，避免破坏 3.5 / 1,000 这类数字） */
function fullWidthPunct(s) {
  if (!s) return "";
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const rep = PUNCT[ch];
    if (rep) {
      const prev = s[i - 1] || "", next = s[i + 1] || "";
      if (CJK.test(prev) || CJK.test(next)) { out += rep; continue; }
    }
    out += ch;
  }
  return out;
}

/* 中文字段统一入口：繁转简 → 全角标点 → 压缩多余空白 */
function normalizeZh(text) {
  if (!text) return "";
  let s = t2s(String(text));
  s = fullWidthPunct(s);
  s = s.replace(/[ \t\u3000]+/g, " ").replace(/\s+([，。！？：；）])/g, "$1").replace(/（\s+/g, "（");
  return s.trim();
}

/* 是否含繁体专用字符（用于校验；只查简繁差异表里"繁→简确有变化"的字）
   白名单：么（U+4E48）是标准简体语气字，OpenCC t2s 会误映射为「幺」，排除该误报 */
const T2S_FP = new Set(["么", "幺"]);
function hasTraditional(text) {
  if (!text) return false;
  const s = t2s(String(text));
  if (s === String(text)) return false;
  const strip = (t) => [...t].filter((ch) => !T2S_FP.has(ch)).join("");
  return strip(s) !== strip(String(text));
}

module.exports = { t2s, fullWidthPunct, normalizeZh, hasTraditional };
