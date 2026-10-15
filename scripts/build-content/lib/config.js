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

const LOCALES = { en: "en-US", ja: "ja-JP", ko: "ko-KR" };
/* Tatoeba 三字码 */
const TATOEBA = { en: "eng", ja: "jpn", ko: "kor" };

module.exports = { LEVELS, WORDS_PER_LESSON, LESSONS_PER_UNIT, PER_LEVEL_CAP, MAX_WORDS_PER_LANG, EXAMPLES_PER_WORD, LOCALES, TATOEBA };
