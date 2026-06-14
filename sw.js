/* sw.js — service worker for offline play (essential for a flight).
   Precaches the whole game on first load, then serves stale-while-revalidate
   so it works with zero network and still updates when online. */
var CACHE = 'norahs-vacation-v1';
var ASSETS = [
  './', 'index.html', 'styles.css', 'art.js', 'assets.js', 'audio.js', 'game.js',
  // backgrounds
  'assets/images/chunnel.png',
  'assets/images/county-hall-hotel.png',
  'assets/images/home-richmond.png',
  'assets/images/leeds-castle-day.png',
  'assets/images/leeds-castle-evening.png',
  'assets/images/london-eye-county-hall.png',
  'assets/images/london-train-station.png',
  'assets/images/paris-boulangerie.png',
  'assets/images/paris-eiffel-tower.png',
  'assets/images/plane-ride-night.png',
  'assets/images/plane-ride-nyc.png',
  'assets/images/richmond-airport.png',
  // character sprites
  'assets/images/sprites/char-norah.png',
  'assets/images/sprites/char-camile.png',
  'assets/images/sprites/char-mommo.png',
  'assets/images/sprites/char-daddo.png',
  'assets/images/sprites/char-penny.png',
  'assets/images/sprites/char-obi.png',
  // music
  'assets/music/airport-music.mp3',
  'assets/music/chunnel-adventure.m4a',
  'assets/music/leeds-castle-day.m4a',
  'assets/music/leeds-castle-evening.m4a',
  'assets/music/london-stroll.m4a',
  'assets/music/paris-bakery.m4a',
  'assets/music/paris-eiffel-tower.m4a',
  'assets/music/richmond-home.mp3'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // cache individually so one missing file doesn't fail the whole install
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () { /* skip missing */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type !== 'opaque') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;   // stale-while-revalidate
    })
  );
});
