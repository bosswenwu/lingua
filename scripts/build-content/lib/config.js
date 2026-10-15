/* 级别与切课配置（三门语言共用同一套结构） */
const LEVELS = [
  { id: "a1", badge: "A1", name: "A1 入门" },
  { id: "a2", badge: "A2", name: "A2 基础" },
  { id: "b1", badge: "B1", name: "B1 进阶" },
  { id: "b2", badge: "B2", name: "B2 中高级" }
];

const WORDS_PER_LESSON = 17;   // 目标 15-20
const LESSONS_PER_UNIT = 6;    // 每个单元 6 课 ≈ 100 词
const PER_LEVEL_CAP = 700;     // 每个级别词数上限（4 级合计 2800）
const MAX_WORDS_PER_LANG = PER_LEVEL_CAP * 4;
const EXAMPLES_PER_WORD = 3;   // 每个词最多 3 条例句

/* 例句按级别筛选：a1/a2 只收短句，避免超出级别的长难句 */
const EX_LIMITS = {
  short: { en: 8, ja: 15, ko: 15 },   // a1/a2 长度上限（en 记单词数，ja/ko 记字符数）
  maxUnknown: 3,                      // 超出级别的生词上限（仅英语可判定）
  maxLen: 90                          // 所有级别的绝对长度上限（字符）
};

const LOCALES = { en: "en-US", ja: "ja-JP", ko: "ko-KR" };
/* Tatoeba 三字码 */
const TATOEBA = { en: "eng", ja: "jpn", ko: "kor" };

module.exports = { LEVELS, WORDS_PER_LESSON, LESSONS_PER_UNIT, PER_LEVEL_CAP, MAX_WORDS_PER_LANG, EXAMPLES_PER_WORD, EX_LIMITS, LOCALES, TATOEBA };
