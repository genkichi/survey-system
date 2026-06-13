// ─────────────────────────────────────────
// Service Worker（オフライン対応）
//
// 役割: アプリの構成ファイルをキャッシュし、
//       ネット接続がなくても起動できるようにする。
// ─────────────────────────────────────────

// キャッシュの名前。中身を更新したら末尾の番号（v1 → v2…）を上げる。
// 名前が変わると古いキャッシュは activate 時に破棄され、新しい内容に入れ替わる。
const CACHE_NAME = 'survey-cache-v1';

// 事前にキャッシュしておくファイル一覧。
// './' は index.html を指す（start_url と揃える）。
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール時: 上記ファイルをまとめてキャッシュへ保存する。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // 新しい Service Worker をすぐ有効化する（更新を早く反映するため）。
  self.skipWaiting();
});

// 有効化時: 名前が変わった古いキャッシュを削除する。
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // すぐに既存のページを制御下に置く。
  self.clients.claim();
});

// 取得時: ネットワーク優先（network-first）戦略。
//   1. まずネットから最新を取りに行く（取れたらキャッシュも更新）
//   2. オフライン等で失敗したらキャッシュを返す
// → オンライン時は常に最新、オフライン時もキャッシュで起動できる。
self.addEventListener('fetch', (event) => {
  // GET 以外（将来 POST 等を使う場合）は素通しする。
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 取得成功したらキャッシュを最新へ更新しておく。
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
