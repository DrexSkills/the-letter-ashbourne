// Minimal service worker: lets browsers install the game to the home screen
// and keeps a cached copy so it opens even with a weak connection.
const CACHE = 'the-letter-v10';
const FILES = ['./', './index.html', './play.html', './css/style.css', './js/01-core.js', './js/02-characters.js', './js/03-state.js', './js/04-worldmap.js', './js/05-input-audio.js', './js/06-dialogue.js', './js/07-story.js', './js/08-hud-journal.js', './js/09-world.js', './js/10-combat.js', './js/10b-creatures.js', './js/11-scenes.js', './js/12-systems.js', './js/13-atmosphere.js', './js/13b-prologue.js', './js/14-main.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// network first, so updates show up straight away; fall back to the cache offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
