/* game.js — Norah's Big Vacation
   Vertical slice: Chapter 5 — The London Eye.
   Painted background + transparent SVG overlay (hotspots + characters) + music.
   Tap-only, fully offline. Architected so more chapters slot in later. */
(function () {
  'use strict';

  var art = window.NVart, audio = window.NVaudio, assets = window.NVassets || {};

  var CHAPTER_ID = 'londoneye';

  // ── All 12 chapters (only 'londoneye' is playable in this slice) ──
  var CHAPTERS = [
    { id: 'pups',      name: 'Goodbye Pups',   glyph: '🐾' },
    { id: 'airport',   name: 'To the Airport', glyph: '🚗' },
    { id: 'nyc',       name: 'Fly to NYC',     glyph: '✈️' },
    { id: 'overnight', name: 'Night Flight',   glyph: '🌙' },
    { id: 'londoneye', name: 'London Eye',     glyph: '🎡' },
    { id: 'train',     name: "Daddo's Train",  glyph: '🚆' },
    { id: 'london',    name: 'London & Mommo', glyph: '🚌' },
    { id: 'castle',    name: 'Leeds Castle',   glyph: '👑' },
    { id: 'chunnel',   name: 'The Chunnel',    glyph: '🚄' },
    { id: 'eiffel',    name: 'Eiffel Tower',   glyph: '🗼' },
    { id: 'treats',    name: 'Croissants',     glyph: '🥐' },
    { id: 'home',      name: 'Fly Home',       glyph: '🏠' }
  ];

  var SIGHTS = [
    { id: 'sight-bigben', label: 'Big Ben',   icon: '🕰️' },
    { id: 'sight-hotel',  label: 'Our hotel', icon: '🏨' },
    { id: 'sight-boat',   label: 'River boat', icon: '⛵' }
  ];

  // ── Persisted progress ──
  var save = { stamps: {}, camiles: {} };
  try {
    var raw = localStorage.getItem('nv_save');
    if (raw) save = JSON.parse(raw);
    save.stamps = save.stamps || {}; save.camiles = save.camiles || {};
  } catch (e) { /* fresh start */ }
  function persist() { try { localStorage.setItem('nv_save', JSON.stringify(save)); } catch (e) { /* ignore */ } }

  // ── DOM refs ──
  var stage = document.getElementById('stage');
  var sceneEl = document.getElementById('scene');
  var narration = document.getElementById('narration');
  var actionBtn = document.getElementById('actionBtn');
  var sightsBox = document.getElementById('sights');
  var progressPill = document.getElementById('progressPill');
  var app = document.getElementById('app');

  // ── Chapter state ──
  var phase = 'intro';   // intro -> board -> ride -> spot -> done
  var spotted = {};
  var camileFound = !!save.camiles[CHAPTER_ID];

  // ── Helpers ──
  function say(t) { narration.style.display = ''; narration.innerHTML = t; }
  function hideSay() { narration.style.display = 'none'; }
  function show(id) { var el = document.getElementById(id); if (el) el.style.display = ''; }
  function hide(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }

  function setAction(label, fn) {
    if (!label) { actionBtn.style.display = 'none'; actionBtn.onclick = null; return; }
    actionBtn.style.display = '';
    actionBtn.textContent = label;
    actionBtn.onclick = function () { audio.unlock(); audio.play('tap'); fn(); };
  }

  function toast(el, text, color) {
    var r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    t.style.color = color || '#fff';
    t.style.left = (r.left - a.left + r.width / 2 - 20) + 'px';
    t.style.top = (r.top - a.top - 6) + 'px';
    app.appendChild(t);
    setTimeout(function () { t.remove(); }, 1000);
  }

  function updateProgress() {
    var n = 0; for (var k in spotted) if (spotted[k]) n++;
    progressPill.textContent = 'Sights ' + n + '/' + SIGHTS.length + '  •  ' + (camileFound ? 'Camile ✓' : 'Camile …');
  }

  // ── Phases ──
  function enterIntro() {
    phase = 'intro';
    say("Our hotel is right next to the giant <b>London Eye!</b> 🎡<br>Let's ride it with Camile!");
    setAction("Let's go!", enterBoard);
  }

  function enterBoard() {
    phase = 'board';
    say("Tap the giant <b>London Eye</b> to ride up high! 🎡");
    setAction(null);
    show('mark-ride');
    var wheel = document.getElementById('ride-wheel');
    wheel.onclick = function () {
      if (phase !== 'board') return;
      hide('mark-ride');
      wheel.onclick = null;
      audio.play('collect');
      enterRide();
    };
  }

  function enterRide() {
    phase = 'ride';
    say("Wheee! Up we go! 🎡☁️");
    audio.play('spin');
    // zoom toward the top of the wheel, then settle back — works for any bg
    sceneEl.style.transformOrigin = '46% 36%';
    sceneEl.style.transform = 'scale(1.85)';
    // characters are "in the pod" now — fade them from the embankment
    hide('groundPeople');
    setTimeout(function () { sceneEl.style.transform = 'scale(1)'; }, 1300);
    setTimeout(enterSpot, 2300);
  }

  function enterSpot() {
    if (phase === 'spot') return;
    phase = 'spot';
    say("Wow, look at the view! 🌆<br><b>Tap the London sights</b> you can see!");
    buildSightsList();
    SIGHTS.forEach(function (s) {
      show('mark-' + s.id);
      var el = document.getElementById(s.id);
      if (!el) return;
      el.onclick = function () {
        if (spotted[s.id]) return;
        spotted[s.id] = true;
        hide('mark-' + s.id);
        audio.play('collect');
        toast(el, s.icon + ' ' + s.label + '!', '#fff');
        markSight(s.id);
        updateProgress();
        checkComplete();
      };
    });
    updateProgress();
  }

  function buildSightsList() {
    sightsBox.style.display = '';
    sightsBox.innerHTML = '';
    SIGHTS.forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'sight-item' + (spotted[s.id] ? ' done' : '');
      d.id = 'li-' + s.id;
      d.innerHTML = '<span class="tick">' + (spotted[s.id] ? '✓' : '') + '</span><span>' + s.icon + ' ' + s.label + '</span>';
      sightsBox.appendChild(d);
    });
  }
  function markSight(id) {
    var li = document.getElementById('li-' + id);
    if (li) { li.classList.add('done'); li.querySelector('.tick').textContent = '✓'; }
  }

  function checkComplete() {
    var all = SIGHTS.every(function (s) { return spotted[s.id]; });
    if (all && phase !== 'done') {
      phase = 'done';
      if (camileFound) { say("You spotted everything! 🎉"); setTimeout(completeChapter, 700); }
      else { say("Great spotting! 🎉 Pssst… can you still find the <b>hidden Camile</b>? 🔎"); setAction('Finish chapter', completeChapter); }
    }
  }

  // ── Hidden Camile (findable any time) ──
  function wireHiddenCamile() {
    var hc = document.getElementById('hiddenCamile');
    if (!hc) return;
    if (camileFound) hc.classList.add('spotted');
    hc.onclick = function () {
      if (camileFound) return;
      camileFound = true;
      save.camiles[CHAPTER_ID] = true; persist();
      hc.classList.add('spotted');
      audio.play('found');
      toast(hc, '✨ Found Camile!', '#ffd25a');
      updateProgress();
      if (phase === 'done') { setAction(null); completeChapter(); }
    };
  }

  function completeChapter() {
    setAction(null);
    hideSay();
    sightsBox.style.display = 'none';
    save.stamps[CHAPTER_ID] = true; persist();
    audio.play('stamp');
    setTimeout(function () { audio.play('win'); }, 250);
    showCelebrate();
  }

  // ── Passport overlay ──
  function renderPassport() {
    var grid = document.getElementById('stampGrid');
    grid.innerHTML = '';
    CHAPTERS.forEach(function (c) {
      var earned = !!save.stamps[c.id];
      var slot = document.createElement('div');
      slot.className = 'stamp-slot' + (earned ? ' earned' : '');
      slot.innerHTML = '<div class="glyph">' + c.glyph + '</div><div>' + c.name + '</div>';
      grid.appendChild(slot);
    });
  }
  function openPassport() { renderPassport(); document.getElementById('passport').style.display = 'flex'; }
  function closePassport() { document.getElementById('passport').style.display = 'none'; }

  // ── Celebration overlay ──
  function showCelebrate() {
    document.getElementById('celebrateStamp').textContent = '🎡';
    document.getElementById('celebrateTitle').textContent = 'London Eye — Done!';
    var extra = camileFound ? ' and found the hidden Camile' : '';
    document.getElementById('celebrateText').innerHTML =
      'Norah rode the London Eye, spotted Big Ben, the hotel and a river boat' + extra + '. 🎉<br>You earned the <b>Ferris-wheel stamp!</b>';
    var nextBtn = document.getElementById('celebrateNext');
    nextBtn.textContent = 'More chapters soon…';
    nextBtn.onclick = function () { audio.play('tap'); openPassport(); document.getElementById('celebrate').style.display = 'none'; };
    document.getElementById('celebrate').style.display = 'flex';
  }

  // ── Mute button ──
  function refreshMute() { document.getElementById('muteBtn').textContent = audio.isMuted() ? '🔇' : '🔊'; }

  // ── Boot ──
  function boot() {
    stage.innerHTML = art.scene();

    // background + music for this chapter
    var A = assets[CHAPTER_ID] || {};
    if (A.bg) document.getElementById('bg').style.backgroundImage = 'url("' + A.bg + '")';
    if (A.music) audio.setMusic(A.music); // plays on first user gesture (autoplay policy)

    wireHiddenCamile();
    updateProgress();

    document.getElementById('passportBtn').onclick = function () { audio.unlock(); audio.play('tap'); openPassport(); };
    document.getElementById('closePassport').onclick = function () { audio.play('tap'); closePassport(); };
    document.getElementById('celebratePassport').onclick = function () { audio.play('tap'); document.getElementById('celebrate').style.display = 'none'; openPassport(); };
    document.getElementById('muteBtn').onclick = function () { audio.toggleMute(); refreshMute(); };
    refreshMute();

    enterIntro();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
