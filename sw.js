/* Lingua · Service Worker（网络优先，离线时回退缓存） */
const CACHE = "lingua-v4";
const ASSETS = [
  "./", "./index.html", "./icon.svg", "./manifest.webmanifest", "./css/app.css",
  "./js/exercise.js", "./js/data.js",
  "./js/store.js", "./js/speech.js", "./js/views.js", "./js/app.js"
];
/* 懒加载数据：data/summary.json、js/data-{lang}.js 与 data/{lang}/{level}.json
   都按「网络优先」在运行时自动缓存（见下方 fetch 处理） */

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
