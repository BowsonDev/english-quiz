// 每次改版，請務必修改這裡的版號 (例如 v3 -> v4)
const CACHE_NAME = 'eng-quiz-v4.1';
const ASSETS_TO_CACHE = [
    './',
    './style.css',
    './script.js',
    './icon.png',
    // 注意：這裡不一定要放 questions JSON，讓它們走網路優先策略
];

// 1. 安裝 (Install)
self.addEventListener('install', event => {
    self.skipWaiting(); // 強制跳過等待，立即啟用新版 SW
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // 這裡我們把 index.html 也加進去，作為離線時的備案
                return cache.addAll([...ASSETS_TO_CACHE, './index.html']);
            })
    );
});

// 2. 啟用 (Activate) - 清除舊快取
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim()); // 立即接管頁面
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. 攔截請求 (Fetch) - 混合策略
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 策略 A: HTML 頁面 (入口檔) -> 採用 Network First (網路優先)
    // 這樣確保每次重新整理，都會去網路上抓最新的 index.html
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // 如果網路抓取成功，順便把新的 HTML 存入快取，下次離線可以用
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // 沒網路時，才回傳快取裡的 index.html
                    return caches.match('./index.html');
                })
        );
        return;
    }

    // 策略 B: JSON 題庫 -> Network First (網路優先)
    if (url.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 策略 C: 靜態資源 (CSS, JS, 圖片) -> Cache First (快取優先)
    // 這些檔案比較重，且檔名不常變，適合用快取加速
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request);
            })
    );
});