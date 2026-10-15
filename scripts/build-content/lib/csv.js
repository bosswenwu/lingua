/* 简易 CSV 解析（支持双引号包裹、转义 ""、字段内含逗号） */
const fs = require("fs");

function parseLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

/* 流式逐行解析大 CSV（字段内不含真实换行时会安全拆分） */
function eachRow(file, cb) {
  const fd = fs.openSync(file, "r");
  const bufSize = 1 << 20;
  const buf = Buffer.alloc(bufSize);
  let carry = "";
  let header = null, n = 0;
  try {
    for (;;) {
      const k = fs.readSync(fd, buf, 0, bufSize, null);
      if (k <= 0) break;
      const chunk = carry + buf.toString("utf8", 0, k);
      const lines = chunk.split("\n");
      carry = lines.pop();
      for (let ln of lines) {
        if (ln.endsWith("\r")) ln = ln.slice(0, -1);
        if (!ln) continue;
        if (header === null) { header = parseLine(ln.replace(/^\uFEFF/, "")); continue; }
        cb(parseLine(ln), header, n++);
      }
    }
    if (carry) { if (carry.endsWith("\r")) carry = carry.slice(0, -1); cb(parseLine(carry), header, n++); }
  } finally { fs.closeSync(fd); }
}

function readCsv(file) {
  const rows = [];
  eachRow(file, r => rows.push(r));
  return rows;
}

/* TSV（Tatoeba 导出 / kengdic 为 tab 分隔） */
function eachTsvRow(file, cb) {
  const fd = fs.openSync(file, "r");
  const bufSize = 1 << 20;
  const buf = Buffer.alloc(bufSize);
  let carry = "";
  let n = 0;
  try {
    for (;;) {
      const k = fs.readSync(fd, buf, 0, bufSize, null);
      if (k <= 0) break;
      const chunk = carry + buf.toString("utf8", 0, k);
      const lines = chunk.split("\n");
      carry = lines.pop();
      for (let ln of lines) {
        if (ln.endsWith("\r")) ln = ln.slice(0, -1);
        if (!ln) continue;
        cb(ln.split("\t"), n++);
      }
    }
    if (carry) { if (carry.endsWith("\r")) carry = carry.slice(0, -1); cb(carry.split("\t"), n++); }
  } finally { fs.closeSync(fd); }
}

module.exports = { parseLine, eachRow, readCsv, eachTsvRow };
