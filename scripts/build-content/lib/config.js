/* 级别与切课配置（三门语言共用同一套结构） */
const LEVELS = [
  { id: "a1", badge: "A1", name: "A1 入门" },
  { id: "a2", badge: "A2", name: "A2 基础" },
  { id: "b1", badge: "B1", name: "B1 进阶" },
  { id: "b2", badge: "B2", name: "B2 中高级" }
];

const WORDS_PER_LESSON = 9;    // 目标 8-10（a2/b1/b2）
const A1_WORDS_PER_LESSON = 7; // A1 每课 6-8 个，降低单课步数
const LESSONS_PER_UNIT = 6;    // 每个单元 6 课
const PER_LEVEL_CAP = 700;     // 每个级别词数上限（4 级合计 2800）
const MAX_WORDS_PER_LANG = PER_LEVEL_CAP * 4;
const EXAMPLES_PER_WORD = 3;   // 每个词最多 3 条例句

/* 例句按级别筛选：a1/a2 只收短句，避免超出级别的长难句 */
const EX_LIMITS = {
  short: { en: 8, ja: 15, ko: 15 },   // a1/a2 长度上限（en 记单词数，ja/ko 记字符数）
  maxUnknown: 3,                      // 超出级别的生词上限（仅英语可判定）
  maxLen: 90,                         // 所有级别的绝对长度上限（字符）
  // 直译率：原文（去空白/标点）与译文汉字数之比超出区间视为意译/瞎翻，丢弃
  ratioEnToZh: 3.0,                   // 英文原文 / 中文译文 上限
  ratioZhToEn: 2.5                    // 中文译文 / 英文原文 上限
};

/* 每课目标词数与校验区间（a1 更小） */
function wordsPerLesson(levelId) { return levelId === "a1" ? A1_WORDS_PER_LESSON : WORDS_PER_LESSON; }
/* 校验允许的每课词数区间：常规 target±1，末课兜底允许 target-2（避免整除死锁） */
function lessonSizeRange(levelId) {
  const t = wordsPerLesson(levelId);
  return { min: t - 2, max: t + 1 };
}

const LOCALES = { en: "en-US", ja: "ja-JP", ko: "ko-KR" };
/* Tatoeba 三字码 */
const TATOEBA = { en: "eng", ja: "jpn", ko: "kor" };

module.exports = { LEVELS, WORDS_PER_LESSON, A1_WORDS_PER_LESSON, LESSONS_PER_UNIT, PER_LEVEL_CAP, MAX_WORDS_PER_LANG, EXAMPLES_PER_WORD, EX_LIMITS, LOCALES, TATOEBA, wordsPerLesson, lessonSizeRange };
