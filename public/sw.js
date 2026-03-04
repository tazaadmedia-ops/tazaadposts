// Simple Service Worker for PWA Installation Support
const CACHE_NAME = 'tazaad-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icon-192.png',
    '/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Become available to all pages immediately
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
