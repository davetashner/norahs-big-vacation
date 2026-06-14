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
  var phase = 'intro';    // intro -> (ride) -> collect -> done
  var collected = 0, total = 0, camileFound = false;

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

  // ── Load a chapter ──
  function loadChapter(i) {
    cur = Math.max(0, Math.min(CHAPTERS.length - 1, i));
    ch = CHAPTERS[cur];
    phase = 'intro';
    collected = 0; total = (ch.items || []).length;
    camileFound = !!save.camiles[ch.id];
    sceneEl.style.transform = 'scale(1)';
    sightsBox.style.display = 'none';

    stage.innerHTML = art.scene(ch);

    var A = assets[ch.id] || {};
    byId('bg').style.backgroundImage = A.bg ? 'url("' + A.bg + '")' : 'none';
    audio.setMusic(A.music || null);

    wireHiddenCamile();
    updateProgress();

    say('<b>Chapter ' + (cur + 1) + ': ' + ch.name + '</b> ' + ch.glyph + '<br>' + ch.intro);
    setAction("Let's go!", ch.ride ? doRide : beginCollect);
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
      setTimeout(function () { hide('ride-wheel'); beginCollect(); }, 2300);
    };
  }

  // ── Collect loop ──
  function beginCollect() {
    phase = 'collect';
    say('Tap the <b>' + total + ' ' + ch.task + '</b>! 🔎 (and find the hidden Camile)');
    (ch.items || []).forEach(function (it, i) {
      var el = byId('item-' + i);
      if (!el) return;
      el.onclick = function () {
        if (el.classList.contains('collected')) return;
        el.classList.add('collected');
        collected++; audio.play('collect');
        toast(el, '+1', '#fff');
        updateProgress(); checkComplete();
      };
    });
    updateProgress();
  }

  function wireHiddenCamile() {
    var hc = byId('hiddenCamile');
    if (!hc) return;
    if (camileFound) hc.classList.add('spotted');
    hc.onclick = function () {
      if (camileFound) return;
      camileFound = true; save.camiles[ch.id] = true; persist();
      hc.classList.add('spotted'); audio.play('found');
      toast(hc, '✨ Camile!', '#ffd25a');
      updateProgress(); checkComplete();
    };
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

  // ── Mute ──
  function refreshMute() { byId('muteBtn').textContent = audio.isMuted() ? '🔇' : '🔊'; }

  // ── Boot ──
  function boot() {
    byId('passportBtn').onclick = function () { audio.unlock(); audio.play('tap'); openPassport(); };
    byId('closePassport').onclick = function () { audio.play('tap'); closePassport(); };
    byId('celebratePassport').onclick = function () { audio.play('tap'); byId('celebrate').style.display = 'none'; openPassport(); };
    byId('muteBtn').onclick = function () { audio.toggleMute(); refreshMute(); };
    refreshMute();

    // resume at the first chapter without a stamp
    var start = 0;
    for (var i = 0; i < CHAPTERS.length; i++) { if (!save.stamps[CHAPTERS[i].id]) { start = i; break; } }
    loadChapter(start);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
