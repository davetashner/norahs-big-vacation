/* audio.js — sound effects synthesized with the Web Audio API (no SFX files)
   plus looping background music played from an <audio id="music"> element.
   Works fully offline. The mute button controls both. */
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var musicSrc = null;
  try { muted = localStorage.getItem('nv_muted') === '1'; } catch (e) { /* ignore */ }

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function musicEl() { return document.getElementById('music'); }
  function tryPlayMusic() {
    var m = musicEl();
    if (m && musicSrc && !muted) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
  }

  // Play a short tone. type: oscillator type; freq sweep f0->f1 over dur.
  function tone(f0, f1, dur, type, vol, delay) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // A short burst of filtered noise (whooshes, camera shutter, woofs).
  function noise(dur, f0, f1, vol, delay) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = buf;
    var bq = c.createBiquadFilter(); bq.type = 'bandpass'; bq.Q.value = 1.2;
    bq.frequency.setValueAtTime(f0, t0); bq.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bq).connect(g).connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  var SFX = {
    tap: function () { tone(520, 660, 0.08, 'sine', 0.14); },
    spin: function () { tone(300, 520, 0.12, 'triangle', 0.12); },
    collect: function () {
      tone(523, 523, 0.1, 'square', 0.12, 0);
      tone(659, 659, 0.1, 'square', 0.12, 0.09);
      tone(784, 784, 0.14, 'square', 0.13, 0.18);
    },
    found: function () {
      tone(880, 880, 0.1, 'triangle', 0.14, 0);
      tone(1175, 1175, 0.12, 'triangle', 0.14, 0.1);
      tone(1568, 1568, 0.16, 'triangle', 0.13, 0.22);
    },
    // arg: pitch in Hz
    note: function (f) { f = f || 660; tone(f, f, 0.32, 'triangle', 0.2); tone(f * 2, f * 2, 0.2, 'sine', 0.05); },
    pop: function (f) { f = f || 800; tone(f, f * 1.8, 0.09, 'sine', 0.16); },
    wrong: function () { tone(330, 220, 0.2, 'triangle', 0.14); },
    boing: function () { tone(220, 520, 0.14, 'sine', 0.18); tone(520, 260, 0.2, 'sine', 0.14, 0.13); },
    bump: function () { tone(140, 60, 0.22, 'square', 0.12); noise(0.15, 400, 150, 0.12); },
    flip: function () { tone(700, 500, 0.06, 'sine', 0.08); },
    kiss: function () { tone(900, 1500, 0.1, 'sine', 0.14); tone(1300, 1800, 0.08, 'sine', 0.1, 0.1); },
    hug: function () { tone(392, 523, 0.25, 'triangle', 0.16); tone(523, 659, 0.3, 'triangle', 0.16, 0.2); tone(659, 784, 0.4, 'triangle', 0.14, 0.42); },
    honk: function () { tone(440, 380, 0.16, 'sawtooth', 0.08); tone(440, 380, 0.2, 'sawtooth', 0.08, 0.22); },
    woof: function () { noise(0.12, 900, 300, 0.25); tone(260, 150, 0.12, 'square', 0.1); },
    whoosh: function () { noise(0.9, 200, 2500, 0.22); },
    shutter: function () { noise(0.05, 3000, 2000, 0.3); noise(0.06, 2000, 1200, 0.25, 0.08); },
    stamp: function () {
      tone(180, 70, 0.16, 'square', 0.22);
      tone(120, 50, 0.2, 'sine', 0.16, 0.02);
    },
    win: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) tone(notes[i], notes[i], 0.18, 'square', 0.14, i * 0.12);
      tone(1047, 1568, 0.4, 'triangle', 0.12, notes.length * 0.12);
    }
  };

  window.NVaudio = {
    play: function (name, arg) { if (SFX[name]) SFX[name](arg); },
    // background music volume (0–1); games lower it when they play their own tune
    setVolume: function (v) { var m = musicEl(); if (m) m.volume = Math.max(0, Math.min(1, v)); },
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      try { localStorage.setItem('nv_muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      var m = musicEl();
      if (m) { if (muted) m.pause(); else { ensure(); tryPlayMusic(); } }
      if (!muted) ensure();
      return muted;
    },
    // call on first user gesture so audio is allowed to start
    unlock: function () { ensure(); tryPlayMusic(); },
    // set (and start) the looping background track for the current chapter
    setMusic: function (src) {
      var m = musicEl();
      if (!m) return;
      if (!src) { musicSrc = null; m.pause(); m.removeAttribute('src'); return; }
      if (musicSrc !== src) { musicSrc = src; m.src = src; m.loop = true; m.volume = 0.35; }
      tryPlayMusic();
    }
  };
})();
