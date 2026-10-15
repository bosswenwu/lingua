/* 词表无例句时的模板补句（仅用于名词，且助词按收音自动选择，保证语法正确） */
const HAS_JONG = (ch) => {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3 && ((c - 0xac00) % 28) !== 0;
};
const lastJong = (w) => HAS_JONG(w[w.length - 1]);

/* 韩语：名词模板（m 为空时不生成） */
function koNoun(t, m) {
  if (!m) return [];
  const j = lastJong(t);
  return [
    { t: "이것은 " + t + (j ? "이에요." : "예요."), tr: "这是" + m + "。" },
    { t: t + (j ? "이" : "가") + " 있어요.", tr: "有" + m + "。" },
    { t: t + (j ? "을" : "를") + " 좋아해요.", tr: "喜欢" + m + "。" },
    { t: t + (j ? "은" : "는") + " 좋아요.", tr: m + "很好。" }
  ];
}

module.exports = { koNoun };
