// 每次改版，記得更新這裡的版本號 (例如 v2 -> v3)
const CACHE_NAME = 'eng-quiz-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './questions_g1_be.json',      // 記得把你所有的 JSON 檔名都加進來
    './questions_g2_past.json',
    './questions_g3_perfect.json',
    './icon.png'
];

// 1. 安裝：快取檔案
self.addEventListener('install', event => {
    // 【強制更新關鍵 1】跳過等待期，直接安裝新版 SW
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 2. 啟用：清除舊快取
self.addEventListener('activate', event => {
    // 【強制更新關鍵 2】立即接管所有頁面，不用等下次重開
    event.waitUntil(clients.claim());

    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. 攔截請求 (網路優先策略 - 避免 JSON 卡快取)
// 這裡我也稍微修改了策略：如果是抓 JSON 資料，盡量優先走網路
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // 如果是 JSON 檔，採取「網路優先」策略 (確保題目是最新的)
    if (requestUrl.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request)) // 沒網路才讀快取
        );
        return;
    }

    // 其他靜態檔案 (HTML, CSS, JS) 维持「快取優先」
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request);
            })
    );
});