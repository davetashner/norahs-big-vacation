/* game.js — Norah's Big Vacation
   A 12-chapter, tap-only, fully-offline explore-and-collect storybook.
   Each chapter = painted background + characters + tap-to-collect items +
   a hidden Camile + a passport stamp, then on to the next chapter. */
(function () {
  'use strict';

  var art = window.NVart, audio = window.NVaudio, assets = window.NVassets || {};
  var byId = function (id) { return document.getElementById(id); };

  // ── Chapter data (all 12). bg/music come from assets.js by id. ──
  // items: emoji tokens to tap (x,y in 400×700). camile: hidden badge spot.
  // chars: sprites along the bottom (feet at y, default 668).
  var CHAPTERS = [
    { id: 'pups', name: 'Goodbye Pups', glyph: '🐾',
      intro: "Time for the big trip! First, give <b>Penny</b> and <b>Obi</b> lots of love. 🐾",
      task: 'paw prints', icon: '🐾',
      items: [{ icon: '🐾', x: 70, y: 170 }, { icon: '🐾', x: 300, y: 150 }, { icon: '🐾', x: 120, y: 300 }, { icon: '🐾', x: 330, y: 320 }],
      camile: { x: 210, y: 250 },
      chars: [{ name: 'norah', x: 120 }, { name: 'penny', x: 215, y: 676 }, { name: 'obi', x: 300, y: 676 }] },

    { id: 'airport', name: 'To the Airport', glyph: '🚗',
      intro: "We made it to the airport with Camile! Find our <b>suitcases</b>. 🧳",
      task: 'suitcases', icon: '🧳',
      items: [{ icon: '🧳', x: 80, y: 150 }, { icon: '🧳', x: 300, y: 160 }, { icon: '🧳', x: 60, y: 300 }, { icon: '🧳', x: 320, y: 300 }],
      camile: { x: 200, y: 230 },
      chars: [{ name: 'mommo', x: 90 }, { name: 'norah', x: 150 }, { name: 'daddo', x: 215 }] },

    { id: 'nyc', name: 'Fly to New York', glyph: '✈️',
      intro: "Up, up and away to New York! ✈️ Pop the fluffy <b>clouds</b>.",
      task: 'clouds', icon: '☁️',
      items: [{ icon: '☁️', x: 70, y: 130 }, { icon: '☁️', x: 200, y: 110 }, { icon: '☁️', x: 330, y: 150 }, { icon: '☁️', x: 120, y: 260 }, { icon: '☁️', x: 300, y: 280 }],
      camile: { x: 150, y: 200 },
      chars: [{ name: 'norah', x: 175 }, { name: 'camile', x: 225 }] },

    { id: 'overnight', name: 'Night Flight', glyph: '🌙',
      intro: "A long sleepy flight to London. 🌙 Count the twinkly <b>stars</b>.",
      task: 'stars', icon: '⭐',
      items: [{ icon: '⭐', x: 60, y: 120 }, { icon: '⭐', x: 150, y: 100 }, { icon: '⭐', x: 250, y: 130 }, { icon: '⭐', x: 330, y: 180 }, { icon: '⭐', x: 100, y: 250 }, { icon: '⭐', x: 285, y: 260 }],
      camile: { x: 200, y: 330 },
      chars: [{ name: 'norah', x: 175 }, { name: 'camile', x: 228 }] },

    { id: 'londoneye', name: 'The London Eye', glyph: '🎡', ride: true,
      intro: "Our hotel is right by the giant <b>London Eye!</b> 🎡 Tap it to ride up high!",
      task: 'London sights', icon: '🎡',
      items: [{ icon: '🕰️', x: 76, y: 425 }, { icon: '🏨', x: 344, y: 432 }, { icon: '⛵', x: 60, y: 485 }],
      camile: { x: 348, y: 300 },
      chars: [{ name: 'mommo', x: 96 }, { name: 'norah', x: 152 }, { name: 'camile', x: 202 }] },

    { id: 'train', name: "Daddo's Train", glyph: '🚆',
      intro: "Daddo has to take the train to work for a few days. 🚆 Blow him <b>goodbye kisses!</b>",
      task: 'kisses', icon: '💛',
      items: [{ icon: '💛', x: 80, y: 150 }, { icon: '💛', x: 300, y: 150 }, { icon: '💛', x: 130, y: 290 }, { icon: '💛', x: 320, y: 300 }],
      camile: { x: 200, y: 230 },
      chars: [{ name: 'daddo', x: 85 }, { name: 'norah', x: 255 }, { name: 'mommo', x: 315 }] },

    { id: 'london', name: 'London & Mommo', glyph: '🚌',
      intro: "Just Norah and Mommo now, exploring London! Find the <b>red buses</b>. 🚌",
      task: 'red buses', icon: '🚌',
      items: [{ icon: '🚌', x: 70, y: 140 }, { icon: '🚌', x: 310, y: 150 }, { icon: '🚌', x: 110, y: 290 }, { icon: '🚌', x: 330, y: 300 }],
      camile: { x: 200, y: 220 },
      chars: [{ name: 'mommo', x: 150 }, { name: 'norah', x: 215 }] },

    { id: 'castle', name: 'Leeds Castle', glyph: '👑',
      intro: "A sleepover in a real castle on a lake! 👑 Count the <b>swans</b> on the moat.",
      task: 'swans', icon: '🦢',
      items: [{ icon: '🦢', x: 70, y: 170 }, { icon: '🦢', x: 200, y: 150 }, { icon: '🦢', x: 330, y: 175 }, { icon: '🦢', x: 120, y: 300 }, { icon: '🦢', x: 300, y: 300 }],
      camile: { x: 200, y: 240 },
      chars: [{ name: 'norah', x: 150 }, { name: 'mommo', x: 220 }] },

    { id: 'chunnel', name: 'The Chunnel', glyph: '🚄',
      intro: "Zoom under the sea to France on the Chunnel train! 🚄 Tap the <b>tunnel lights</b>.",
      task: 'tunnel lights', icon: '💡',
      items: [{ icon: '💡', x: 60, y: 150 }, { icon: '💡', x: 160, y: 120 }, { icon: '💡', x: 260, y: 140 }, { icon: '💡', x: 330, y: 200 }, { icon: '💡', x: 120, y: 280 }],
      camile: { x: 300, y: 300 },
      chars: [{ name: 'norah', x: 170 }, { name: 'mommo', x: 235 }, { name: 'camile', x: 288 }] },

    { id: 'eiffel', name: 'Eiffel Tower', glyph: '🗼',
      intro: "Bonjour, Paris! 🗼 Make the <b>Eiffel Tower sparkle</b> — tap the sparkles!",
      task: 'sparkles', icon: '✨',
      items: [{ icon: '✨', x: 60, y: 120 }, { icon: '✨', x: 150, y: 100 }, { icon: '✨', x: 250, y: 110 }, { icon: '✨', x: 330, y: 160 }, { icon: '✨', x: 100, y: 250 }, { icon: '✨', x: 290, y: 250 }],
      camile: { x: 200, y: 200 },
      chars: [{ name: 'mommo', x: 110 }, { name: 'norah', x: 175 }, { name: 'camile', x: 225 }] },

    { id: 'treats', name: 'Croissants', glyph: '🥐',
      intro: "A Paris treat! 🥐 Collect the <b>croissants and macarons</b>.",
      task: 'treats', icon: '🥐',
      items: [{ icon: '🥐', x: 70, y: 140 }, { icon: '🧁', x: 170, y: 130 }, { icon: '🥐', x: 280, y: 150 }, { icon: '🧁', x: 330, y: 220 }, { icon: '🥐', x: 110, y: 300 }, { icon: '🧁', x: 300, y: 300 }],
      camile: { x: 210, y: 230 },
      chars: [{ name: 'norah', x: 150 }, { name: 'mommo', x: 225 }] },

    { id: 'home', name: 'Fly Home', glyph: '🏠',
      intro: "The long way home to Penny and Obi! 🏠 Give them <b>welcome-home cuddles!</b>",
      task: 'cuddles', icon: '🐾',
      items: [{ icon: '🐾', x: 70, y: 170 }, { icon: '🐾', x: 300, y: 150 }, { icon: '🐾', x: 120, y: 300 }, { icon: '🐾', x: 330, y: 320 }],
      camile: { x: 200, y: 240 },
      chars: [{ name: 'norah', x: 120 }, { name: 'penny', x: 215, y: 676 }, { name: 'obi', x: 300, y: 676 }] }
  ];
  var idx = function (id) { for (var i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].id === id) return i; return -1; };

  // ── Persisted progress ──
  var save = { stamps: {}, camiles: {} };
  try {
    var raw = localStorage.getItem('nv_save');
    if (raw) save = JSON.parse(raw);
    save.stamps = save.stamps || {}; save.camiles = save.camiles || {};
  } catch (e) { /* fresh */ }
  function persist() { try { localStorage.setItem('nv_save', JSON.stringify(save)); } catch (e) {} }

  // ── DOM ──
  var stage = byId('stage'), sceneEl = byId('scene'), narration = byId('narration');
  var actionBtn = byId('actionBtn'), sightsBox = byId('sights'), progressPill = byId('progressPill'), app = byId('app');

  // ── Per-chapter state ──
  var cur = 0;            // current chapter index
  var ch = null;          // current chapter config
  var phase = 'intro';    // intro -> (ride) -> explore -> done
  var collected = 0, total = 0, camileFound = false;

  // ── Player movement (Norah walks; Camile follows) ──
  var WALK = 2.6;                  // viewBox units per frame
  var GROUND_Y = 662;             // default feet line
  var canMove = false;
  var tick = 0;
  var player = { x: 200, y: GROUND_Y, tx: 200, ty: GROUND_Y, face: 1, moving: false };
  var cami = { x: 240, y: GROUND_Y };
  var itemsDone = [];             // collected flags per item index

  // Camile walk-cycle frames (idle vs two strides), swapped while she moves
  var SPR = 'assets/images/sprites/';
  var CAMI_IDLE = SPR + 'char-camile.png';
  var CAMI_WALK = [SPR + 'char-camile-walk-a.png', SPR + 'char-camile-walk-b.png'];
  var camiImg = null, camiHref = '';

  // ── Helpers ──
  function say(t) { narration.style.display = ''; narration.innerHTML = t; }
  function hideSay() { narration.style.display = 'none'; }
  function show(id) { var el = byId(id); if (el) el.style.display = ''; }
  function hide(id) { var el = byId(id); if (el) el.style.display = 'none'; }
  function setAction(label, fn) {
    if (!label) { actionBtn.style.display = 'none'; actionBtn.onclick = null; return; }
    actionBtn.style.display = ''; actionBtn.textContent = label;
    actionBtn.onclick = function () { audio.unlock(); audio.play('tap'); fn(); };
  }
  function toast(el, text, color) {
    var r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = text;
    t.style.color = color || '#fff';
    t.style.left = (r.left - a.left + r.width / 2 - 24) + 'px';
    t.style.top = (r.top - a.top - 6) + 'px';
    app.appendChild(t); setTimeout(function () { t.remove(); }, 1000);
  }
  function updateProgress() {
    progressPill.textContent = 'Ch ' + (cur + 1) + '/' + CHAPTERS.length
      + '  •  ' + collected + '/' + total + ' ' + ch.icon
      + '  •  ' + (camileFound ? 'Camile ✓' : 'Camile …');
  }

  // Swap the painted background, waiting until the image is decoded.
  function setSceneBg(url, done) {
    var bg = byId('bg');
    if (!url) { bg.style.backgroundImage = 'none'; if (done) done(); return; }
    var img = new Image();
    img.onload = img.onerror = function () { bg.style.backgroundImage = 'url("' + url + '")'; if (done) done(); };
    img.src = url;
  }
  function hideLoading() {
    var l = byId('loading');
    if (l && !l.classList.contains('hide')) {
      l.classList.add('hide');
      setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l); }, 600);
    }
  }
  function preloadNext() {
    var n = CHAPTERS[cur + 1]; if (!n) return;
    var a = assets[n.id]; if (a && a.bg) { var im = new Image(); im.src = a.bg; }
  }

  // ── Load a chapter ──
  function loadChapter(i) {
    cur = Math.max(0, Math.min(CHAPTERS.length - 1, i));
    ch = CHAPTERS[cur];
    phase = 'intro';
    collected = 0; total = (ch.items || []).length;
    camileFound = !!save.camiles[ch.id];
    sceneEl.style.transform = 'scale(1)';
    sceneEl.style.opacity = '0';          // fade in once the bg is ready
    sightsBox.style.display = 'none';

    stage.innerHTML = art.scene(ch);

    var A = assets[ch.id] || {};
    audio.setMusic(A.music || null);
    setSceneBg(A.bg, function () {
      requestAnimationFrame(function () { sceneEl.style.opacity = '1'; });
      hideLoading();
      preloadNext();
    });

    // init the playable characters at the bottom (Norah at her chars-entry x)
    canMove = false;
    itemsDone = (ch.items || []).map(function () { return false; });
    var nEntry = (ch.chars || []).filter(function (c) { return c.name === 'norah'; })[0];
    player.x = nEntry ? nEntry.x : 200; player.y = GROUND_Y;
    player.tx = player.x; player.ty = player.y; player.face = 1; player.moving = false;
    cami.x = player.x - 40; cami.y = player.y;
    placeMover('m-norah', player.x, player.y, 1);
    placeMover('m-camile', cami.x, cami.y, 1);
    var cg = byId('m-camile'); camiImg = cg ? cg.querySelector('image') : null; camiHref = '';

    wireHiddenCamile();
    updateProgress();

    say('<b>Chapter ' + (cur + 1) + ': ' + ch.name + '</b> ' + ch.glyph + '<br>' + ch.intro);
    setAction("Let's go!", ch.ride ? doRide : beginExplore);
  }

  // ── Optional "ride" beat (London Eye) ──
  function doRide() {
    phase = 'ride';
    show('mark-ride');
    say("Tap the giant <b>London Eye</b> to ride up high! 🎡");
    setAction(null);
    var wheel = byId('ride-wheel');
    wheel.onclick = function () {
      if (phase !== 'ride') return;
      wheel.onclick = null; hide('mark-ride'); audio.play('collect');
      say("Wheee! Up we go! 🎡☁️"); audio.play('spin');
      sceneEl.style.transformOrigin = '46% 36%';
      sceneEl.style.transform = 'scale(1.85)';
      setTimeout(function () { sceneEl.style.transform = 'scale(1)'; }, 1300);
      setTimeout(function () { hide('ride-wheel'); beginExplore(); }, 2300);
    };
  }

  // ── Explore: walk Norah around to collect ──
  function beginExplore() {
    phase = 'explore';
    canMove = true;
    say('Tap where <b>Norah</b> should walk! 🚶 Walk into the <b>' + ch.task
      + '</b> to collect them, and find the hidden Camile. 🔎');
    updateProgress();
  }

  // hidden Camile is found by walking near it (see checkProximity)
  function wireHiddenCamile() {
    var hc = byId('hiddenCamile');
    if (hc && camileFound) hc.classList.add('spotted');
  }

  function checkComplete() {
    if (phase === 'done') return;
    if (collected >= total && camileFound) {
      phase = 'done';
      say('You found everything! 🎉');
      setTimeout(completeChapter, 650);
    } else if (collected >= total && !camileFound) {
      say('Nice! Now find the <b>hidden Camile</b> 🔎');
    }
  }

  function completeChapter() {
    setAction(null); hideSay();
    save.stamps[ch.id] = true; persist();
    audio.play('stamp');
    setTimeout(function () { audio.play('win'); }, 250);
    showCelebrate();
  }

  // ── Passport ──
  function renderPassport() {
    var grid = byId('stampGrid'); grid.innerHTML = '';
    CHAPTERS.forEach(function (c, i) {
      var earned = !!save.stamps[c.id];
      var slot = document.createElement('div');
      slot.className = 'stamp-slot' + (earned ? ' earned' : '');
      slot.innerHTML = '<div class="glyph">' + c.glyph + '</div><div>' + c.name + '</div>';
      slot.title = 'Play: ' + c.name;
      slot.onclick = function () { audio.play('tap'); closePassport(); loadChapter(i); };
      grid.appendChild(slot);
    });
  }
  function openPassport() { renderPassport(); byId('passport').style.display = 'flex'; }
  function closePassport() { byId('passport').style.display = 'none'; }

  // ── Celebration ──
  function showCelebrate() {
    var last = cur === CHAPTERS.length - 1;
    byId('celebrateStamp').textContent = ch.glyph;
    byId('celebrateTitle').textContent = last ? 'You did it! 🎉' : (ch.name + ' — Done!');
    var done = 0; CHAPTERS.forEach(function (c) { if (save.stamps[c.id]) done++; });
    byId('celebrateText').innerHTML = last
      ? "Norah finished her whole big vacation and earned <b>all " + CHAPTERS.length + " stamps!</b> 🏆 Welcome home!"
      : "You earned the <b>" + ch.name + " stamp!</b> 🎉 (" + done + '/' + CHAPTERS.length + ' stamps)';
    var nextBtn = byId('celebrateNext');
    if (last) {
      nextBtn.textContent = 'See my Passport';
      nextBtn.onclick = function () { audio.play('tap'); byId('celebrate').style.display = 'none'; openPassport(); };
    } else {
      nextBtn.textContent = 'Next: ' + CHAPTERS[cur + 1].name + ' →';
      nextBtn.onclick = function () { audio.play('tap'); byId('celebrate').style.display = 'none'; loadChapter(cur + 1); };
    }
    byId('celebrate').style.display = 'flex';
  }

  // ── Movement engine ──
  // Map a screen tap to viewBox coords (svg uses xMidYMid slice → cover-fit).
  function mapTap(clientX, clientY) {
    var r = stage.getBoundingClientRect();
    var sc = Math.max(r.width / 400, r.height / 700);
    var ox = (r.width - 400 * sc) / 2, oy = (r.height - 700 * sc) / 2;
    return { x: (clientX - r.left - ox) / sc, y: (clientY - r.top - oy) / sc };
  }
  function overlayOpen() {
    return byId('passport').style.display === 'flex' || byId('celebrate').style.display === 'flex';
  }
  function onSceneTap(e) {
    if (!canMove || overlayOpen()) return;
    var pt = (e.touches && e.touches[0]) || e;
    var p = mapTap(pt.clientX, pt.clientY);
    player.tx = Math.max(20, Math.min(380, p.x));
    player.ty = Math.max(120, Math.min(686, p.y));
    audio.unlock();
  }
  // Position a movable character: feet at (x,y), mirrored by `face`, with a walk bob.
  function placeMover(id, x, y, face, bob) {
    var el = byId(id); if (!el) return;
    el.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + (y + (bob || 0)).toFixed(1) + ') scale(' + face + ',1)');
  }
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }

  function checkProximity() {
    var bx = player.x, by = player.y - 45; // Norah's torso
    (ch.items || []).forEach(function (it, i) {
      if (itemsDone[i]) return;
      if (dist(bx, by, it.x, it.y) < 54) {
        itemsDone[i] = true; collected++;
        var el = byId('item-' + i); if (el) el.classList.add('collected');
        audio.play('collect'); if (el) toast(el, '+1', '#fff');
        updateProgress(); checkComplete();
      }
    });
    if (!camileFound && ch.camile && dist(bx, by, ch.camile.x, ch.camile.y) < 54) {
      camileFound = true; save.camiles[ch.id] = true; persist();
      var hc = byId('hiddenCamile'); if (hc) { hc.classList.add('spotted'); toast(hc, '✨ Camile!', '#ffd25a'); }
      audio.play('found'); updateProgress(); checkComplete();
    }
  }

  function loop() {
    tick++;
    if (canMove) {
      // Norah walks toward the tapped target
      var dx = player.tx - player.x, dy = player.ty - player.y, d = Math.sqrt(dx * dx + dy * dy);
      player.moving = d > 2;
      if (player.moving) {
        var step = Math.min(WALK, d);
        player.x += dx / d * step; player.y += dy / d * step;
        if (dx < -0.4) player.face = -1; else if (dx > 0.4) player.face = 1;
      }
      // Camile follows a little behind, on Norah's trailing side
      var ctx = player.x - 34 * player.face, cty = player.y;
      var cdx = ctx - cami.x, cdy = cty - cami.y, cd = Math.sqrt(cdx * cdx + cdy * cdy);
      var caMoving = cd > 6;
      if (caMoving) { var cs = Math.min(WALK * 0.95, cd); cami.x += cdx / cd * cs; cami.y += cdy / cd * cs; }
      var bob = player.moving ? Math.sin(tick * 0.35) * 2.5 : 0;
      var cbob = caMoving ? Math.sin(tick * 0.35 + 1) * 2.5 : 0;
      placeMover('m-norah', player.x, player.y, player.face, bob);
      placeMover('m-camile', cami.x, cami.y, player.face, cbob);
      // animate Camile's walk cycle (idle frame when standing still)
      if (camiImg) {
        var want = caMoving ? CAMI_WALK[Math.floor(tick / 7) % 2] : CAMI_IDLE;
        if (want !== camiHref) { camiImg.setAttribute('href', want); camiHref = want; }
      }
      checkProximity();
    }
    requestAnimationFrame(loop);
  }

  // ── Mute ──
  function refreshMute() { byId('muteBtn').textContent = audio.isMuted() ? '🔇' : '🔊'; }

  // ── Boot ──
  function boot() {
    byId('passportBtn').onclick = function () { audio.unlock(); audio.play('tap'); openPassport(); };
    byId('closePassport').onclick = function () { audio.play('tap'); closePassport(); };
    byId('resetBtn').onclick = function () {
      audio.play('tap');
      if (window.confirm('Start the whole trip over? This clears all your stamps.')) {
        save = { stamps: {}, camiles: {} }; persist();
        closePassport(); loadChapter(0);
      }
    };
    byId('celebratePassport').onclick = function () { audio.play('tap'); byId('celebrate').style.display = 'none'; openPassport(); };
    byId('muteBtn').onclick = function () { audio.toggleMute(); refreshMute(); };
    refreshMute();

    // tap the scene to walk Norah there
    sceneEl.addEventListener('pointerdown', onSceneTap);

    // resume at the first chapter without a stamp
    var start = 0;
    for (var i = 0; i < CHAPTERS.length; i++) { if (!save.stamps[CHAPTERS[i].id]) { start = i; break; } }
    loadChapter(start);
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
