/* 步骤 1：下载开放数据源到 raw/（不入库），并解压 bz2 */
const U = require("./lib/util");

const FILES = [
  // 英语：NGSL 1.2（CC BY-SA 4.0）
  { url: "https://www.newgeneralservicelist.com/s/NGSL_12_lemmatized_for_teaching.csv", to: "dict/ngsl.csv" },
  // 英中词典 ECDICT（MIT）
  { url: "https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv", to: "dict/ecdict.csv" },
  // 日语 JLPT N5-N2（MIT，open-anki-jlpt-decks）
  { url: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv", to: "ja/jlpt-n5.csv" },
  { url: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n4.csv", to: "ja/jlpt-n4.csv" },
  { url: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n3.csv", to: "ja/jlpt-n3.csv" },
  { url: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n2.csv", to: "ja/jlpt-n2.csv" },
  // 韩语：国立国语院学习用词汇 + TOPIK 合并表（MIT）
  { url: "https://raw.githubusercontent.com/julienshim/combined_korean_vocabulary_list/master/results.tsv", to: "ko/nikl-topik.tsv" },
  // 韩英词典 Kengdic（CC BY-SA 3.0）
  { url: "https://raw.githubusercontent.com/garfieldnate/kengdic/master/kengdic.tsv", to: "ko/kengdic.tsv" },
  // 例句：Tatoeba 分语言导出（CC BY 2.0 FR）
  { url: "https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2", to: "tatoeba/cmn_sentences.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2", to: "tatoeba/eng_sentences.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2", to: "tatoeba/jpn_sentences.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/kor/kor_sentences.tsv.bz2", to: "tatoeba/kor_sentences.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/cmn/cmn-eng_links.tsv.bz2", to: "tatoeba/cmn-eng_links.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/cmn/cmn-jpn_links.tsv.bz2", to: "tatoeba/cmn-jpn_links.tsv.bz2" },
  { url: "https://downloads.tatoeba.org/exports/per_language/cmn/cmn-kor_links.tsv.bz2", to: "tatoeba/cmn-kor_links.tsv.bz2" }
];

function main() {
  U.ensureDirs(["dict", "ja", "ko", "tatoeba"]);
  U.log("== 1/4 下载原始数据 ==");
  for (const f of FILES) U.download(f.url, f.to);

  U.log("== 解压 Tatoeba 导出 ==");
  for (const f of FILES) {
    if (/\.bz2$/.test(f.to)) U.bunzip2(f.to);
  }
  // links 已改为按语言对导出，无需再解 tar
  U.log("下载完成。");
}

main();
