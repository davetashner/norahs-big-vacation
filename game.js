/* game.js — Norah's Big Vacation
   A 12-chapter, tap-only, fully-offline storybook trip. Each chapter is a
   painted scene with its own mini-game (games.js), a hidden Camile to find,
   1–3 stars and a passport stamp.

   Everything that moves is drawn on one <canvas> laid over the painting, in the
   painting's own 400×700 coordinates, so it lines up on any screen size. */
(function () {
  'use strict';

  const audio = window.NVaudio, assets = window.NVassets || {}, GAMES = window.NVgames;
  const $ = (id) => document.getElementById(id);
  const W = 400, H = 700, TAU = Math.PI * 2;
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const UI_FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';

  // ── The trip. camile = where she hides (centre of her peeking head), in 400×700
  //    scene coordinates; cast = who stands in the scene during the intro. ──
  const CHAPTERS = [
    { id: 'pups', name: 'Goodbye Pups', glyph: '🐾', game: 'pack', camile: { x: 336, y: 388 },
      cast: [['norah', 110], ['penny', 205], ['obi', 290]],
      intro: 'Time for the big trip! Help Norah <b>pack her suitcase</b>, but watch out: Penny and Obi want to sneak their toys in! 🐾' },
    { id: 'airport', name: 'To the Airport', glyph: '🚗', game: 'bags', camile: { x: 342, y: 396 },
      cast: [['mommo', 100], ['norah', 165], ['daddo', 240]],
      intro: 'We made it to the airport! Our bags are riding the <b>baggage belt</b>. Can you spot them? 🧳' },
    { id: 'nyc', name: 'Fly to New York', glyph: '✈️', game: 'fly', camile: { x: 292, y: 566 },
      intro: 'Up, up and away to New York! ✈️ Fly the plane and catch the stars.' },
    { id: 'overnight', name: 'Night Flight', glyph: '🌙', game: 'stars', camile: { x: 112, y: 430 },
      intro: 'A long, sleepy flight to London. 🌙 Join the stars <b>1, 2, 3…</b> to draw pictures in the sky.' },
    { id: 'londoneye', name: 'The London Eye', glyph: '🎡', game: 'eye', camile: { x: 248, y: 506 },
      cast: [['mommo', 90], ['norah', 150], ['daddo', 310]],
      intro: 'Our hotel is right by the giant <b>London Eye!</b> 🎡 Ride it and snap photos from the very top.' },
    { id: 'train', name: 'Daddo\'s Train', glyph: '🚆', game: 'windows', camile: { x: 100, y: 452 },
      cast: [['daddo', 110], ['norah', 250], ['mommo', 315]],
      intro: 'Daddo has to take the train to work for a few days. 🚆 Wave goodbye and blow him <b>kisses</b>!' },
    { id: 'london', name: 'London & Mommo', glyph: '🚌', game: 'memory', camile: { x: 300, y: 450 },
      cast: [['mommo', 150], ['norah', 215]],
      intro: 'Just Norah and Mommo now, exploring London! Let\'s match our <b>London postcards</b>. 💌' },
    { id: 'castle', name: 'Leeds Castle', glyph: '👑', game: 'castle', camile: { x: 88, y: 588 },
      cast: [['norah', 150], ['mommo', 225]],
      intro: 'A sleepover in a real castle on a lake! 👑 First, count the <b>swans</b>. Then light the lanterns when night falls.' },
    { id: 'chunnel', name: 'The Chunnel', glyph: '🚄', game: 'tunnel', camile: { x: 334, y: 360 },
      cast: [['norah', 200], ['mommo', 270]],
      intro: 'All aboard! This train zooms <b>under the sea</b> all the way to France. 🚄🌊' },
    { id: 'eiffel', name: 'Eiffel Tower', glyph: '🗼', game: 'sparkle', camile: { x: 330, y: 604 },
      cast: [['mommo', 90], ['norah', 150]],
      intro: 'Bonjour, Paris! 🗼 At night the Eiffel Tower <b>sparkles</b>. Let\'s light it up to music!' },
    { id: 'treats', name: 'Croissants', glyph: '🥐', game: 'catch', camile: { x: 135, y: 566 },
      cast: [['norah', 250], ['mommo', 320]],
      intro: 'A Paris bakery! 🥐 Catch the pastries in Norah\'s box. Then pick her <b>favourite macaron</b>.' },
    { id: 'home', name: 'Fly Home', glyph: '🏠', game: 'hugs', camile: null,
      intro: 'The long way home: Paris, Boston, then Richmond! 🏠 Penny and Obi are waiting…' },
  ];
  const HIDING = CHAPTERS.filter((c) => c.camile).length;

  // ── Saved progress ──
  let save = { stamps: {}, camiles: {}, stars: {}, fav: null };
  try { const raw = localStorage.getItem('nv_save'); if (raw) save = Object.assign(save, JSON.parse(raw)); } catch (e) { /* fresh start */ }
  ['stamps', 'camiles', 'stars'].forEach((k) => { if (!save[k] || typeof save[k] !== 'object') save[k] = {}; });
  function persist() { try { localStorage.setItem('nv_save', JSON.stringify(save)); } catch (e) { /* storage full or blocked */ } }
  const totalStars = () => CHAPTERS.reduce((n, c) => n + (save.stars[c.id] || 0), 0);
  const camilesFound = () => CHAPTERS.filter((c) => c.camile && save.camiles[c.id]).length;

  // ── Character sprites ──
  const SPR = {}, SPR_H = { norah: 123, camile: 94, mommo: 160, daddo: 180, penny: 84, obi: 74 };
  Object.keys(SPR_H).forEach((n) => { const im = new Image(); im.src = 'assets/images/sprites/char-' + n + '.png'; SPR[n] = im; });

  // ── DOM ──
  const app = $('app'), sceneEl = $('scene'), cv = $('play'), ctx = cv.getContext('2d');
  const bgs = [$('bg'), $('bg2')];
  const narration = $('narration'), tipEl = $('tip'), choicesEl = $('choices'), actionBtn = $('actionBtn'), pill = $('progressPill');

  // ── Layout: the 400×700 scene is cover-fitted to the screen, like the painting ──
  let sc = 1, ox = 0, oy = 0, dpr = 1;
  const S = { l: 0, r: W, t: 0, b: H, cx: W / 2, cy: H / 2, vx0: 0, vx1: W, vy0: 0, vy1: H };
  function layout() {
    const r = app.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    sc = Math.max(r.width / W, r.height / H); ox = (r.width - W * sc) / 2; oy = (r.height - H * sc) / 2;
    bgs.forEach((b) => { b.style.left = ox + 'px'; b.style.top = oy + 'px'; b.style.width = W * sc + 'px'; b.style.height = H * sc + 'px'; });
    S.vx0 = Math.max(0, -ox / sc); S.vx1 = Math.min(W, (r.width - ox) / sc);
    S.vy0 = Math.max(0, -oy / sc); S.vy1 = Math.min(H, (r.height - oy) / sc);
    // keep play clear of the top bar and the tip line under it
    const topPx = $('topbar').getBoundingClientRect().bottom - r.top + 52;
    S.l = S.vx0 + 12 / sc; S.r = S.vx1 - 12 / sc;
    S.t = Math.max(S.vy0, (topPx - oy) / sc); S.b = S.vy1 - 10 / sc;
    S.cx = (S.l + S.r) / 2; S.cy = (S.t + S.b) / 2;
  }

  // ── Drawing helpers (scene coordinates) ──
  function emoji(e, x, y, size, rot, alpha) {
    ctx.save();
    if (alpha != null) ctx.globalAlpha *= alpha;
    ctx.translate(x, y); if (rot) ctx.rotate(rot);
    ctx.font = size + 'px ' + EMOJI_FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(e, 0, size * 0.06);
    ctx.restore();
  }
  function text(s, x, y, size, color, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font = '800 ' + size + 'px ' + UI_FONT; ctx.textAlign = opt.align || 'center'; ctx.textBaseline = 'middle';
    if (opt.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 4); ctx.strokeStyle = opt.stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = color || '#fff'; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function rr(x, y, w, h, r) {
    w = Math.max(0, w); h = Math.max(0, h);
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // Draw a character by its feet. opt.crop shows only the top part (for peeking).
  function sprite(name, x, feetY, h, opt) {
    opt = opt || {};
    const im = SPR[name];
    if (!im || !im.complete || !im.naturalWidth) return;
    const w = h * im.naturalWidth / im.naturalHeight;
    ctx.save();
    if (opt.alpha != null) ctx.globalAlpha *= opt.alpha;
    ctx.translate(x, feetY); if (opt.flip) ctx.scale(-1, 1);
    if (opt.crop) ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight * opt.crop, -w / 2, -h, w, h * opt.crop);
    else ctx.drawImage(im, -w / 2, -h, w, h);
    ctx.restore();
  }

  // ── Effects: particles and floating words ──
  const parts = [], floats = [];
  function burst(x, y, o) {
    o = o || {};
    const n = o.n || 10, sp = o.speed || 150;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = sp * (0.4 + Math.random() * 0.8);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, life: 0.9, max: 0.9, e: o.emojis ? o.emojis[i % o.emojis.length] : null, c: o.colors ? o.colors[i % o.colors.length] : null, s: o.size || 20, r: Math.random() * TAU });
    }
  }
  function addFloat(t, x, y, color) { floats.push({ t, x, y, color: color || '#fff', life: 1.1 }); }
  function stepFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 4; if (p.life <= 0) parts.splice(i, 1); }
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.life -= dt; f.y -= 42 * dt; if (f.life <= 0) floats.splice(i, 1); }
  }
  function drawFx() {
    parts.forEach((p) => {
      const a = Math.min(1, p.life / p.max * 1.5);
      if (p.e) emoji(p.e, p.x, p.y, p.s, 0, a);
      else { ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-4, -6, 8, 12); ctx.restore(); }
    });
    floats.forEach((f) => { ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 1.6); text(f.t, f.x, f.y, 18, f.color, { stroke: 'rgba(20,30,60,.75)' }); ctx.restore(); });
  }

  // ── Backgrounds (two layers so one can fade into the next) ──
  let front = 0;
  function setBg(url, ms, done) {
    if (!url) { if (done) done(); return; }
    const im = new Image();
    im.onload = im.onerror = () => {
      const nb = bgs[1 - front], ob = bgs[front];
      nb.style.transition = ob.style.transition = 'opacity ' + (ms || 0) + 'ms ease';
      nb.style.backgroundImage = 'url("' + url + '")';
      nb.style.opacity = '1'; ob.style.opacity = '0';
      front = 1 - front;
      if (done) done();
    };
    im.src = url;
  }
  function zoomScene(x, y, s, ms) {
    sceneEl.style.transformOrigin = (ox + x * sc) + 'px ' + (oy + y * sc) + 'px';
    sceneEl.style.transform = 'scale(' + s + ')';
    zooming = true;
    setTimeout(() => { sceneEl.style.transform = 'scale(1)'; setTimeout(() => { zooming = false; }, 550); }, ms);
  }

  // ── UI bits ──
  let tipTimer = 0;
  function showTip(html, ms) {
    tipEl.innerHTML = html; tipEl.hidden = false;
    tipEl.classList.remove('in'); void tipEl.offsetWidth; tipEl.classList.add('in');
    clearTimeout(tipTimer);
    if (ms) tipTimer = setTimeout(() => { tipEl.hidden = true; }, ms);
  }
  function hideTip() { clearTimeout(tipTimer); tipEl.hidden = true; }
  function say(html) { narration.innerHTML = html; narration.hidden = false; }
  function hideSay() { narration.hidden = true; }
  function setAction(label, fn) {
    if (!label) { actionBtn.hidden = true; actionBtn.onclick = null; return; }
    actionBtn.hidden = false; actionBtn.textContent = label;
    actionBtn.onclick = () => { audio.unlock(); audio.play('tap'); fn(); };
  }
  function showChoices(list, cb) {
    choicesEl.innerHTML = '';
    list.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'choice'; b.innerHTML = o.label;
      b.onclick = () => { audio.unlock(); cb(o.value, b); };
      choicesEl.appendChild(b);
    });
    choicesEl.hidden = false;
  }
  function hideChoices() { choicesEl.hidden = true; choicesEl.innerHTML = ''; }
  let hudText = '';
  function updatePill() {
    let s = 'Ch ' + (cur + 1) + '/' + CHAPTERS.length;
    if (hudText) s += '  ·  ' + hudText;
    if (ch && ch.camile) s += '  ·  ' + (camFound ? 'Camile ✓' : 'Camile 🔎');
    pill.textContent = s;
  }

  // ── Chapter state ──
  let cur = 0, ch = null, phase = 'intro', game = null, token = 0;
  let camFound = false, camHop = 0, dim = 0, dimTarget = 0, gameT = 0, paused = false, zooming = false;

  function makeApi(tok) {
    const live = () => tok === token;
    return {
      S, ctx, W, H,
      get t() { return gameT; },
      assets: assets[ch.id] || {},
      emoji, text, rr, sprite, burst,
      float: addFloat,
      sfx: (n, a) => audio.play(n, a),
      tip: (h, ms) => { if (live()) showTip(h, ms); },
      hud: (s) => { if (live()) { hudText = s; updatePill(); } },
      after: (ms, fn) => setTimeout(() => { if (live()) fn(); }, ms),
      dimTo: (v) => { dimTarget = v; },
      setBg: (url, ms) => { if (live()) setBg(url, ms); },
      setMusic: (src) => { if (live()) audio.setMusic(src); },
      music: (v) => audio.setVolume(v),
      zoom: zoomScene,
      choices: (list, cb) => { if (live()) showChoices(list, cb); },
      clearChoices: hideChoices,
      store: (k, v) => { save[k] = v; persist(); },
      finish: (stars, line) => { if (live()) finishChapter(stars, line); },
    };
  }

  function loadChapter(i) {
    token++;
    cur = Math.max(0, Math.min(CHAPTERS.length - 1, i));
    ch = CHAPTERS[cur];
    phase = 'intro'; game = null; gameT = 0; hudText = '';
    parts.length = 0; floats.length = 0; dim = dimTarget = 0;
    camFound = ch.camile ? !!save.camiles[ch.id] : true; camHop = 0;
    sceneEl.style.transform = 'scale(1)';
    hideTip(); hideChoices(); closeOverlays();
    const A = assets[ch.id] || {};
    audio.setMusic(A.music || null); audio.setVolume(0.35);
    setBg(A.bg, 350, hideLoading);
    say('<span class="chap">Chapter ' + (cur + 1) + ' · ' + ch.glyph + '</span><b class="chapname">' + ch.name + '</b>' + ch.intro
      + (ch.camile && !camFound ? '<span class="psst">Psst… Camile is hiding somewhere in this picture. 🔎</span>' : ''));
    setAction('Let\'s go!', startGame);
    updatePill();
    preloadNext();
  }
  function startGame() {
    hideSay(); setAction(null);
    phase = 'play'; gameT = 0;
    game = GAMES[ch.game](makeApi(token));
  }
  function finishChapter(stars, line) {
    if (phase === 'done') return;
    phase = 'done';
    const tok = token;
    hideChoices();
    save.stars[ch.id] = Math.max(save.stars[ch.id] || 0, stars);
    save.stamps[ch.id] = true;
    if (!ch.camile) save.camiles[ch.id] = true;
    persist();
    audio.setVolume(0.35);
    setTimeout(() => {
      if (tok !== token) return;
      hideTip();
      audio.play('stamp'); setTimeout(() => audio.play('win'), 250);
      showCelebrate(stars, line);
    }, 900);
  }

  // ── Hidden Camile: a small peeking head somewhere in each painting ──
  const CAM_H = 46, CAM_CROP = 0.48;
  function drawCamile() {
    if (!ch || !ch.camile) return;
    const c = ch.camile, hop = Math.sin(camHop * Math.PI) * 18;
    sprite('camile', c.x, c.y + CAM_H * (1 - CAM_CROP) - hop, CAM_H, { crop: CAM_CROP });
    if (camFound) {
      ctx.fillStyle = '#34c759'; ctx.beginPath(); ctx.arc(c.x + 13, c.y - 22 - hop, 8, 0, TAU); ctx.fill();
      text('✓', c.x + 13, c.y - 22 - hop, 11, '#fff');
    } else if (gameT > 12 && gameT % 8 < 0.8) {
      // a gentle hint for younger players
      emoji('✨', c.x + 14, c.y - 26, 16, 0, 0.9);
    }
  }
  function tryCamile(p) {
    if (!ch || !ch.camile || camFound) return false;
    const c = ch.camile;
    if (Math.abs(p.x - c.x) > 24 || p.y < c.y - 34 || p.y > c.y + 8) return false;
    camFound = true; camHop = 1;
    save.camiles[ch.id] = true; persist();
    audio.play('found');
    burst(c.x, c.y - 14, { emojis: ['✨', '💖', '⭐'], n: 16 });
    addFloat('You found Camile! ✨', c.x, c.y - 40, '#ffd25a');
    updatePill();
    return true;
  }
  function drawCast() {
    (ch.cast || []).forEach(([n, x]) => sprite(n, x, 672 - (n === 'penny' || n === 'obi' ? -6 : 0), SPR_H[n]));
  }

  // ── Main loop ──
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // a bug in one mini-game must never freeze the whole screen
    try { tick(dt); } catch (err) { console.error(err); }
    requestAnimationFrame(frame);
  }
  function tick(dt) {
    if (!paused) {
      gameT += dt;
      if (game && phase === 'play' && game.update) game.update(dt);
      stepFx(dt);
      dim += (dimTarget - dim) * Math.min(1, dt * 4);
      camHop = Math.max(0, camHop - dt * 1.6);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    if (dim > 0.005) { ctx.fillStyle = 'rgba(8,14,35,' + dim.toFixed(3) + ')'; ctx.fillRect(S.vx0 - 2, S.vy0 - 2, S.vx1 - S.vx0 + 4, S.vy1 - S.vy0 + 4); }
    if (ch) {
      drawCamile();
      if (phase === 'intro') drawCast();
      if (game && game.draw) game.draw(ctx);
      drawFx();
    }
  }

  // ── Input ──
  function toScene(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / sc, y: (e.clientY - r.top - oy) / sc }; }
  cv.addEventListener('pointerdown', (e) => {
    audio.unlock();
    if (paused || zooming) return;
    const p = toScene(e);
    if (tryCamile(p)) return;
    if (phase === 'play' && game && game.down) { try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } game.down(p); }
  });
  cv.addEventListener('pointermove', (e) => { if (phase === 'play' && game && game.move && !paused) game.move(toScene(e)); });
  const up = (e) => { if (phase === 'play' && game && game.up) game.up(toScene(e)); };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // ── Passport ──
  function starRow(n) { let s = ''; for (let i = 0; i < 3; i++) s += '<i class="' + (i < n ? 'on' : '') + '">★</i>'; return s; }
  function renderPassport() {
    $('passportTotals').innerHTML = '⭐ ' + totalStars() + ' / ' + CHAPTERS.length * 3 + '  ·  Camile found ' + camilesFound() + ' / ' + HIDING
      + (save.fav ? '<br>Favourite macaron: ' + save.fav : '');
    const grid = $('stampGrid'); grid.innerHTML = '';
    CHAPTERS.forEach((c, i) => {
      const earned = !!save.stamps[c.id];
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'stamp-slot' + (earned ? ' earned' : '');
      slot.innerHTML = '<div class="glyph">' + c.glyph + '</div><div class="nm">' + c.name + '</div>'
        + (earned ? '<div class="stars">' + starRow(save.stars[c.id] || 0) + '</div>' : '')
        + (c.camile && save.camiles[c.id] ? '<div class="cam" title="Camile found">👧</div>' : '');
      slot.setAttribute('aria-label', 'Play chapter ' + (i + 1) + ': ' + c.name);
      slot.onclick = () => { audio.play('tap'); loadChapter(i); };
      grid.appendChild(slot);
    });
  }
  function openPassport() { renderPassport(); $('passport').hidden = false; paused = true; }
  function closeOverlays() { $('passport').hidden = true; $('celebrate').hidden = true; paused = false; }

  // ── Chapter complete ──
  function showCelebrate(stars, line) {
    const lastCh = cur === CHAPTERS.length - 1;
    $('celebrateStamp').textContent = ch.glyph;
    $('celebrateTitle').textContent = lastCh ? 'You did it! 🎉' : ch.name + ': done!';
    $('celebrateStars').innerHTML = starRow(stars);
    $('celebrateText').innerHTML = line || '';
    let cam;
    if (!ch.camile) cam = 'Camile is safe in Norah\'s arms. 💖';
    else if (camFound) cam = '✨ You found Camile!';
    else cam = '🔎 Camile was hiding in this picture. Play again to find her!';
    if (lastCh) cam += '<br><b>Passport complete!</b> ⭐ ' + totalStars() + ' / ' + CHAPTERS.length * 3 + ' stars, Camile found ' + camilesFound() + ' / ' + HIDING + ' times.';
    $('celebrateCamile').innerHTML = cam;
    const next = $('celebrateNext');
    if (lastCh) { next.textContent = 'See my Passport'; next.onclick = () => { audio.play('tap'); $('celebrate').hidden = true; openPassport(); }; }
    else { next.textContent = 'Next: ' + CHAPTERS[cur + 1].name + ' →'; next.onclick = () => { audio.play('tap'); loadChapter(cur + 1); }; }
    $('celebrate').hidden = false; paused = true;
  }

  // ── Loading & preloading ──
  function hideLoading() {
    const l = $('loading');
    if (l && !l.classList.contains('hide')) { l.classList.add('hide'); setTimeout(() => l.remove(), 600); }
  }
  function preloadNext() {
    const n = CHAPTERS[cur + 1]; if (!n) return;
    const a = assets[n.id]; if (a && a.bg) { const im = new Image(); im.src = a.bg; }
  }

  // ── Boot ──
  function refreshMute() { $('muteBtn').textContent = audio.isMuted() ? '🔇' : '🔊'; }
  function boot() {
    layout();
    window.addEventListener('resize', layout);
    $('passportBtn').onclick = () => { audio.unlock(); audio.play('tap'); openPassport(); };
    $('closePassport').onclick = () => { audio.play('tap'); $('passport').hidden = true; paused = !$('celebrate').hidden; };
    $('resetBtn').onclick = () => {
      audio.play('tap');
      if (window.confirm('Start the whole trip over? This clears all your stamps and stars.')) {
        save = { stamps: {}, camiles: {}, stars: {}, fav: null }; persist(); loadChapter(0);
      }
    };
    $('celebrateAgain').onclick = () => { audio.play('tap'); loadChapter(cur); };
    $('celebratePassport').onclick = () => { audio.play('tap'); $('celebrate').hidden = true; openPassport(); };
    $('muteBtn').onclick = () => { audio.toggleMute(); refreshMute(); };
    refreshMute();
    // resume at the first chapter without a stamp
    let start = CHAPTERS.findIndex((c) => !save.stamps[c.id]);
    if (start < 0) start = 0;
    loadChapter(start);
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
