/* game.js — Norah's Big Vacation
   Vertical slice: Chapter 5 — The London Eye.
   Tap-only, fully offline. Architected so more chapters slot in later. */
(function () {
  'use strict';

  var art = window.NVart, audio = window.NVaudio;

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
    { id: 'sight-bigben', label: 'Big Ben', icon: '🕰️' },
    { id: 'sight-bus',    label: 'Red bus', icon: '🚌' },
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
  var narration = document.getElementById('narration');
  var actionBtn = document.getElementById('actionBtn');
  var sightsBox = document.getElementById('sights');
  var progressPill = document.getElementById('progressPill');
  var app = document.getElementById('app');

  // ── Chapter state ──
  var phase = 'intro';            // intro -> board -> spin -> spot -> done
  var pods = [], ourPod = null, podPeople = null, spokes = null;
  var rot = 0, targetRot = 0;
  var SPIN_TOTAL = -Math.PI;      // half turn lifts the bottom pod to the top
  var TAPS = 5, tapDelta = SPIN_TOTAL / TAPS;
  var spotted = {};
  var camileFound = !!save.camiles.londoneye;

  // ── Helpers ──
  function say(text) { narration.style.display = ''; narration.innerHTML = text; }
  function hideSay() { narration.style.display = 'none'; }

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
    var parts = ['Sights ' + n + '/' + SIGHTS.length];
    parts.push(camileFound ? 'Camile ✓' : 'Camile …');
    progressPill.textContent = parts.join('  •  ');
  }

  // ── Wheel animation ──
  function podAngle(i) { return Math.PI / 2 + (i / art.POD_COUNT) * Math.PI * 2 + rot; }

  function layoutPods() {
    var W = art.WHEEL;
    for (var i = 0; i < pods.length; i++) {
      var a = podAngle(i);
      var x = W.cx + W.r * Math.cos(a), y = W.cy + W.r * Math.sin(a);
      pods[i].setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
    }
    if (spokes) spokes.setAttribute('transform', 'rotate(' + (rot * 180 / Math.PI).toFixed(1) + ' ' + W.cx + ' ' + W.cy + ')');
  }

  function applyRise() {
    var f = Math.min(1, Math.max(0, rot / SPIN_TOTAL)); // 0 at bottom -> 1 at top
    var starsEl = document.getElementById('stars');
    var sunEl = document.getElementById('sunGlow');
    if (starsEl) starsEl.setAttribute('opacity', (f * 0.9).toFixed(2));
    if (sunEl) sunEl.setAttribute('opacity', (0.9 * (1 - f)).toFixed(2));
  }

  function tick() {
    rot += (targetRot - rot) * 0.12;
    layoutPods();
    applyRise();
    // arrival at the top
    if (phase === 'spin' && Math.abs(targetRot - SPIN_TOTAL) < 0.001 && Math.abs(rot - SPIN_TOTAL) < 0.02) {
      rot = SPIN_TOTAL; layoutPods(); applyRise();
      enterSpot();
    }
    requestAnimationFrame(tick);
  }

  // ── Phases ──
  function enterIntro() {
    phase = 'intro';
    say("Our hotel is right next to the giant <b>London Eye!</b> 🎡<br>Let's ride it with Camile!");
    setAction("Let's go!", enterBoard);
  }

  function enterBoard() {
    phase = 'board';
    say("Tap the <b>glowing pod</b> to climb aboard!");
    setAction(null);
    ourPod.classList.add('hotspot', 'pulse');
    ourPod.style.cursor = 'pointer';
    ourPod.onclick = function () {
      audio.play('collect');
      ourPod.classList.remove('pulse');
      ourPod.onclick = null;
      // hide the people on the ground, show them inside the pod
      var gp = document.getElementById('groundPeople');
      if (gp) gp.style.display = 'none';
      if (podPeople) podPeople.style.display = '';
      enterSpin();
    };
  }

  var spinTaps = 0;
  function enterSpin() {
    phase = 'spin';
    spinTaps = 0;
    say("All aboard! 🎡 <b>Tap the wheel</b> to ride up high!");
    var wheelEl = document.getElementById('wheel');
    wheelEl.classList.add('hotspot');
    wheelEl.style.cursor = 'pointer';
    wheelEl.onclick = function () {
      if (phase !== 'spin') return;
      audio.play('spin');
      spinTaps++;
      targetRot = Math.max(SPIN_TOTAL, targetRot + tapDelta);
      if (spinTaps < TAPS) say("Up we go! 🎡 Keep tapping… (" + spinTaps + "/" + TAPS + ")");
      else say("Almost at the top! ☁️");
    };
  }

  function enterSpot() {
    if (phase === 'spot') return;
    phase = 'spot';
    var wheelEl = document.getElementById('wheel');
    if (wheelEl) { wheelEl.onclick = null; wheelEl.style.cursor = ''; }
    say("Wow, look how high! 🌆<br><b>Tap the London sights</b> you can see!");
    buildSightsList();
    // make each sight tappable
    SIGHTS.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      el.classList.add('pulse');
      el.onclick = function () {
        if (spotted[s.id]) return;
        spotted[s.id] = true;
        el.classList.remove('pulse');
        el.classList.add('spotted');
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
      if (camileFound) say("You spotted everything! 🎉");
      else say("Great spotting! 🎉 Pssst… can you still find the <b>hidden Camile</b>? 🔎");
      setTimeout(completeChapter, camileFound ? 700 : 250);
      if (!camileFound) setAction('Finish chapter', completeChapter);
    }
  }

  // ── Hidden Camile (findable any time) ──
  function wireHiddenCamile() {
    var hc = document.getElementById('hiddenCamile');
    if (!hc) return;
    if (camileFound) { hc.style.display = ''; hc.classList.add('spotted'); }
    hc.onclick = function () {
      if (camileFound) return;
      camileFound = true;
      save.camiles.londoneye = true; persist();
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
    save.stamps.londoneye = true; persist();
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
      'Norah rode the London Eye, spotted Big Ben, a red bus and a river boat' + extra + '. 🎉<br>You earned the <b>Ferris-wheel stamp!</b>';
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

    // build pods
    var layer = document.getElementById('podsLayer');
    var podStr = '';
    for (var i = 0; i < art.POD_COUNT; i++) {
      var isOurs = (i === art.OUR_POD);
      podStr += art.podSVG(0, 0, isOurs, isOurs);
    }
    layer.innerHTML = podStr;
    pods = Array.prototype.slice.call(layer.querySelectorAll('.pod'));
    ourPod = pods[art.OUR_POD];
    podPeople = document.getElementById('podPeople');
    spokes = document.getElementById('spokes');
    layoutPods();
    applyRise();

    wireHiddenCamile();
    updateProgress();

    // top bar buttons
    document.getElementById('passportBtn').onclick = function () { audio.unlock(); audio.play('tap'); openPassport(); };
    document.getElementById('closePassport').onclick = function () { audio.play('tap'); closePassport(); };
    document.getElementById('celebratePassport').onclick = function () { audio.play('tap'); document.getElementById('celebrate').style.display = 'none'; openPassport(); };
    document.getElementById('muteBtn').onclick = function () { audio.toggleMute(); refreshMute(); };
    refreshMute();

    // if already completed before, let them replay but show stamp earned in passport
    enterIntro();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
