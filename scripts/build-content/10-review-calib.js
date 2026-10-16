/* 步骤 10：二轮保守复核 en-calib.json（data/ 只读，不碰 02/04/07/tests）
   背景：08 一轮校准（384 处）抽样误判约 50%（把原本正确的改成错的）。
   本步骤逐条对比「data/ 原始值 vs 修正值」，让模型回答 keep/drop + 一句理由（batch 25）；
   复核后按 keep 过滤 overrides/en-calib.json（原地更新，只留确凿修正）。
   预检（不走模型直接剔除）：词/例句原文在 data/en 找不到（含手写课条目）、修正与原值相同、
   修正含英文、释义超 8 字 × 2 义项、译文无汉字或超长。
   判定从严：原文与修正都说得通 → drop；修正值有问题 → drop；拿不准 → drop。
   环境变量：LINGUA_LLM_API_KEY / LINGUA_LLM_BASE_URL / LINGUA_LLM_MODEL / LINGUA_LLM_CONCURRENCY（≤6）
   缓存：raw/build/calib-round2.json（按内容键缓存，重跑零成本）；有失败批次则中止、不落盘。 */
const fs = require("fs");
const path = require("path");
const U = require("./lib/util");
const ZH = require("./lib/zh");

const KEY = process.env.LINGUA_LLM_API_KEY || "";
const BASE = (process.env.LINGUA_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.LINGUA_LLM_MODEL || "gpt-4o-mini";
const CONC = Math.max(1, Math.min(6, parseInt(process.env.LINGUA_LLM_CONCURRENCY || "4", 10) || 4));
const BATCH = 25;

const CACHE_FILE = path.join(U.RAW, "build", "calib-round2.json");
const CALIB_FILE = path.join(__dirname, "overrides", "en-calib.json");
const LEVELS = ["a1", "a2", "b1", "b2"];

if (!KEY) { console.error("缺少 LINGUA_LLM_API_KEY，终止。"); process.exit(1); }

/* ---------- 模型调用（带重试与严格 JSON 提取，写法同 08-calibrate-en.js） ---------- */

function extractJson(txt) {
  const s = txt.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(s); } catch (e) { /* fallthrough */ }
  const a = s.indexOf("["), b = s.lastIndexOf("]");
  if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { /* fallthrough */ } }
  const c = s.indexOf("{"), d = s.lastIndexOf("}");
  if (c >= 0 && d > c) { try { return JSON.parse(s.slice(c, d + 1)); } catch (e) { /* fallthrough */ } }
  throw new Error("无法解析 JSON: " + s.slice(0, 120));
}

async function chat(user, system, tries) {
  tries = tries || 3;
  let lastErr;
  for (let a = 0; a < tries; a++) {
    try {
      const res = await fetch(BASE + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY },
        body: JSON.stringify({
          model: MODEL, temperature: 0.1,
          messages: [
            { role: "system", content: system || "你是资深英汉词典与双语教材审校。输出严格 JSON 数组，不添加任何多余文字。" },
            { role: "user", content: user }
          ]
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 160));
      const data = await res.json();
      const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      return extractJson(txt);
    } catch (e) {
      lastErr = e;
      if (a < tries - 1) await new Promise(r => setTimeout(r, 1200 * (a + 1)));
    }
  }
  throw lastErr;
}

async function runPool(items, worker, conc) {
  let i = 0;
  const runners = [];
  for (let c = 0; c < conc; c++) {
    runners.push((async () => {
      for (;;) {
        const idx = i++;
        if (idx >= items.length) return;
        await worker(items[idx], idx);
      }
    })());
  }
  await Promise.all(runners);
}

function chunksOf(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function strHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/* ---------- data/ 索引（只读） ---------- */

const wordEntries = new Map();                       // 词形 → [{ m, exs:[{t,tr}], ls }]
const exIndex = new Map();                           // 例句原文 → [{ t, m, tr }]
for (const lv of LEVELS) {
  const d = JSON.parse(U.readText(path.join(U.DATA, "en", lv + ".json")));
  for (const un of d.units) for (const ls of (un.lessons || [])) {
    for (const v of (ls.vocab || [])) {
      const exs = (Array.isArray(v.ex) ? v.ex : []).map(e => ({ t: e.t || "", tr: e.tr || "" }));
      if (!wordEntries.has(v.t)) wordEntries.set(v.t, []);
      wordEntries.get(v.t).push({ m: v.m || "", exs, ls: ls.id || "" });
      for (const e of exs) {
        if (!exIndex.has(e.t)) exIndex.set(e.t, []);
        exIndex.get(e.t).push({ t: v.t, m: v.m || "", tr: e.tr });
      }
    }
  }
}

/* ---------- 复核单元组装 + 预检 ---------- */

/* 释义修正值格式检查：1-2 个简体义项、每个 1-8 个汉字、无英文 */
function badFixM(s) {
  if (typeof s !== "string" || !s.trim()) return "修正释义为空";
  const parts = s.split("；").filter(Boolean);
  if (parts.length > 2) return "修正释义超过 2 个义项";
  for (const p of parts) {
    if (/[A-Za-z]/.test(p)) return "修正释义含英文";
    if (!/^[\u3400-\u9fff]{1,8}$/.test(p)) return "修正释义超 8 字或含标点";
  }
  return "";
}

function badFixTr(s) {
  if (typeof s !== "string" || !s.trim()) return "修正译文为空";
  if (!/[\u4e00-\u9fff]/.test(s)) return "修正译文无汉字";
  if (s.length > 150) return "修正译文超长";
  return "";
}

/* 组装待复核单元；pre 有值 = 预检直接剔除，不走模型 */
function buildUnits() {
  const calib = JSON.parse(U.readText(CALIB_FILE));
  const units = [];
  for (const t of Object.keys(calib.words || {})) {
    const fixM = (calib.words[t].m || "").trim();
    const es = wordEntries.get(t);
    if (!es || !es.length) { units.push({ kind: "word", t, fixM, pre: "词在 data/en 不存在（可能来自手写课）" }); continue; }
    const first = es[0];
    const ex = first.exs[0] || { t: "", tr: "" };
    const origM = first.m;
    if (fixM === origM) { units.push({ kind: "word", t, fixM, origM, pre: "修正与原释义相同" }); continue; }
    const bad = badFixM(fixM);
    if (bad) { units.push({ kind: "word", t, fixM, origM, pre: bad }); continue; }
    units.push({ kind: "word", t, fixM, origM, exT: ex.t, exTr: ex.tr });
  }
  for (const exT of Object.keys(calib.examples || {})) {
    const fixTr = (calib.examples[exT].tr || "").trim();
    const hits = exIndex.get(exT);
    if (!hits || !hits.length) { units.push({ kind: "ex", exT, fixTr, pre: "例句原文在 data/en 找不到" }); continue; }
    const origTr = hits[0].tr;
    if (fixTr === origTr) { units.push({ kind: "ex", exT, fixTr, origTr, pre: "修正与原译文相同" }); continue; }
    const bad = badFixTr(fixTr);
    if (bad) { units.push({ kind: "ex", exT, fixTr, origTr, pre: bad }); continue; }
    units.push({ kind: "ex", exT, fixTr, origTr, wT: hits[0].t, wM: hits[0].m });
  }
  return { calib, units };
}

/* ---------- 提示词 ---------- */

function reviewPrompt(batch) {
  const lines = batch.map((u, i) => {
    if (u.kind === "word") {
      return (i + 1) + ". 【词】" + u.t + " ｜例句：" + (u.exT || "（无）")
        + " ｜原译文：" + (u.exTr || "（无）")
        + " ｜原释义：" + (u.origM || "（空）") + " ｜修正释义：" + u.fixM;
    }
    return (i + 1) + ". 【例句】原句：" + u.exT + " ｜原译文：" + (u.origTr || "（空）")
      + " ｜修正译文：" + u.fixTr + "（该句属于词 " + u.wT + "，释义 " + (u.wM || "（空）") + "）";
  }).join("\n");
  return "下面是第一轮机器校准给出的修正清单，现做二轮保守复核。每行给出「原始值」与「修正值」，请逐条判定该修正是否确凿必要：keep=保留修正，drop=剔除修正。判定从严、宁缺毋滥。\n" +
    "keep 仅当原始值明确错误且修正值本身更准确、无问题：\n" +
    "- 【词】原释义明显张冠李戴、词性错乱、或明显不是该词在例句语境下的常用义，且修正释义是该语境下最常用、准确的简体中文义项；\n" +
    "- 【例句】原译文明显错译、译反、漏译主句、或与原文语义矛盾，且修正译文忠实、完整、通顺，信息量不少于原译文。\n" +
    "drop 只要有任一情况：\n" +
    "- 原始值与修正值都说得通：同义表述、风格差异、简繁或用词偏好、修正只是换个说法；\n" +
    "- 原始值正确或基本可接受（义项不够完整、不够贴切但不算错 → drop）；\n" +
    "- 修正值本身有问题：含英文或拼音、译文更糟或丢失原文信息、译文与原文不符、表达不通；\n" +
    "- 证据不足、拿不准 → drop。\n" +
    "严格输出 JSON 数组，每行一个元素：{\"i\":N,\"keep\":true} 或 {\"i\":N,\"keep\":false,\"why\":\"不超过20字的原因\"}。不要输出其它内容。\n\n" + lines;
}

/* ---------- main ---------- */

async function main() {
  U.log("== 10 二轮保守复核 en-calib.json（model=" + MODEL + "，batch " + BATCH + "，并发 " + CONC + "）==");
  const cache = fs.existsSync(CACHE_FILE)
    ? JSON.parse(U.readText(CACHE_FILE))
    : { verdicts: {} };
  if (!cache.verdicts) cache.verdicts = {};

  const { calib, units } = buildUnits();
  const pre = units.filter(u => u.pre);
  const need = units.filter(u => !u.pre).filter(u => {
    const k = strHash(JSON.stringify([u.kind, u.t || "", u.origM || "", u.exT || "", u.origTr || "", u.fixM || u.fixTr]));
    u.k = k;
    return !cache.verdicts[k];
  });
  U.log("待复核 " + units.length + " 条：预检剔除 " + pre.length + "，需模型 " + need.length +
    "（缓存命中 " + (units.filter(u => !u.pre).length - need.length) + "），" + Math.ceil(need.length / BATCH) + " 批");

  let failedBatches = 0;
  const batches = chunksOf(need, BATCH);
  await runPool(batches, async (batch, bi) => {
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const arr = await chat(reviewPrompt(batch));
        if (!Array.isArray(arr)) throw new Error("返回不是数组");
        const seen = new Set();
        for (const o of arr) {
          const idx = parseInt(o.i, 10) - 1;
          if (!(idx >= 0 && idx < batch.length)) continue;
          if (typeof o.keep !== "boolean") continue;
          const u = batch[idx];
          cache.verdicts[u.k] = { keep: o.keep, why: String(o.why || "").slice(0, 40) };
          seen.add(idx);
        }
        if (seen.size === batch.length) break;
        if (attempt === 1 && seen.size < batch.length) {
          throw new Error("模型漏答 " + (batch.length - seen.size) + " 行");
        }
      }
      if ((bi + 1) % 5 === 0 || bi + 1 === batches.length) {
        U.writeJson(CACHE_FILE, cache, false);
        U.log("  已完成 " + (bi + 1) + " / " + batches.length + " 批");
      }
    } catch (e) {
      failedBatches++;
      U.log("  批次 " + (bi + 1) + " 失败：" + e.message);
    }
  }, CONC);
  U.writeJson(CACHE_FILE, cache, false);
  if (failedBatches) {
    U.log("有 " + failedBatches + " 批失败，中止（不更新 en-calib.json）。修正缓存后可重跑续判。");
    process.exit(1);
  }

  /* 汇总判定并原地过滤 en-calib.json */
  const out = { words: {}, examples: {} };
  const dropReason = {};
  let kept = 0, dropped = 0;
  for (const u of units) {
    let keep, why;
    if (u.pre) { keep = false; why = u.pre; }
    else {
      const v = cache.verdicts[u.k];
      if (!v) { keep = false; why = "无复核结果"; }
      else { keep = v.keep; why = v.why || ""; }
    }
    if (keep) {
      kept++;
      if (u.kind === "word") out.words[u.t] = { m: u.fixM };
      else out.examples[u.exT] = { tr: u.fixTr };
    } else {
      dropped++;
      const key = u.pre ? "预检:" + u.pre : (why || "未说明");
      dropReason[key] = (dropReason[key] || 0) + 1;
      U.log("  [drop] " + (u.kind === "word" ? "词 " + u.t + "：" + u.origM + " → " + u.fixM
        : "例 " + u.exT.slice(0, 40) + "：") + " ｜ " + why);
    }
  }
  const sortKeys = o => { const r = {}; for (const k of Object.keys(o).sort()) r[k] = o[k]; return r; };
  out.words = sortKeys(out.words);
  out.examples = sortKeys(out.examples);
  U.writeJson(CALIB_FILE, out);

  U.log("== 统计 ==");
  U.log("复核总数 " + units.length + "（词 " + Object.keys(calib.words || {}).length + "，例句 " + Object.keys(calib.examples || {}).length + "）");
  U.log("保留 " + kept + "，剔除 " + dropped);
  U.log("剔除原因分布：" + JSON.stringify(dropReason, null, 2));
  U.log("→ " + CALIB_FILE + "：words " + Object.keys(out.words).length + " 条，examples " + Object.keys(out.examples).length + " 条");
}

main().catch(e => { console.error(e); process.exit(1); });
