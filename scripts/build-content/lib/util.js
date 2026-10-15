/* 构建流水线公共工具：目录、下载（curl/代理）、解压（7z）、日志 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..", "..");       // 项目根
const RAW = path.join(ROOT, "scripts", "build-content", "raw");
const DATA = path.join(ROOT, "data");

const SEVEN_ZIP = "C:\\Program Files\\7-Zip\\7z.exe";

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
function ensureDirs(names) { names.forEach(n => ensureDir(path.join(RAW, n))); }

function log(msg) { console.log(msg); }

function proxyArgs() {
  const p = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
  return p ? ["--proxy", p] : [];
}

/* 下载到 raw/ 缓存；已存在且大小 > 0 则跳过 */
function download(url, relPath, opts) {
  opts = opts || {};
  const dest = path.join(RAW, relPath);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0 && !opts.force) {
    log("  cached  " + relPath + "  (" + (fs.statSync(dest).size / 1024 | 0) + " KB)");
    return dest;
  }
  ensureDir(path.dirname(dest));
  const tmp = dest + ".part";
  log("  GET     " + url);
  const args = ["-L", "--fail", "--silent", "--show-error", "--retry", "2", "--max-time", "900"]
    .concat(proxyArgs()).concat(["-o", tmp, url]);
  try {
    execFileSync("C:\\Windows\\system32\\curl.exe", args, { stdio: ["ignore", "inherit", "inherit"] });
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    throw new Error("下载失败: " + url + " :: " + e.message);
  }
  fs.renameSync(tmp, dest);
  log("  saved   " + relPath + "  (" + (fs.statSync(dest).size / 1024 | 0) + " KB)");
  return dest;
}

/* 用 7z 解压 .bz2 → 输出文件（去掉 .bz2 后缀） */
function bunzip2(relPath) {
  const src = path.join(RAW, relPath);
  const dest = src.replace(/\.bz2$/, "");
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    log("  cached  " + path.relative(RAW, dest));
    return dest;
  }
  log("  7z      " + relPath);
  execFileSync(SEVEN_ZIP, ["e", "-y", "-o" + path.dirname(dest), src], { stdio: ["ignore", "ignore", "inherit"] });
  if (!fs.existsSync(dest)) throw new Error("解压失败: " + relPath);
  log("  saved   " + path.relative(RAW, dest) + "  (" + (fs.statSync(dest).size / 1024 / 1024).toFixed(1) + " MB)");
  return dest;
}

function readText(p) { return fs.readFileSync(p, "utf8"); }

/* 逐行迭代大文件，避免一次性读入 */
function readLines(p, cb) {
  const fd = fs.openSync(p, "r");
  const bufSize = 1 << 20;
  const buf = Buffer.alloc(bufSize);
  let carry = "";
  try {
    for (;;) {
      const n = fs.readSync(fd, buf, 0, bufSize, null);
      if (n <= 0) break;
      const chunk = carry + buf.toString("utf8", 0, n);
      const lines = chunk.split("\n");
      carry = lines.pop();
      for (const ln of lines) cb(ln);
    }
    if (carry) cb(carry);
  } finally { fs.closeSync(fd); }
}

function writeJson(p, obj, pretty) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, pretty ? 2 : 0), "utf8");
}

function writeText(p, text) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, text, "utf8");
}

module.exports = {
  ROOT, RAW, DATA, SEVEN_ZIP,
  ensureDir, ensureDirs, log, download, bunzip2, readText, readLines, writeJson, writeText
};
