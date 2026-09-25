/* games.js — the 12 chapter mini-games for Norah's Big Vacation.

   Each game is a factory registered on window.NVgames. game.js calls it with an
   `api` object when the chapter starts and drives the returned object:
     update(dt)  advance the game (seconds)
     draw(ctx)   paint on the canvas, in the 400×700 scene coordinates
     down(p) / move(p) / up(p)   pointer input, p = {x, y} in scene coordinates
   A game ends by calling api.finish(stars 1–3, line). There is no losing:
   every game finishes, and stars reward how well it went. */
(function () {
  'use strict';

  const G = {};
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const lerp = (a, b, k) => a + (b - a) * k;
  const TAU = Math.PI * 2;
  const starsFor = (mistakes, ok3, ok2) => (mistakes <= ok3 ? 3 : mistakes <= ok2 ? 2 : 1);
  const starsForRatio = (r, r3, r2) => (r >= r3 ? 3 : r >= r2 ? 2 : 1);

  // ─────────────────────────────────────────────────────────────
  // 1. Goodbye Pups: drag Norah's things into the suitcase and the
  //    pups' toys onto their bed, then hug the pups goodbye.
  G.pack = function (api) {
    const NORAH = [['👗', 'dress'], ['🪥', 'toothbrush'], ['🩴', 'flip-flops'], ['🕶️', 'sunglasses'], ['📘', 'book'], ['👒', 'sun hat']];
    const PUPS = [['🦴', 'bone'], ['🎾', 'ball'], ['🥏', 'frisbee'], ['🍖', 'treat']];
    const queue = shuffle(NORAH.map(([e, n]) => ({ e, n, owner: 'norah' })).concat(PUPS.map(([e, n]) => ({ e, n, owner: 'pups' }))));
    const TOTAL = queue.length;
    let cur = null, mistakes = 0, phase = 'sort', wag = 0;
    const packed = [], bed = [], hugged = { penny: false, obi: false }, hop = { penny: 0, obi: 0 };

    const bins = () => {
      const S = api.S;
      return {
        suit: { x: S.l + 76, y: S.b - 70, w: 136, h: 86 },
        bed: { x: S.r - 76, y: S.b - 44, w: 136, h: 50 },
      };
    };
    const home = () => ({ x: api.S.cx, y: lerp(api.S.t, api.S.b, 0.34) });
    const pupSpots = () => { const B = bins().bed; return { penny: { x: B.x - 32, y: B.y - 4, h: 84 }, obi: { x: B.x + 34, y: B.y + 2, h: 74 } }; };
    const inBox = (p, b, m) => Math.abs(p.x - b.x) < b.w / 2 + m && Math.abs(p.y - b.y) < b.h / 2 + m + 20;

    function next() {
      if (!queue.length) {
        cur = null; phase = 'hug';
        api.tip('All packed! 🧳 Now tap <b>Penny</b> and <b>Obi</b> for goodbye hugs.', 0);
        return;
      }
      const h = home();
      cur = Object.assign(queue.shift(), { x: h.x, y: h.y, drag: false, fly: null });
      api.hud('🧳 ' + (TOTAL - queue.length) + '/' + TOTAL);
    }
    function flyTo(tx, ty, then) { cur.fly = { fx: cur.x, fy: cur.y, tx, ty, t0: api.t, dur: 0.38, then }; }
    function drop(where) {
      const B = bins(), b = where === 'norah' ? B.suit : B.bed;
      if (where === cur.owner) {
        api.sfx('collect');
        flyTo(b.x, b.y - 8, () => {
          (where === 'norah' ? packed : bed).push(cur.e);
          api.burst(b.x, b.y - 10, { emojis: where === 'norah' ? ['✨', '⭐'] : ['💕', '🐾'], n: 10 });
          if (where === 'pups') { wag = 1; api.sfx('woof'); }
          next();
        });
      } else {
        mistakes++;
        api.sfx('boing');
        api.float(cur.owner === 'pups' ? 'That\'s the pups\' ' + cur.n + '! 🐶' : 'Norah needs her ' + cur.n + '!', cur.x, cur.y - 50, '#fff');
        const h = home();
        flyTo(h.x, h.y, () => { cur.fly = null; });
      }
    }

    function drawSuitcase(b) {
      const { ctx } = api;
      ctx.fillStyle = '#8a4b1f'; api.rr(b.x - b.w / 2, b.y - b.h / 2 - b.h * 0.62, b.w, b.h * 0.62, 12); ctx.fill();
      ctx.fillStyle = '#ffd7ea'; api.rr(b.x - b.w / 2 + 8, b.y - b.h / 2 - b.h * 0.62 + 8, b.w - 16, b.h * 0.62 - 12, 8); ctx.fill();
      ctx.fillStyle = '#b5651d'; api.rr(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 14); ctx.fill();
      ctx.fillStyle = '#ff9ec9'; api.rr(b.x - b.w / 2 + 8, b.y - b.h / 2 + 6, b.w - 16, 18, 6); ctx.fill();
      packed.forEach((e, i) => api.emoji(e, b.x - b.w / 2 + 20 + (i % 6) * 19, b.y - b.h / 2 + 15, 18));
      ctx.strokeStyle = '#6b3a14'; ctx.lineWidth = 3; api.rr(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 14); ctx.stroke();
      ctx.fillStyle = '#ffd25a'; api.rr(b.x - 14, b.y - 6, 28, 10, 4); ctx.fill();
      api.text('Norah\'s suitcase', b.x, b.y + b.h / 2 + 14, 13, '#fff', { stroke: 'rgba(0,0,0,.55)' });
    }
    function drawBed(b) {
      const { ctx } = api, P = pupSpots(), w = Math.sin(api.t * 18) * 3 * wag;
      ['penny', 'obi'].forEach((n) => api.sprite(n, P[n].x + (n === 'penny' ? w : -w), P[n].y - hop[n] * 30, P[n].h));
      ctx.fillStyle = '#4a86c8'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 6, b.w / 2, b.h / 2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#cfe6ff'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 4, b.w / 2 - 12, b.h / 2 - 10, 0, 0, TAU); ctx.fill();
      bed.forEach((e, i) => api.emoji(e, b.x - 36 + i * 24, b.y + 4, 20));
      api.text('Pups\' bed', b.x, b.y + b.h / 2 + 20, 13, '#fff', { stroke: 'rgba(0,0,0,.55)' });
      if (phase === 'hug') ['penny', 'obi'].forEach((n) => {
        if (hugged[n]) api.emoji('💖', P[n].x, P[n].y - P[n].h - 12, 22);
        else api.emoji('👆', P[n].x, P[n].y - P[n].h - 10 + Math.sin(api.t * 6) * 4, 22);
      });
    }

    next();
    api.tip('Drag each thing to the right place. 🧳 Norah\'s things go in the <b>suitcase</b>, the pups\' toys go on their <b>bed</b>.', 5500);

    return {
      update(dt) {
        wag = Math.max(0, wag - dt * 0.8);
        hop.penny = Math.max(0, hop.penny - dt * 2); hop.obi = Math.max(0, hop.obi - dt * 2);
        if (cur && cur.fly) {
          const k = clamp((api.t - cur.fly.t0) / cur.fly.dur, 0, 1);
          cur.x = lerp(cur.fly.fx, cur.fly.tx, k);
          cur.y = lerp(cur.fly.fy, cur.fly.ty, k) - Math.sin(k * Math.PI) * 60;
          if (k >= 1) { const f = cur.fly.then; cur.fly = null; f(); }
        }
      },
      draw() {
        const B = bins();
        drawSuitcase(B.suit); drawBed(B.bed);
        if (cur) {
          const bob = cur.drag || cur.fly ? 0 : Math.sin(api.t * 3) * 5;
          if (!cur.fly) {
            api.ctx.fillStyle = 'rgba(255,255,255,.85)';
            api.ctx.beginPath(); api.ctx.arc(cur.x, cur.y + bob, 42, 0, TAU); api.ctx.fill();
            api.ctx.strokeStyle = '#ffd25a'; api.ctx.lineWidth = 4; api.ctx.stroke();
          }
          api.emoji(cur.e, cur.x, cur.y + bob, cur.fly ? 40 : 54);
          if (!cur.fly && !cur.drag && packed.length + bed.length < 2) api.text('Drag me!', cur.x, cur.y + 62, 15, '#fff', { stroke: 'rgba(0,0,0,.5)' });
        }
      },
      down(p) {
        if (phase === 'hug') {
          const P = pupSpots();
          ['penny', 'obi'].forEach((n) => {
            const s = P[n];
            if (!hugged[n] && Math.abs(p.x - s.x) < 40 && p.y < s.y + 10 && p.y > s.y - s.h - 20) {
              hugged[n] = true; hop[n] = 1; api.sfx('hug');
              api.burst(s.x, s.y - s.h / 2, { emojis: ['💕', '💖', '🐾'], n: 16 });
              api.float('Bye, ' + (n === 'penny' ? 'Penny' : 'Obi') + '! 💕', s.x, s.y - s.h - 24, '#fff');
              if (hugged.penny && hugged.obi) api.after(1100, () => api.finish(starsFor(mistakes, 0, 2), 'Packed and ready to go! 🧳'));
            }
          });
          return;
        }
        if (!cur || cur.fly) return;
        if (dist(p.x, p.y, cur.x, cur.y) < 52) { cur.drag = true; cur.dx = cur.x - p.x; cur.dy = cur.y - p.y; return; }
        const B = bins();
        if (inBox(p, B.suit, 6)) drop('norah'); else if (inBox(p, B.bed, 6)) drop('pups');
      },
      move(p) { if (cur && cur.drag) { cur.x = p.x + cur.dx; cur.y = p.y + cur.dy; } },
      up() {
        if (!cur || !cur.drag) return;
        cur.drag = false;
        const B = bins();
        if (inBox(cur, B.suit, 30)) drop('norah');
        else if (inBox(cur, B.bed, 30)) drop('pups');
        else { const h = home(); flyTo(h.x, h.y, () => { cur.fly = null; }); }
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 2. To the Airport: spot our family's bags on the moving belt.
  G.bags = function (api) {
    const COLORS = { pink: '#ff7eb6', purple: '#a77bf2', green: '#45c07a', blue: '#4a9ff5', orange: '#ff9f43', yellow: '#ffd23f' };
    const STICKERS = ['⭐', '🌸', '🧢', '🐾', '⚡', '🍀', '🎀', '🌈'];
    const TARGETS = [
      { who: 'Norah', c: 'pink', s: '⭐' },
      { who: 'Mommo', c: 'purple', s: '🌸' },
      { who: 'Daddo', c: 'blue', s: '🧢' },
      { who: 'Camile', c: 'yellow', s: '🎀', small: true },
    ];
    let round = 0, mistakes = 0, speed = 64, spawnIn = 0.2, since = 0, finished = false;
    const bags = [], cart = [];
    const beltY = () => api.S.b - 150;
    const target = () => TARGETS[round];
    const isTarget = (b) => round < TARGETS.length && b.c === target().c && b.s === target().s;

    function spawn() {
      const T = target();
      let bag;
      if (since >= 2 && (Math.random() < 0.34 || since >= 5)) { bag = { c: T.c, s: T.s, small: !!T.small }; since = 0; }
      else {
        since++;
        let c, s;
        do {
          // half the decoys share a colour or a sticker with the bag we want, so kids have to look closely
          const tricky = Math.random() < 0.5;
          c = tricky && Math.random() < 0.5 ? T.c : pick(Object.keys(COLORS));
          s = tricky && c !== T.c ? T.s : pick(STICKERS);
        } while (c === T.c && s === T.s);
        bag = { c, s, small: Math.random() < 0.2 };
      }
      bags.push(Object.assign(bag, { x: api.S.l - 50, lift: null, shake: 0 }));
    }
    function drawBag(x, y, c, s, small, scale) {
      const { ctx } = api, k = (small ? 0.72 : 1) * (scale || 1), w = 64 * k, h = 48 * k;
      ctx.strokeStyle = '#333'; ctx.lineWidth = 4 * k;
      ctx.beginPath(); ctx.moveTo(x - 12 * k, y - h / 2); ctx.lineTo(x - 12 * k, y - h / 2 - 10 * k); ctx.lineTo(x + 12 * k, y - h / 2 - 10 * k); ctx.lineTo(x + 12 * k, y - h / 2); ctx.stroke();
      ctx.fillStyle = COLORS[c]; api.rr(x - w / 2, y - h / 2, w, h, 9 * k); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x - w / 2 + 6 * k, y - h / 2 + 5 * k, w - 12 * k, 5 * k);
      api.emoji(s, x, y + 3 * k, 24 * k);
    }

    api.tip('Tap <b>our</b> bags as they ride past. Look at the <b>colour</b> and the <b>sticker</b>! 🧳', 5000);
    api.hud('🧳 0/4');

    return {
      update(dt) {
        if (finished) return;
        spawnIn -= dt;
        if (spawnIn <= 0) { spawn(); spawnIn = 1.05 * 64 / speed; }
        for (const b of bags) {
          if (b.lift) continue;
          b.x += speed * dt; b.shake = Math.max(0, b.shake - dt * 3);
        }
        for (let i = bags.length - 1; i >= 0; i--) {
          const b = bags[i];
          if (b.lift && api.t - b.lift > 0.6) { bags.splice(i, 1); continue; }
          if (b.x > api.S.r + 60) bags.splice(i, 1);
        }
      },
      draw() {
        const { ctx, S } = api, y = beltY();
        // belt
        ctx.fillStyle = '#3b3f4a'; api.rr(S.vx0 - 10, y - 6, S.vx1 - S.vx0 + 20, 44, 10); ctx.fill();
        ctx.fillStyle = '#5a606e'; ctx.fillRect(S.vx0 - 10, y - 6, S.vx1 - S.vx0 + 20, 8);
        ctx.strokeStyle = '#2a2d35'; ctx.lineWidth = 3;
        const off = (api.t * speed) % 28;
        for (let x = S.vx0 - 28 + off; x < S.vx1 + 28; x += 28) { ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 36); ctx.stroke(); }
        // bags
        for (const b of bags) {
          if (b.lift) {
            const k = Math.min(1, (api.t - b.lift) / 0.6);
            drawBag(lerp(b.x, S.r - 40, k), lerp(y - 20, S.b - 30, k) - Math.sin(k * Math.PI) * 80, b.c, b.s, b.small, 1 - k * 0.4);
          } else drawBag(b.x + Math.sin(b.shake * 30) * 6 * b.shake, y - 20, b.c, b.s, b.small);
        }
        // cart with the bags we found
        cart.forEach((b, i) => drawBag(S.r - 40 - (i % 2) * 44, S.b - 26 - Math.floor(i / 2) * 36, b.c, b.s, b.small, 0.62));
        // what to look for
        if (round < TARGETS.length) {
          const T = target(), cy = S.t + 44;
          ctx.fillStyle = 'rgba(255,255,255,.94)'; api.rr(S.cx - 118, cy - 34, 236, 68, 16); ctx.fill();
          ctx.strokeStyle = '#ffd25a'; ctx.lineWidth = 3; ctx.stroke();
          api.text('Find ' + T.who + '\'s bag:', S.cx - 38, cy, 16, '#1b2a4a');
          drawBag(S.cx + 76, cy + 4, T.c, T.s, T.small, 0.9);
        }
      },
      down(p) {
        if (finished) return;
        const y = beltY() - 20;
        for (let i = bags.length - 1; i >= 0; i--) {
          const b = bags[i];
          if (b.lift || Math.abs(p.x - b.x) > 38 || Math.abs(p.y - y) > 40) continue;
          if (isTarget(b)) {
            b.lift = api.t; cart.push({ c: b.c, s: b.s, small: b.small });
            api.sfx('collect'); api.burst(b.x, y, { emojis: ['✨', '⭐'], n: 12 });
            api.float(target().who + '\'s bag! ✔', b.x, y - 46, '#fff');
            round++; api.hud('🧳 ' + round + '/4'); since = 0;
            if (round >= TARGETS.length) { finished = true; api.after(1100, () => api.finish(starsFor(mistakes, 0, 2), 'All our bags are here! Off to the plane! ✈️')); }
            else { speed += 16; api.tip('Great! Now find <b>' + target().who + '\'s</b> bag.', 2600); }
          } else {
            mistakes++; b.shake = 1; api.sfx('wrong');
            api.float('Not ours!', b.x, y - 46, '#ffe4ec');
          }
          return;
        }
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 3. Fly to New York: hold to climb, let go to glide, catch stars, dodge birds.
  G.fly = function (api) {
    const DUR = 30;
    let el = 0, y = 0, vy = 0, hold = false, spawnIn = 0.6, birdIn = 2.5, got = 0, total = 0, sky = 0, ending = false, wob = 0;
    const items = [], clouds = [];
    const S = api.S;
    y = S.cy;
    for (let i = 0; i < 9; i++) clouds.push({ x: rnd(S.vx0, S.vx1), y: rnd(S.vy0, S.vy1), s: rnd(0.6, 1.4), v: rnd(40, 90) });
    const planeX = () => api.S.l + 70;

    api.tip('<b>Hold</b> anywhere to climb ⬆️ and let go to glide ⬇️. Catch the ⭐ stars, dodge the 🐦 birds!', 5000);
    api.hud('⭐ 0');

    function cloud(c) {
      const { ctx } = api;
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      [[0, 0, 26], [22, -8, 22], [42, 2, 20], [18, 8, 22]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, TAU); ctx.fill(); });
    }

    return {
      update(dt) {
        const S = api.S;
        sky = ending ? Math.max(0, sky - dt * 0.8) : Math.min(1, sky + dt * 2);
        clouds.forEach((c) => { c.x -= c.v * dt; if (c.x < S.vx0 - 110) { c.x = S.vx1 + 40; c.y = rnd(S.vy0, S.vy1); } });
        if (ending) return;
        el += dt;
        vy += (hold ? -900 : 560) * dt; vy = clamp(vy, -260, 260);
        y += vy * dt;
        if (y < S.t + 30) { y = S.t + 30; vy = 0; }
        if (y > S.b - 30) { y = S.b - 30; vy = 0; }
        wob = Math.max(0, wob - dt * 2);
        // stars follow a gentle wave so there is always a path to follow
        spawnIn -= dt;
        if (spawnIn <= 0 && el < DUR - 2) {
          spawnIn = 0.55;
          const mid = S.t + 50 + (S.b - S.t - 100) * (0.5 + 0.42 * Math.sin(el * 0.8) * Math.cos(el * 0.37));
          items.push({ k: 'star', x: S.vx1 + 30, y: mid }); total++;
        }
        birdIn -= dt;
        if (birdIn <= 0 && el < DUR - 3) {
          birdIn = rnd(1.8, 2.8);
          items.push({ k: 'bird', x: S.vx1 + 30, y: rnd(S.t + 40, S.b - 40), ph: rnd(0, 6) });
        }
        const px = planeX();
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.x -= (it.k === 'bird' ? 230 : 170) * dt;
          if (it.k === 'bird') it.y += Math.sin(api.t * 3 + it.ph) * 30 * dt;
          if (dist(it.x, it.y, px, y) < 32) {
            items.splice(i, 1);
            if (it.k === 'star') { got++; api.sfx('pop', 600 + (got % 8) * 60); api.burst(it.x, it.y, { emojis: ['✨'], n: 6, speed: 90 }); }
            else { wob = 1; api.sfx('bump'); if (got > 0) { got--; api.float('-1 ⭐', px, y - 34, '#ffe4ec'); } api.burst(it.x, it.y, { emojis: ['🪶'], n: 5, speed: 80 }); }
            api.hud('⭐ ' + got);
            continue;
          }
          if (it.x < S.vx0 - 40) items.splice(i, 1);
        }
        if (el >= DUR) {
          ending = true; items.length = 0;
          api.tip('Look! <b>New York City!</b> 🗽', 0);
          api.after(1900, () => api.finish(starsForRatio(got / Math.max(1, total), 0.8, 0.5), 'You caught ' + got + ' stars on the way to New York! 🗽'));
        }
      },
      draw() {
        const { ctx, S } = api;
        if (sky > 0) {
          ctx.save(); ctx.globalAlpha = sky;
          const g = ctx.createLinearGradient(0, S.vy0, 0, S.vy1); g.addColorStop(0, '#5ab4f5'); g.addColorStop(1, '#c9ecff');
          ctx.fillStyle = g; ctx.fillRect(S.vx0 - 2, S.vy0 - 2, S.vx1 - S.vx0 + 4, S.vy1 - S.vy0 + 4);
          clouds.forEach(cloud);
          ctx.restore();
        }
        for (const it of items) {
          if (it.k === 'star') api.emoji('⭐', it.x, it.y, 30);
          else api.emoji('🐦', it.x, it.y, 32);
        }
        if (!ending || sky > 0.05) {
          const tilt = clamp(vy / 600, -0.35, 0.35) + Math.sin(api.t * 40) * 0.15 * wob;
          ctx.save(); ctx.globalAlpha = Math.max(sky, 0.001);
          // ✈️ points up and to the right; rotate it to fly level
          api.emoji('✈️', planeX(), y, 54, Math.PI / 4 + tilt);
          ctx.restore();
          // trip progress
          const k = clamp(el / DUR, 0, 1), x0 = S.l + 30, x1 = S.r - 30, by = S.t + 14;
          ctx.fillStyle = 'rgba(255,255,255,.7)'; api.rr(x0, by - 4, x1 - x0, 8, 4); ctx.fill();
          ctx.fillStyle = '#ff5ca8'; api.rr(x0, by - 4, (x1 - x0) * k, 8, 4); ctx.fill();
          api.emoji('🗽', x1 + 12, by, 22);
          api.emoji('✈️', lerp(x0, x1, k), by, 18, Math.PI / 4);
        }
      },
      down() { hold = true; },
      up() { hold = false; },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 4. Night Flight: join the stars 1, 2, 3… to draw pictures in the sky.
  G.stars = function (api) {
    const starPts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.2 : 0.44; starPts.push([0.5 + Math.cos(a) * r, 0.53 + Math.sin(a) * r]); }
    const SHAPES = [
      { msg: 'Our cozy house! 🏠', pts: [[0.2, 0.88], [0.2, 0.45], [0.5, 0.13], [0.8, 0.45], [0.8, 0.88]] },
      { msg: 'A big heart for Penny and Obi! 💕', pts: [[0.5, 0.9], [0.12, 0.5], [0.22, 0.18], [0.5, 0.33], [0.78, 0.18], [0.88, 0.5]] },
      { msg: 'A crown for Leeds Castle! 👑', pts: [[0.1, 0.85], [0.1, 0.3], [0.3, 0.55], [0.5, 0.14], [0.7, 0.55], [0.9, 0.3], [0.9, 0.85]] },
      { msg: 'A super star! ⭐', pts: starPts },
    ];
    const NOTES = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
    const tiny = []; for (let i = 0; i < 40; i++) tiny.push([Math.random(), Math.random(), Math.random() * 6]);
    let round = 0, k = 0, mistakes = 0, doneAt = -1, lastTap = 0, wobble = { i: -1, t: 0 };
    api.dimTo(0.55);

    const panel = () => {
      const S = api.S, w = S.r - S.l - 16, h = Math.min(w * 1.05, S.b - S.t - 30);
      return { x: S.cx - w / 2, y: S.t + 10, w, h };
    };
    const dots = () => { const P = panel(); return SHAPES[round].pts.map(([u, v]) => ({ x: P.x + 30 + u * (P.w - 60), y: P.y + 30 + v * (P.h - 60) })); };

    api.tip('Tap the stars in order: <b>1, 2, 3…</b> to make a picture! ✨', 4500);
    api.hud('✨ 1/4');

    return {
      update(dt) { wobble.t = Math.max(0, wobble.t - dt * 3); },
      draw() {
        const { ctx } = api, P = panel(), D = dots(), n = D.length, complete = k >= n;
        const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); g.addColorStop(0, '#0b1640'); g.addColorStop(1, '#23346f');
        ctx.fillStyle = g; api.rr(P.x, P.y, P.w, P.h, 26); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.stroke();
        tiny.forEach(([u, v, ph]) => { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(api.t * 2 + ph); ctx.fillStyle = '#fff'; ctx.fillRect(P.x + 10 + u * (P.w - 20), P.y + 10 + v * (P.h - 20), 2, 2); });
        ctx.globalAlpha = 1;
        // lines drawn so far
        ctx.strokeStyle = complete ? '#ffe27a' : '#ffd25a'; ctx.lineWidth = complete ? 6 : 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = '#ffd25a'; ctx.shadowBlur = complete ? 18 : 8;
        ctx.beginPath();
        for (let i = 0; i < Math.min(k, n); i++) (i ? ctx.lineTo(D[i].x, D[i].y) : ctx.moveTo(D[i].x, D[i].y));
        if (complete) ctx.closePath();
        ctx.stroke(); ctx.shadowBlur = 0;
        // dots
        D.forEach((d, i) => {
          const done = i < k, hint = i === k && api.t - lastTap > 5;
          const wx = wobble.i === i ? Math.sin(wobble.t * 40) * 6 * wobble.t : 0;
          const r = 15 + (hint ? 3 * Math.sin(api.t * 8) : 0);
          ctx.fillStyle = done ? '#ffd25a' : '#fff'; ctx.beginPath(); ctx.arc(d.x + wx, d.y, r, 0, TAU); ctx.fill();
          api.text(String(i + 1), d.x + wx, d.y + 1, 15, '#1b2a4a');
        });
        if (complete) api.text(SHAPES[round].msg, P.x + P.w / 2, P.y + P.h - 20, 17, '#fff');
      },
      down(p) {
        if (k >= dots().length) return;
        const D = dots();
        let hit = -1, best = 34;
        D.forEach((d, i) => { const dd = dist(p.x, p.y, d.x, d.y); if (dd < best) { best = dd; hit = i; } });
        if (hit < 0) return;
        lastTap = api.t;
        if (hit === k) {
          api.sfx('note', NOTES[k]); api.burst(D[hit].x, D[hit].y, { emojis: ['✨'], n: 5, speed: 70 });
          k++;
          if (k >= D.length) {
            api.sfx('found'); api.burst(api.S.cx, panel().y + panel().h / 2, { emojis: ['✨', '⭐', '🌟'], n: 22, speed: 180 });
            api.after(2200, () => {
              if (round + 1 >= SHAPES.length) { api.finish(starsFor(mistakes, 1, 4), 'You drew four pictures in the stars! 🌙 Goodnight!'); return; }
              round++; k = 0; lastTap = api.t; api.hud('✨ ' + (round + 1) + '/4');
            });
          }
        } else if (hit > k) {
          mistakes++; wobble = { i: hit, t: 1 }; api.sfx('wrong');
          api.float('Find ' + (k + 1) + '!', D[hit].x, D[hit].y - 26, '#fff');
        }
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 5. The London Eye: tap to snap a photo when our pod reaches the very top.
  G.eye = function (api) {
    const E = { cx: 195, cy: 355, rx: 88, ry: 123 };
    let th = Math.PI / 2, w = 1.45, tries = 0, pts = 0, flash = 0, pause = 0;
    const shots = [];
    const top = { x: E.cx, y: E.cy - E.ry };
    api.tip('Our pod is the <b>glowing</b> one. Tap anywhere to snap a photo 📸 when it reaches the <b>very top!</b>', 5000);
    api.hud('📸 0/3');

    return {
      update(dt) {
        flash = Math.max(0, flash - dt * 2.5);
        if (pause > 0) { pause -= dt; return; }
        if (tries < 3) th = (th + w * dt) % TAU;
      },
      draw() {
        const { ctx, S } = api;
        // target at the top of the wheel
        const pulse = 1 + 0.12 * Math.sin(api.t * 6);
        ctx.strokeStyle = '#ffd25a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(top.x, top.y, 22 * pulse, 0, TAU); ctx.stroke();
        api.emoji('📸', top.x, top.y - 44, 26);
        // our pod
        const px = E.cx + E.rx * Math.cos(th), py = E.cy + E.ry * Math.sin(th);
        const g = ctx.createRadialGradient(px, py, 2, px, py, 30); g.addColorStop(0, 'rgba(255,243,176,.95)'); g.addColorStop(1, 'rgba(255,210,90,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 30, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffe7a6'; ctx.strokeStyle = '#ff9f1a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(px, py, 15, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();
        api.emoji('👧', px, py, 12);
        // photo album
        for (let i = 0; i < 3; i++) {
          const x = S.cx + (i - 1) * 84, y = S.b - 52, s = shots[i];
          ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.06);
          ctx.fillStyle = '#fff'; api.rr(-34, -40, 68, 80, 6); ctx.fill();
          ctx.fillStyle = s ? '#9fd3ff' : '#dfe6ef'; ctx.fillRect(-28, -34, 56, 50);
          if (s) { api.emoji(s.g === 3 ? '🎡' : s.g ? '🏙️' : '☁️', 0, -10, 28); api.text('⭐'.repeat(s.g) || '·', 0, 28, 12, '#1b2a4a'); }
          else api.text('?', 0, -8, 22, '#9aa7b8');
          ctx.restore();
        }
        if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + flash + ')'; ctx.fillRect(S.vx0, S.vy0, S.vx1 - S.vx0, S.vy1 - S.vy0); }
      },
      down() {
        if (tries >= 3 || pause > 0) return;
        const a = ((th + Math.PI / 2) % TAU + TAU) % TAU;   // 0 at the very top
        const diff = Math.min(a, TAU - a);
        const g = diff <= 0.14 ? 3 : diff <= 0.32 ? 2 : diff <= 0.6 ? 1 : 0;
        const label = g === 3 ? 'Perfect! 🌟' : g === 2 ? 'Great!' : g === 1 ? 'Nice!' : (a > Math.PI ? 'A bit early!' : 'A bit late!');
        tries++; pts += g; shots.push({ g }); flash = 1; pause = 1.1;
        api.sfx('shutter');
        api.float(label, top.x, top.y - 70, '#fff');
        if (g === 3) { api.sfx('found'); api.zoom(top.x, top.y + 40, 1.45, 900); }
        api.hud('📸 ' + tries + '/3');
        w += 0.35;
        if (tries >= 3) api.after(1500, () => api.finish(pts >= 7 ? 3 : pts >= 4 ? 2 : 1, 'What a view of London from the top! 🎡'));
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 6. Daddo's Train: find Daddo in the passing windows and blow him kisses.
  G.windows = function (api) {
    const FACES = ['🧔', '👩', '👵', '👴', '👱‍♀️', '🧑', '👩‍🦰', '👨'];
    const N = 24, GAP = 96, DADDO = 6;
    const slots = [];
    const daddoAt = new Set();
    while (daddoAt.size < DADDO) { const i = ri(2, N - 2); if (![...daddoAt].some((j) => Math.abs(j - i) < 2)) daddoAt.add(i); }
    for (let i = 0; i < N; i++) slots.push(daddoAt.has(i) ? { who: 'daddo' } : Math.random() < 0.72 ? { who: pick(FACES) } : { who: null });
    let x0 = api.S.vx1 + 20, speed = 70, hits = 0, mistakes = 0, over = false;
    const trainY = () => lerp(api.S.t, api.S.b, 0.36);
    const winX = (i) => x0 + 80 + i * GAP;
    api.tip('Daddo is on the train! Tap <b>Daddo</b> 🧢 every time you see him to blow a kiss. 💋', 5000);
    api.hud('💛 0/' + DADDO);

    return {
      update(dt) {
        if (over) return;
        const k = clamp((api.S.vx1 - x0) / (N * GAP), 0, 1);
        speed = 70 + 60 * k;
        x0 -= speed * dt;
        slots.forEach((s) => { s.oops = Math.max(0, (s.oops || 0) - dt); s.kiss = Math.max(0, (s.kiss || 0) - dt); });
        if (winX(N - 1) < api.S.vx0 - 90) {
          over = true;
          const line = hits >= DADDO ? 'You found Daddo every time! See you soon, Daddo! 💛' : 'See you soon, Daddo! 💛';
          api.finish(hits >= DADDO && mistakes <= 1 ? 3 : hits >= 4 && mistakes <= 3 ? 2 : 1, line);
        }
      },
      draw() {
        const { ctx, S } = api, y = trainY(), len = 80 + N * GAP + 60;
        // body
        ctx.fillStyle = '#243b6b'; api.rr(x0, y, len, 120, 26); ctx.fill();
        ctx.fillStyle = '#ffcc2e'; ctx.fillRect(x0 + 10, y + 92, len - 20, 20);
        ctx.fillStyle = '#ffcc2e'; api.rr(x0 - 6, y + 20, 40, 80, 18); ctx.fill();
        ctx.fillStyle = '#fff6c2'; ctx.beginPath(); ctx.arc(x0 + 14, y + 86, 7, 0, TAU); ctx.fill();
        ctx.fillStyle = '#16244a';
        for (let x = x0 + 40; x < x0 + len - 20; x += 64) { ctx.beginPath(); ctx.arc(x, y + 122, 9, 0, TAU); ctx.fill(); }
        // windows
        slots.forEach((s, i) => {
          const wx = winX(i); if (wx < S.vx0 - 60 || wx > S.vx1 + 60) return;
          ctx.save();
          api.rr(wx - 32, y + 18, 64, 58, 10); ctx.fillStyle = '#cfe8ff'; ctx.fill(); ctx.clip();
          if (s.who === 'daddo') api.sprite('daddo', wx, y + 22 + 150, 150);
          else if (s.who) api.emoji(s.oops ? '😮' : s.who, wx, y + 52, 40);
          ctx.restore();
          ctx.strokeStyle = '#0f1b36'; ctx.lineWidth = 4; api.rr(wx - 32, y + 18, 64, 58, 10); ctx.stroke();
          if (s.who === 'daddo' && s.hit) api.emoji('💛', wx + 22, y + 22 - 10 * s.kiss, 20);
        });
        // Norah and Mommo waving on the platform
        api.sprite('mommo', S.l + 50, S.b - 4, 140);
        api.sprite('norah', S.l + 112, S.b - 4 - Math.abs(Math.sin(api.t * 4)) * 4, 110);
      },
      down(p) {
        const y = trainY();
        if (p.y < y + 10 || p.y > y + 86) return;
        slots.forEach((s, i) => {
          const wx = winX(i);
          if (Math.abs(p.x - wx) > 36 || !s.who) return;
          if (s.who === 'daddo') {
            if (s.hit) return;
            s.hit = true; s.kiss = 1; hits++; api.sfx('kiss');
            api.burst(wx, y + 40, { emojis: ['💋', '💛', '💕'], n: 12 });
            api.float('Bye, Daddo! 👋', wx, y - 8, '#fff');
            api.hud('💛 ' + hits + '/' + DADDO);
          } else if (!s.oops) {
            mistakes++; s.oops = 0.9; api.sfx('wrong');
            api.float('Not Daddo!', wx, y - 8, '#ffe4ec');
          }
        });
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 7. London & Mommo: match the London postcards.
  G.memory = function (api) {
    const CARDS = [
      ['🕰️', 'Big Ben', 'Big Ben is really the name of the giant bell inside the clock tower! 🔔'],
      ['🚌', 'Red bus', 'London buses are double-deckers, with two floors! 🚌'],
      ['👑', 'Crown', 'The King\'s crown sparkles with thousands of jewels! 💎'],
      ['💂', 'Guard', 'The King\'s guards wear tall fuzzy hats called bearskins! 💂'],
      ['🫖', 'Teapot', 'People in England love a cup of tea, with biscuits! 🍪'],
      ['🎡', 'London Eye', 'The London Eye takes about 30 minutes to go all the way around! 🎡'],
    ];
    const deck = shuffle(CARDS.concat(CARDS).map(([e, name, fact]) => ({ e, name, fact, up: false, matched: false, f: 0 })));
    let open = [], moves = 0, pairs = 0, lock = false;
    api.dimTo(0.4);
    api.tip('Tap two postcards to flip them. Find the <b>matching pairs</b>! 💌', 4000);
    api.hud('💌 0/6');

    const layout = () => {
      const S = api.S, gap = 10, top = S.t + 6, availH = S.b - top - 8;
      const cw = Math.min((S.r - S.l - 2 * gap) / 3, (availH - 3 * gap) / 4 / 1.25), chh = cw * 1.25;
      const left = S.cx - (3 * cw + 2 * gap) / 2;
      return deck.map((c, i) => ({ x: left + (i % 3) * (cw + gap), y: top + Math.floor(i / 3) * (chh + gap), w: cw, h: chh }));
    };

    return {
      update(dt) { deck.forEach((c) => { const want = c.up || c.matched ? 1 : 0; c.f += clamp(want - c.f, -dt * 6, dt * 6); }); },
      draw() {
        const { ctx } = api, L = layout();
        deck.forEach((c, i) => {
          const r = L[i], sx = Math.abs(Math.cos(c.f * Math.PI)), front = c.f > 0.5;
          ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(Math.max(0.02, sx), 1);
          if (front) {
            ctx.fillStyle = c.matched ? '#fff4c9' : '#fff8e7'; api.rr(-r.w / 2, -r.h / 2, r.w, r.h, 12); ctx.fill();
            ctx.strokeStyle = c.matched ? '#ffc62e' : '#e8d5b5'; ctx.lineWidth = 3; ctx.stroke();
            api.emoji(c.e, 0, -r.h * 0.1, r.w * 0.46);
            api.text(c.name, 0, r.h * 0.33, Math.max(11, r.w * 0.13), '#1b2a4a');
          } else {
            ctx.fillStyle = '#c8102e'; api.rr(-r.w / 2, -r.h / 2, r.w, r.h, 12); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; api.rr(-r.w / 2 + 5, -r.h / 2 + 5, r.w - 10, r.h - 10, 9); ctx.stroke();
            api.emoji('💌', 0, -r.h * 0.08, r.w * 0.34);
            api.text('LONDON', 0, r.h * 0.28, Math.max(10, r.w * 0.12), '#fff');
          }
          ctx.restore();
        });
      },
      down(p) {
        if (lock) return;
        const L = layout();
        const i = L.findIndex((r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h);
        if (i < 0) return;
        const c = deck[i];
        if (c.up || c.matched) return;
        c.up = true; open.push(c); api.sfx('tap');
        if (open.length < 2) return;
        moves++;
        const [a, b] = open; open = [];
        if (a.e === b.e) {
          a.matched = b.matched = true; pairs++;
          api.sfx('collect'); api.burst(p.x, p.y, { emojis: ['✨', '💖'], n: 10 });
          api.tip(a.fact, 3600); api.hud('💌 ' + pairs + '/6');
          if (pairs === 6) api.after(1800, () => api.finish(moves <= 9 ? 3 : moves <= 13 ? 2 : 1, 'You matched every London postcard in ' + moves + ' tries! 💌'));
        } else {
          lock = true;
          api.after(900, () => { a.up = b.up = false; lock = false; api.sfx('flip'); });
        }
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 8. Leeds Castle: count the swans, then (at sunset) copy the lantern pattern.
  G.castle = function (api) {
    const COUNTS = [ri(3, 4), ri(5, 6), ri(7, 8)];
    const LANTERN_COLORS = ['#ffb347', '#ff6fa8', '#7fd6ff', '#b98cff'];
    const LANTERN_NOTES = [523, 659, 784, 1047];
    let phase = 'count', round = 0, mistakes = 0, swans = [], counted = -1;
    let seq = [], pos = 0, showing = false, lit = -1, litT = 0, allLit = false;

    const lanterns = () => {
      const S = api.S, y1 = lerp(S.t, S.b, 0.52), y2 = lerp(S.t, S.b, 0.8);
      return [{ x: S.cx - 90, y: y1 }, { x: S.cx + 90, y: y1 }, { x: S.cx - 60, y: y2 }, { x: S.cx + 60, y: y2 }];
    };

    function swanRound() {
      const S = api.S, n = COUNTS[round];
      swans = [];
      let guard = 0;
      while (swans.length < n && guard++ < 500) {
        const s = { x: rnd(S.l + 30, S.r - 30), y: rnd(Math.max(S.t + 40, 430), Math.min(S.b - 70, 600)), vx: rnd(-7, 7), ph: rnd(0, 6), flip: Math.random() < 0.5 };
        if (swans.every((o) => dist(o.x, o.y, s.x, s.y) > 50)) swans.push(s);
      }
      counted = -1;
      const opts = new Set([n]); while (opts.size < 3) opts.add(clamp(n + pick([-2, -1, 1, 2]), 1, 10));
      api.choices([...opts].sort((a, b) => a - b).map((v) => ({ label: String(v), value: v })), answer);
      api.tip('How many <b>swans</b> 🦢 are on the moat? Count carefully!', 0);
      api.hud('🦢 ' + (round + 1) + '/3');
    }
    function answer(v, btn) {
      const n = swans.length;
      if (v !== n) {
        mistakes++; api.sfx('wrong'); btn.disabled = true;
        api.tip('Not quite. Point at each swan and count again! ☝️', 0);
        return;
      }
      api.clearChoices(); api.sfx('honk');
      // count them out loud, one by one
      swans.sort((a, b) => a.x - b.x);
      swans.forEach((s, i) => api.after(i * 330, () => { counted = i; api.float(String(i + 1), s.x, s.y - 40, '#fff'); api.sfx('note', 523 + i * 60); }));
      api.after(n * 330 + 700, () => {
        round++;
        if (round < COUNTS.length) { swanRound(); return; }
        // sunset
        phase = 'sunset'; swans = [];
        api.tip('The sun is setting… 🌅', 0);
        api.setBg(api.assets.bgEvening, 2200);
        if (api.assets.musicEvening) api.setMusic(api.assets.musicEvening);
        api.after(2600, startSimon);
      });
    }

    function startSimon() {
      phase = 'simon'; round = 0; seq = [ri(0, 3), ri(0, 3)];
      api.tip('Light the lanterns! 🏮 <b>Watch</b> the pattern, then <b>tap it</b> back.', 0);
      api.after(1200, play);
    }
    function play() {
      showing = true; pos = 0; api.hud('🏮 ' + (round + 1) + '/4');
      seq.forEach((l, i) => api.after(i * 650, () => flashL(l)));
      api.after(seq.length * 650 + 200, () => { showing = false; api.tip('Your turn! Tap the lanterns in the same order.', 0); });
    }
    function flashL(i) { lit = i; litT = 0.45; api.sfx('note', LANTERN_NOTES[i]); }

    swanRound();

    return {
      update(dt) {
        litT = Math.max(0, litT - dt); if (litT <= 0) lit = -1;
        const S = api.S;
        swans.forEach((s) => { s.x += s.vx * dt; if (s.x < S.l + 24 || s.x > S.r - 24) s.vx *= -1; });
      },
      draw() {
        const { ctx } = api;
        swans.forEach((s, i) => {
          ctx.save(); ctx.translate(s.x, s.y + Math.sin(api.t * 2 + s.ph) * 3);
          if (s.vx > 0) ctx.scale(-1, 1);
          // white swans on pale water need a soft shadow to stand out
          ctx.fillStyle = 'rgba(20,50,90,.28)'; ctx.beginPath(); ctx.ellipse(0, 18, 26, 7, 0, 0, TAU); ctx.fill();
          ctx.shadowColor = 'rgba(0,30,70,.65)'; ctx.shadowBlur = 8;
          api.emoji('🦢', 0, 0, 46);
          ctx.shadowBlur = 0;
          ctx.restore();
          if (i <= counted) api.emoji('✔️', s.x + 16, s.y - 20, 16);
        });
        if (phase === 'simon' || allLit) lanterns().forEach((L, i) => {
          const on = allLit || lit === i;
          const g = ctx.createRadialGradient(L.x, L.y, 4, L.x, L.y, on ? 70 : 34);
          g.addColorStop(0, on ? LANTERN_COLORS[i] : 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(L.x, L.y, on ? 70 : 34, 0, TAU); ctx.fill();
          ctx.globalAlpha = on ? 1 : 0.7; api.emoji('🏮', L.x, L.y, on ? 60 : 50); ctx.globalAlpha = 1;
          ctx.strokeStyle = LANTERN_COLORS[i]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(L.x, L.y + 38, 8, 0, TAU); ctx.stroke();
        });
      },
      down(p) {
        if (phase !== 'simon' || showing) return;
        const i = lanterns().findIndex((L) => dist(p.x, p.y, L.x, L.y) < 48);
        if (i < 0) return;
        flashL(i);
        if (i !== seq[pos]) {
          mistakes++; showing = true; api.sfx('wrong');
          api.tip('Oops! Watch again. 👀', 0);
          api.after(1100, play);
          return;
        }
        pos++;
        if (pos < seq.length) return;
        round++; showing = true;
        if (round >= 4) {
          allLit = true; api.sfx('win');
          api.tip('All the lanterns are glowing! ✨ Time for bed in the castle.', 0);
          api.after(2200, () => api.finish(starsFor(mistakes, 1, 3), 'Goodnight, Leeds Castle! 👑🌙'));
        } else {
          api.sfx('collect'); seq.push(ri(0, 3));
          api.after(900, play);
        }
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 9. The Chunnel: switch tracks to grab the lights and dodge the cones.
  G.tunnel = function (api) {
    const DUR = 30, SEA = ['🐟', '🐠', '🐙', '🦀', '🐬', '🐡', '🐳', '🦑'];
    let el = 0, lane = 1, tx = 0, spawnIn = 0.8, got = 0, total = 0, bumps = 0, stun = 0, speed = 250, dark = 0, white = 0, ending = false, scroll = 0;
    const items = [], holes = [];
    const LW = () => Math.min(92, (api.S.r - api.S.l - 70) / 3);
    const laneX = (i) => api.S.cx + (i - 1) * LW();
    const trainY = () => api.S.b - 90;
    tx = laneX(1);
    for (let i = 0; i < 8; i++) holes.push({ side: i % 2, y: i * 110, e: pick(SEA) });
    api.sfx('whoosh');
    api.tip('Tap the <b>left</b> or <b>right</b> side to switch tracks. Grab the 💡 lights, dodge the 🚧 cones!', 5000);
    api.hud('💡 0');

    return {
      update(dt) {
        const S = api.S;
        white = Math.max(0, white - dt * 1.2);
        dark = ending ? Math.max(0, dark - dt * 0.9) : Math.min(1, dark + dt * 1.5);
        if (!ending) el += dt;
        speed = (250 + 130 * clamp(el / DUR, 0, 1)) * (stun > 0 ? 0.55 : 1);
        stun = Math.max(0, stun - dt);
        scroll += speed * dt;
        tx = lerp(tx, laneX(lane), Math.min(1, dt * 14));
        holes.forEach((h) => { h.y += speed * 0.5 * dt; if (h.y > S.vy1 + 40) { h.y -= 880; h.e = pick(SEA); } });
        spawnIn -= dt;
        if (spawnIn <= 0 && el < DUR - 1.5) {
          spawnIn = 0.62 * 250 / speed + 0.1;
          const free = ri(0, 2);
          for (let l = 0; l < 3; l++) {
            if (l === free) { items.push({ k: 'light', l, y: S.vy0 - 20 }); total++; }
            else if (Math.random() < 0.45) items.push({ k: 'cone', l, y: S.vy0 - 20 });
            else if (Math.random() < 0.5) { items.push({ k: 'light', l, y: S.vy0 - 20 }); total++; }
          }
        }
        const ty = trainY(), myLane = Math.round((tx - laneX(0)) / LW());
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.y += speed * dt;
          if (it.l === myLane && Math.abs(it.y - ty) < 30) {
            items.splice(i, 1);
            if (it.k === 'light') { got++; api.sfx('pop', 700 + (got % 6) * 80); api.burst(laneX(it.l), it.y, { emojis: ['✨'], n: 5, speed: 80 }); }
            else if (stun <= 0) { bumps++; stun = 0.8; api.sfx('bump'); api.float('Bonk!', laneX(it.l), it.y - 30, '#fff'); }
            api.hud('💡 ' + got);
            continue;
          }
          if (it.y > S.vy1 + 30) items.splice(i, 1);
        }
        if (!ending && el >= DUR && !items.length) {
          ending = true; white = 1; api.sfx('found');
          api.tip('Bonjour, <b>France!</b> 🇫🇷', 0);
          const r = got / Math.max(1, total);
          api.after(1800, () => api.finish(r >= 0.75 && bumps <= 1 ? 3 : r >= 0.5 ? 2 : 1, 'You zoomed under the sea and grabbed ' + got + ' lights! 🚄'));
        }
      },
      draw() {
        const { ctx, S } = api;
        if (dark > 0) {
          ctx.save(); ctx.globalAlpha = dark;
          const g = ctx.createLinearGradient(0, S.vy0, 0, S.vy1); g.addColorStop(0, '#0b1224'); g.addColorStop(1, '#1f2c4d');
          ctx.fillStyle = g; ctx.fillRect(S.vx0 - 2, S.vy0 - 2, S.vx1 - S.vx0 + 4, S.vy1 - S.vy0 + 4);
          // portholes to the sea on both walls
          holes.forEach((h) => {
            const x = h.side ? S.vx1 - 26 : S.vx0 + 26;
            ctx.fillStyle = '#1a6fb0'; ctx.beginPath(); ctx.arc(x, h.y, 22, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#8aa0c0'; ctx.lineWidth = 4; ctx.stroke();
            api.emoji(h.e, x, h.y, 24);
          });
          // tracks
          for (let l = 0; l < 3; l++) {
            const x = laneX(l);
            ctx.strokeStyle = '#6b7896'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x - 20, S.vy0); ctx.lineTo(x - 20, S.vy1); ctx.moveTo(x + 20, S.vy0); ctx.lineTo(x + 20, S.vy1); ctx.stroke();
            ctx.strokeStyle = '#3a4560'; ctx.lineWidth = 5;
            for (let y = S.vy0 - 40 + (scroll % 40); y < S.vy1; y += 40) { ctx.beginPath(); ctx.moveTo(x - 28, y); ctx.lineTo(x + 28, y); ctx.stroke(); }
          }
          items.forEach((it) => api.emoji(it.k === 'light' ? '💡' : '🚧', laneX(it.l), it.y, it.k === 'light' ? 34 : 38));
          if (!ending || dark > 0.1) {
            const blink = stun > 0 && Math.floor(api.t * 12) % 2;
            if (!blink) api.emoji('🚄', tx, trainY(), 70, Math.PI / 2);
          }
          // trip progress
          const k = clamp(el / DUR, 0, 1), x0 = S.l + 34, x1 = S.r - 34, by = S.t + 14;
          ctx.fillStyle = 'rgba(255,255,255,.35)'; api.rr(x0, by - 4, x1 - x0, 8, 4); ctx.fill();
          ctx.fillStyle = '#ffd25a'; api.rr(x0, by - 4, (x1 - x0) * k, 8, 4); ctx.fill();
          api.emoji('🇬🇧', x0 - 18, by, 18); api.emoji('🇫🇷', x1 + 18, by, 18);
          ctx.restore();
        }
        if (white > 0) { ctx.fillStyle = 'rgba(255,255,240,' + white + ')'; ctx.fillRect(S.vx0, S.vy0, S.vx1 - S.vx0, S.vy1 - S.vy0); }
      },
      down(p) {
        if (ending) return;
        lane = clamp(lane + (p.x < api.S.cx ? -1 : 1), 0, 2);
        api.sfx('tap');
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 10. Eiffel Tower: tap the circles on the beat to make the tower sparkle
  //     (the notes play "Frère Jacques" as you hit them).
  G.sparkle = function (api) {
    const P = [[143, 572], [267, 572], [158, 528], [252, 528], [205, 488], [172, 455], [238, 455], [188, 392], [222, 392], [205, 318], [197, 240], [213, 240], [205, 160], [205, 85]];
    const F = { C: 523, D: 587, E: 659, F: 698, G: 784 };
    const MEL = [[0, 'C'], [1, 'D'], [2, 'E'], [3, 'C'], [4, 'C'], [5, 'D'], [6, 'E'], [7, 'C'], [8, 'E'], [9, 'F'], [10, 'G'], [12, 'E'], [13, 'F'], [14, 'G']];
    const BEAT = 0.66, START = 2.2, APPROACH = 1.3;
    // notes climb the tower from the bottom to the very top
    const notes = MEL.map(([b, n], i) => ({ t: START + b * BEAT, f: F[n], x: P[i][0], y: P[i][1], st: 'wait' }));
    let el = 0, score = 0, hits = 0, finale = -1, lastBurst = 0;
    api.music(0.08);
    api.tip('Tap each circle <b>when the ring shrinks onto it</b>! ✨ Make the tower sparkle.', 4500);
    api.hud('✨ 0/' + notes.length);

    return {
      update(dt) {
        el += dt;
        notes.forEach((n) => { if (n.st === 'wait' && el > n.t + 0.45) { n.st = 'miss'; } });
        const end = notes[notes.length - 1].t + 1;
        if (finale < 0 && el > end) {
          finale = el; api.sfx('win');
          api.after(2600, () => api.finish(score / (notes.length * 2) >= 0.75 ? 3 : score / (notes.length * 2) >= 0.45 ? 2 : 1, 'You made the Eiffel Tower sparkle! 🗼✨'));
        }
        if (finale >= 0 && el - lastBurst > 0.09 && el - finale < 2.4) {
          lastBurst = el; const p = pick(P);
          api.burst(p[0] + rnd(-20, 20), p[1] + rnd(-20, 20), { emojis: ['✨', '🌟', '⭐'], n: 4, speed: 120 });
        }
      },
      draw() {
        const { ctx } = api;
        notes.forEach((n) => {
          if (n.st === 'hit') { ctx.globalAlpha = 0.6 + 0.4 * Math.sin(api.t * 5 + n.x); api.emoji('✨', n.x, n.y, 22); ctx.globalAlpha = 1; return; }
          if (n.st !== 'wait') return;
          const dtn = n.t - el;
          if (dtn > APPROACH) return;
          const ring = 18 + 52 * Math.max(0, dtn / APPROACH);
          ctx.fillStyle = 'rgba(255,210,90,.35)'; ctx.beginPath(); ctx.arc(n.x, n.y, 18, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
          ctx.strokeStyle = '#ffd25a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(n.x, n.y, ring, 0, TAU); ctx.stroke();
        });
      },
      down(p) {
        let best = null, bd = 1e9;
        notes.forEach((n) => {
          if (n.st !== 'wait') return;
          const dt = Math.abs(el - n.t);
          if (dt < 0.45 && dist(p.x, p.y, n.x, n.y) < 52 && dt < bd) { bd = dt; best = n; }
        });
        if (!best) return;
        const pts = bd <= 0.14 ? 2 : 1;
        best.st = 'hit'; score += pts; hits++;
        api.sfx('note', best.f);
        api.burst(best.x, best.y, { emojis: ['✨', '🌟'], n: pts === 2 ? 12 : 6, speed: 110 });
        api.float(pts === 2 ? 'Perfect!' : 'Good!', best.x, best.y - 30, '#fff');
        api.hud('✨ ' + hits + '/' + notes.length);
      },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 11. Croissants: slide the box to catch pastries (not pigeons!), then
  //     pick Norah's favourite macaron.
  G.catch = function (api) {
    const DUR = 30, MAC = ['#ffb3c7', '#b8e6a0', '#fff1a0', '#c9a27e', '#c7b8ff'];
    let el = 0, bx = api.S.cx, tx = api.S.cx, spawnIn = 0.4, got = 0, good = 0, phase = 'play';
    const items = [], stack = [];
    const feetY = () => api.S.b - 4;
    const boxY = () => feetY() - 70;
    api.tip('Slide your finger to move the box. Catch the 🥐 pastries, but <b>not</b> the pigeons! 🐦', 4500);
    api.hud('🥐 0');

    function macaron(x, y, c, s) {
      const { ctx } = api;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(x, y - 6 * s, 16 * s, 8 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y + 6 * s, 16 * s, 8 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(x - 14 * s, y - 2 * s, 28 * s, 4 * s);
    }

    return {
      update(dt) {
        const S = api.S;
        bx = lerp(bx, tx, Math.min(1, dt * 14));
        if (phase !== 'play') return;
        el += dt;
        spawnIn -= dt;
        if (spawnIn <= 0 && el < DUR) {
          spawnIn = lerp(0.7, 0.45, el / DUR);
          const pigeon = Math.random() < 0.2;
          items.push({ k: pigeon ? 'pigeon' : 'treat', e: pick(['🥐', '🥖', '🍪', 'mac', 'mac']), c: pick(MAC), x: rnd(S.l + 20, S.r - 20), y: S.t + 10, vy: rnd(120, 150) + el * 3, rot: rnd(-1, 1), vr: rnd(-2, 2) });
          if (!pigeon) good++;
        }
        const by = boxY();
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (it.fly) { it.y -= 300 * dt; it.x += 120 * dt; if (it.y < S.vy0 - 40) items.splice(i, 1); continue; }
          it.y += it.vy * dt; it.rot += it.vr * dt;
          if (Math.abs(it.y - by) < 20 && Math.abs(it.x - bx) < 52) {
            if (it.k === 'treat') { items.splice(i, 1); got++; stack.push(it); api.sfx('pop', 650 + (got % 6) * 70); api.float('+1', bx, by - 36, '#fff'); }
            else { it.fly = true; api.sfx('bump'); if (got > 0) { got--; stack.pop(); } api.float('Coo! -1', bx, by - 36, '#ffe4ec'); }
            api.hud('🥐 ' + got);
            continue;
          }
          if (it.y > S.vy1 + 30) items.splice(i, 1);
        }
        if (el >= DUR && !items.some((it) => !it.fly)) {
          phase = 'fav';
          api.tip('Yum! Which macaron is <b>Norah\'s favourite</b>?', 0);
          const FLAV = [['🩷', 'Raspberry'], ['💚', 'Pistachio'], ['💛', 'Lemon'], ['🤎', 'Chocolate']];
          api.choices(FLAV.map(([e, n]) => ({ label: e + ' ' + n, value: n })), (v) => {
            api.clearChoices(); api.store('fav', v); api.sfx('collect');
            api.burst(bx, boxY() - 30, { emojis: ['💖', '✨'], n: 14 });
            const r = got / Math.max(1, good);
            api.after(900, () => api.finish(starsForRatio(r, 0.7, 0.45), 'You caught ' + got + ' treats! Norah\'s favourite macaron: ' + v.toLowerCase() + '. 😋'));
          });
        }
      },
      draw() {
        const { ctx } = api;
        items.forEach((it) => {
          if (it.k === 'pigeon') { api.emoji('🐦', it.x, it.y, 34); return; }
          ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
          if (it.e === 'mac') macaron(0, 0, it.c, 1); else api.emoji(it.e, 0, 0, 34);
          ctx.restore();
        });
        const by = boxY();
        api.sprite('norah', bx, feetY(), 118);
        stack.slice(-6).forEach((it, i) => (it.e === 'mac' ? macaron(bx - 30 + i * 12, by - 22 - (i % 2) * 5, it.c, 0.6) : api.emoji(it.e, bx - 30 + i * 12, by - 22 - (i % 2) * 5, 20)));
        ctx.fillStyle = '#ff9ec9'; api.rr(bx - 46, by - 16, 92, 36, 8); ctx.fill();
        ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(bx - 40 + i * 24, by - 16, 10, 36);
        ctx.strokeStyle = '#e23d8b'; ctx.lineWidth = 3; api.rr(bx - 46, by - 16, 92, 36, 8); ctx.stroke();
      },
      down(p) { tx = clamp(p.x, api.S.l + 40, api.S.r - 40); },
      move(p) { tx = clamp(p.x, api.S.l + 40, api.S.r - 40); },
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 12. Fly Home: press and hold each pup for a big hug, then pop balloons.
  G.hugs = function (api) {
    const S = api.S;
    const pups = [
      { name: 'Penny', spr: 'penny', h: 84, fill: 0, done: false, x: S.vx0 - 80, tx: S.cx - 104, hop: 0 },
      { name: 'Obi', spr: 'obi', h: 74, fill: 0, done: false, x: S.vx1 + 80, tx: S.cx + 104, hop: 0 },
    ];
    let holding = null, heartIn = 0, phase = 'hug', popped = 0, balloonT = 0;
    const balloons = [];
    const feet = () => api.S.b - 30;
    api.tip('Penny and Obi are so happy! <b>Press and hold</b> each pup for a big hug. 🤗', 0);
    api.hud('🤗 0/2');

    return {
      update(dt) {
        pups.forEach((p) => {
          p.x = lerp(p.x, p.tx, Math.min(1, dt * 2.5));
          p.hop = Math.max(0, p.hop - dt * 1.6);
          if (p.done) return;
          if (holding === p) p.fill = Math.min(1, p.fill + dt / 1.3);
          else p.fill = Math.max(0, p.fill - dt * 0.4);
          if (p.fill >= 1) {
            p.done = true; p.hop = 1; holding = null; api.sfx('hug'); api.sfx('woof');
            api.burst(p.x, feet() - p.h / 2, { emojis: ['💖', '💕', '🐾'], n: 20, speed: 170 });
            api.float(p.name + ' missed you! 💛', p.x, feet() - p.h - 36, '#fff');
            const n = pups.filter((q) => q.done).length;
            api.hud('🤗 ' + n + '/2');
            if (n === 2) {
              phase = 'balloons';
              api.tip('Welcome home! 🏠 Pop the balloons! 🎈', 0);
              api.after(9000, () => api.finish(3, 'Welcome home, Norah! What a big vacation! 🏠💛'));
            }
          }
        });
        if (holding && !holding.done) {
          heartIn -= dt;
          if (heartIn <= 0) { heartIn = 0.15; api.burst(holding.x, feet() - holding.h, { emojis: ['💕'], n: 1, speed: 60 }); }
        }
        if (phase === 'balloons') {
          balloonT -= dt;
          if (balloonT <= 0) { balloonT = 0.45; balloons.push({ x: rnd(api.S.l + 30, api.S.r - 30), y: api.S.vy1 + 40, v: rnd(70, 110), ph: rnd(0, 6), c: pick(['🎈']) }); }
          for (let i = balloons.length - 1; i >= 0; i--) { const b = balloons[i]; b.y -= b.v * dt; if (b.y < api.S.vy0 - 60) balloons.splice(i, 1); }
        }
      },
      draw() {
        const f = feet();
        api.sprite('norah', api.S.cx, f, 123);
        api.sprite('camile', api.S.cx + 30, f - 40, 52);
        pups.forEach((p) => {
          const hy = Math.abs(Math.sin(p.hop * Math.PI * 3)) * 26 * p.hop;
          api.sprite(p.spr, p.x, f + 6 - hy, p.h, { flip: p.spr === 'obi' });
          const hx = p.x, hyy = f - p.h - 30;
          if (!p.done) {
            const { ctx } = api;
            ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(hx, hyy, 20, 0, TAU); ctx.stroke();
            ctx.strokeStyle = '#ff5ca8'; ctx.beginPath(); ctx.arc(hx, hyy, 20, -Math.PI / 2, -Math.PI / 2 + TAU * p.fill); ctx.stroke();
            api.emoji(p.fill > 0 ? '💗' : '🤍', hx, hyy, 22);
          } else api.emoji('💖', hx, hyy, 28);
        });
        balloons.forEach((b) => api.emoji(b.c, b.x + Math.sin(api.t * 2 + b.ph) * 10, b.y, 46));
      },
      down(p) {
        if (phase === 'balloons') {
          for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            if (dist(p.x, p.y, b.x, b.y) < 32) {
              balloons.splice(i, 1); popped++; api.sfx('pop', 900);
              api.burst(b.x, b.y, { colors: ['#ff5ca8', '#ffd25a', '#6fe0c0', '#7fb6ff'], n: 16, speed: 180 });
              return;
            }
          }
          return;
        }
        const f = feet();
        holding = pups.find((q) => !q.done && Math.abs(p.x - q.x) < 50 && p.y > f - q.h - 50 && p.y < f + 20) || null;
      },
      up() { holding = null; },
    };
  };

  window.NVgames = G;
})();
