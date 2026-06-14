/* audio.js — all sound effects synthesized with the Web Audio API.
   No audio files => zero network, works fully offline. */
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  try { muted = localStorage.getItem('nv_muted') === '1'; } catch (e) { /* ignore */ }

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
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

  var SFX = {
    tap: function () { tone(520, 660, 0.08, 'sine', 0.14); },
    spin: function () { tone(300, 520, 0.12, 'triangle', 0.12); },
    collect: function () { // happy rising arpeggio
      tone(523, 523, 0.1, 'square', 0.12, 0);
      tone(659, 659, 0.1, 'square', 0.12, 0.09);
      tone(784, 784, 0.14, 'square', 0.13, 0.18);
    },
    found: function () { // sparkly "found Camile!"
      tone(880, 880, 0.1, 'triangle', 0.14, 0);
      tone(1175, 1175, 0.12, 'triangle', 0.14, 0.1);
      tone(1568, 1568, 0.16, 'triangle', 0.13, 0.22);
    },
    stamp: function () { // thunk
      tone(180, 70, 0.16, 'square', 0.22);
      tone(120, 50, 0.2, 'sine', 0.16, 0.02);
    },
    win: function () { // little fanfare
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) tone(notes[i], notes[i], 0.18, 'square', 0.14, i * 0.12);
      tone(1047, 1568, 0.4, 'triangle', 0.12, notes.length * 0.12);
    }
  };

  window.NVaudio = {
    play: function (name) { if (SFX[name]) SFX[name](); },
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      try { localStorage.setItem('nv_muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (!muted) ensure();
      return muted;
    },
    // call on first user gesture so audio is allowed to start
    unlock: function () { ensure(); }
  };
})();
