/* art.js — all cartoon art as inline SVG (no image files).
   Exposes window.NVart with the scene + character builders. */
(function () {
  'use strict';

  // Scene geometry (portrait). Shared with game.js for the wheel math.
  var VIEW_W = 400, VIEW_H = 700;
  var WHEEL = { cx: 138, cy: 286, r: 136 };
  var POD_COUNT = 16;
  var OUR_POD = 0; // index of Norah's pod (starts at the bottom)

  // ── Cartoon people ──────────────────────────────────────────────
  // Each returns a <g> centered near (0,0), ~46 units tall, feet at y=0.
  function norah() {
    return ''
      + '<g>'
      // legs
      + '<rect x="-7" y="-12" width="5" height="12" rx="2.5" fill="#f1c9a5"/>'
      + '<rect x="2" y="-12" width="5" height="12" rx="2.5" fill="#f1c9a5"/>'
      + '<rect x="-8" y="-3" width="6" height="4" rx="2" fill="#fff"/>'
      + '<rect x="2" y="-3" width="6" height="4" rx="2" fill="#fff"/>'
      // pink dress
      + '<path d="M-11 -28 Q0 -32 11 -28 L8 -12 Q0 -9 -8 -12 Z" fill="#ff5ca8"/>'
      + '<path d="M-9 -28 Q0 -31 9 -28 L9 -23 Q0 -25 -9 -23 Z" fill="#ff7ab8"/>'
      // head
      + '<circle cx="0" cy="-37" r="8.5" fill="#f6d2ad"/>'
      // brown hair (bob, half-up)
      + '<path d="M-9 -37 Q-10 -48 0 -48 Q10 -48 9 -37 Q9 -41 0 -42 Q-9 -41 -9 -37 Z" fill="#7a4a23"/>'
      + '<path d="M-9 -38 Q-11 -31 -8 -29 L-6 -36 Z" fill="#7a4a23"/>'
      + '<path d="M9 -38 Q11 -31 8 -29 L6 -36 Z" fill="#7a4a23"/>'
      + '<circle cx="0" cy="-47" r="2.4" fill="#7a4a23"/>'
      // face
      + '<circle cx="-3" cy="-37" r="1.2" fill="#3a2a1a"/>'
      + '<circle cx="3" cy="-37" r="1.2" fill="#3a2a1a"/>'
      + '<path d="M-3 -33 Q0 -31 3 -33" stroke="#c8607a" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
      + '</g>';
  }

  function mommo() {
    return ''
      + '<g>'
      + '<rect x="-7" y="-13" width="6" height="13" rx="3" fill="#2c2c3a"/>'
      + '<rect x="1" y="-13" width="6" height="13" rx="3" fill="#2c2c3a"/>'
      // mint top
      + '<path d="M-12 -32 Q0 -36 12 -32 L9 -13 Q0 -10 -9 -13 Z" fill="#6fe0c0"/>'
      + '<rect x="-9" y="-16" width="18" height="4" fill="#2c2c3a"/>'
      // head
      + '<circle cx="0" cy="-41" r="8.5" fill="#e9c39c"/>'
      // dark hair pulled back + bun
      + '<path d="M-9 -41 Q-10 -52 0 -52 Q10 -52 9 -41 Q6 -47 0 -47 Q-6 -47 -9 -41 Z" fill="#3a2418"/>'
      + '<circle cx="0" cy="-52" r="3" fill="#3a2418"/>'
      + '<circle cx="-3" cy="-41" r="1.2" fill="#3a2a1a"/>'
      + '<circle cx="3" cy="-41" r="1.2" fill="#3a2a1a"/>'
      + '<path d="M-3 -37 Q0 -35 3 -37" stroke="#b06070" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
      + '</g>';
  }

  function camile(scale) {
    scale = scale || 1;
    return '<g transform="scale(' + scale + ')">'
      // teal boots
      + '<rect x="-7" y="-10" width="5" height="10" rx="2.5" fill="#27c2c2"/>'
      + '<rect x="2" y="-10" width="5" height="10" rx="2.5" fill="#27c2c2"/>'
      // pink tutu dress
      + '<path d="M-11 -22 L11 -22 L14 -10 Q0 -6 -14 -10 Z" fill="#ff8fc4"/>'
      + '<path d="M-9 -26 Q0 -29 9 -26 L11 -22 L-11 -22 Z" fill="#ff5ca8"/>'
      // head
      + '<circle cx="0" cy="-33" r="8" fill="#f8d9b8"/>'
      // blonde wavy hair
      + '<path d="M-9 -33 Q-11 -45 0 -45 Q11 -45 9 -33 Q11 -27 7 -24 L5 -32 Q0 -39 -5 -32 L-7 -24 Q-11 -27 -9 -33 Z" fill="#ffd874"/>'
      // blue eyes
      + '<circle cx="-3" cy="-33" r="1.4" fill="#3a8fd0"/>'
      + '<circle cx="3" cy="-33" r="1.4" fill="#3a8fd0"/>'
      + '<path d="M-2.5 -29 Q0 -27.5 2.5 -29" stroke="#d06a86" stroke-width="1.1" fill="none" stroke-linecap="round"/>'
      + '</g>';
  }

  // Little round Camile badge used as the hidden collectible.
  function camileBadge() {
    return ''
      + '<g>'
      + '<circle cx="0" cy="0" r="9" fill="#fff" stroke="#ffd25a" stroke-width="2"/>'
      + '<path d="M-6 -1 Q-7 -8 0 -8 Q7 -8 6 -1 Q7 2 4 3 L2 -2 Q0 -5 -2 -2 L-4 3 Q-7 2 -6 -1 Z" fill="#ffd874"/>'
      + '<circle cx="0" cy="-1" r="4.5" fill="#f8d9b8"/>'
      + '<circle cx="-1.6" cy="-1" r="0.9" fill="#3a8fd0"/>'
      + '<circle cx="1.6" cy="-1" r="0.9" fill="#3a8fd0"/>'
      + '<path d="M-1.5 1.4 Q0 2.4 1.5 1.4" stroke="#d06a86" stroke-width="0.8" fill="none" stroke-linecap="round"/>'
      + '</g>';
  }

  // Invisible tappable region over a painted feature.
  function hotspotRect(id, x, y, w, h) {
    return '<rect id="' + id + '" class="hotspot-rect" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>';
  }
  // Pulsing gold ring marking where to tap (hidden until its phase).
  function marker(id, cx, cy, r) {
    return '<circle id="' + id + '" class="sight-marker pod-glow" cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="display:none"/>';
  }

  // ── Painted character sprites (sliced from the lineup sheet) ──
  // Pixel dims preserve relative scale; SPRITE_SCALE maps px -> viewBox units.
  var SPRITE = 'assets/images/sprites/';
  var DIMS = {
    norah: [204, 628], camile: [268, 617], mommo: [258, 814],
    daddo: [277, 919], penny: [185, 429], obi: [278, 378]
  };
  var SPRITE_SCALE = 0.196; // tune overall character size on screen
  // per-character display scale (corrects for different sprite framing)
  var BASE = { camile: 0.78 };
  // Place a STATIC sprite by its FEET point (feetX, feetY) in viewBox coords.
  function sprite(name, feetX, feetY, scaleMul) {
    var d = DIMS[name]; if (!d) return '';
    var s = SPRITE_SCALE * (BASE[name] || 1) * (scaleMul || 1);
    var w = d[0] * s, h = d[1] * s;
    return '<image href="' + SPRITE + 'char-' + name + '.png" x="' + (feetX - w / 2).toFixed(1)
      + '" y="' + (feetY - h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1)
      + '" preserveAspectRatio="xMidYMax meet"/>';
  }

  // On-screen pixel size of a sprite (for movement/proximity math).
  function size(name) {
    var d = DIMS[name]; var s = SPRITE_SCALE * (BASE[name] || 1);
    return { w: d[0] * s, h: d[1] * s };
  }
  // A MOVABLE character: image drawn around its feet origin (0,0) so game.js
  // can position it with transform="translate(x,y) scale(face,1)".
  function movable(name) {
    var sz = size(name);
    return '<g class="mover" id="m-' + name + '">'
      + '<image href="' + SPRITE + 'char-' + name + '.png" x="' + (-sz.w / 2).toFixed(1)
      + '" y="' + (-sz.h).toFixed(1) + '" width="' + sz.w.toFixed(1) + '" height="' + sz.h.toFixed(1)
      + '" preserveAspectRatio="xMidYMax meet"/></g>';
  }

  // ── Generic chapter OVERLAY, built from chapter data ──
  // Drawn on top of the painted background. Coordinates are in the 400×700
  // viewBox, which shares the background's 4:7 ratio. ch = chapter config:
  //   { ride, items:[{icon,x,y}], camile:{x,y}, chars:[{name,x,y,scale}] }
  function scene(ch) {
    ch = ch || {};
    var s = '<svg viewBox="0 0 ' + VIEW_W + ' ' + VIEW_H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';

    // optional "ride" tap target (London Eye)
    if (ch.ride) s += hotspotRect('ride-wheel', 110, 150, 150, 245) + marker('mark-ride', 185, 262, 70);

    // static NPCs along the bottom (everyone except the playable Norah & Camile)
    s += '<g id="chars">';
    (ch.chars || []).forEach(function (c) {
      if (c.name === 'norah' || c.name === 'camile') return;
      s += sprite(c.name, c.x, c.y != null ? c.y : 668, c.scale);
    });
    s += '</g>';

    // collectible items (emoji tokens with a pulsing ring)
    s += '<g id="items">';
    (ch.items || []).forEach(function (it, i) {
      s += '<g class="item hotspot" id="item-' + i + '">'
        + '<circle class="item-ring pod-glow" cx="' + it.x + '" cy="' + it.y + '" r="26"/>'
        + '<text x="' + it.x + '" y="' + (it.y + 13) + '" text-anchor="middle" font-size="36">' + it.icon + '</text>'
        + '<circle class="item-hit" cx="' + it.x + '" cy="' + it.y + '" r="30"/>'
        + '</g>';
    });
    s += '</g>';

    // hidden Camile (outer g positions; inner is transform-free for the pop)
    if (ch.camile) {
      s += '<g transform="translate(' + ch.camile.x + ',' + ch.camile.y + ') scale(0.95)">'
        + '<g id="hiddenCamile" class="hotspot">' + camileBadge() + '</g></g>';
    }

    // playable characters (Camile follows behind, so draw her first; Norah on top)
    s += movable('camile') + movable('norah');

    s += '</svg>';
    return s;
  }

  function defs() {
    return '<defs>'
      + '<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#22386b"/>'
      + '<stop offset="0.5" stop-color="#5b6fa6"/>'
      + '<stop offset="0.8" stop-color="#e8a07a"/>'
      + '<stop offset="1" stop-color="#ffd0a3"/>'
      + '</linearGradient>'
      + '<radialGradient id="sunGrad"><stop offset="0" stop-color="#fff2c4" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd0a3" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f5f8a"/><stop offset="1" stop-color="#2a4467"/></linearGradient>'
      + '<radialGradient id="podGlow"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>'
      + '</defs>';
  }

  function stars() {
    var s = '', pts = [[40,60],[90,40],[150,80],[210,50],[260,90],[320,40],[360,80],[70,110],[300,120],[180,30]];
    for (var i = 0; i < pts.length; i++) {
      s += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="' + (1 + (i % 3) * 0.6) + '" fill="#fff"/>';
    }
    return s;
  }

  function skyline() {
    return '<g fill="#3d4f78" opacity="0.6">'
      + '<rect x="0" y="400" width="40" height="52"/>'
      + '<rect x="44" y="380" width="26" height="72"/>'
      + '<rect x="350" y="395" width="50" height="57"/>'
      + '<rect x="320" y="410" width="26" height="42"/>'
      + '</g>';
  }

  function parliament() {
    return '<g id="parliament">'
      + '<g fill="#b7a98c" opacity="0.92">'
      + '<rect x="296" y="372" width="86" height="80"/>'
      + '<rect x="300" y="360" width="10" height="14"/><rect x="316" y="360" width="10" height="14"/>'
      + '<rect x="332" y="360" width="10" height="14"/><rect x="348" y="360" width="10" height="14"/>'
      + '<rect x="364" y="360" width="10" height="14"/>'
      + '</g>'
      // Big Ben tower — a tappable sight
      + '<g id="sight-bigben" class="hotspot">'
      + '<rect x="356" y="300" width="22" height="152" fill="#c9b994"/>'
      + '<rect x="356" y="316" width="22" height="22" fill="#a99a76"/>'
      + '<circle cx="367" cy="327" r="7" fill="#fff"/>'
      + '<path d="M367 327 L367 322 M367 327 L371 329" stroke="#3a2a1a" stroke-width="1.2" stroke-linecap="round"/>'
      + '<path d="M356 300 L367 286 L378 300 Z" fill="#8c7d5c"/>'
      + '<rect x="364" y="278" width="6" height="9" fill="#8c7d5c"/>'
      + '</g>'
      + '</g>';
  }

  function bridge() {
    return '<g id="bridge">'
      + '<rect x="0" y="450" width="400" height="12" fill="#6b7a99"/>'
      + '<g stroke="#56657f" stroke-width="3">'
      + '<line x1="40" y1="462" x2="40" y2="474"/><line x1="120" y1="462" x2="120" y2="474"/>'
      + '<line x1="280" y1="462" x2="280" y2="474"/><line x1="360" y1="462" x2="360" y2="474"/>'
      + '</g>'
      // red double-decker bus — a tappable sight
      + '<g id="sight-bus" class="hotspot">'
      + '<rect x="40" y="426" width="58" height="26" rx="4" fill="#e23b3b"/>'
      + '<rect x="40" y="438" width="58" height="3" fill="#fff"/>'
      + '<rect x="45" y="429" width="9" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="57" y="429" width="9" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="69" y="429" width="9" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="81" y="429" width="12" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="45" y="443" width="10" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="58" y="443" width="10" height="7" rx="1" fill="#bfe3ff"/>'
      + '<rect x="71" y="443" width="10" height="7" rx="1" fill="#bfe3ff"/>'
      + '<circle cx="52" cy="453" r="4" fill="#222"/><circle cx="86" cy="453" r="4" fill="#222"/>'
      + '</g>'
      + '</g>';
  }

  function boat() {
    return '<g id="sight-boat" class="hotspot">'
      + '<path d="M150 512 L214 512 L206 526 L158 526 Z" fill="#f4f1e8"/>'
      + '<rect x="166" y="500" width="34" height="13" rx="2" fill="#d9e4ee"/>'
      + '<rect x="170" y="503" width="7" height="7" fill="#7fb6e0"/>'
      + '<rect x="180" y="503" width="7" height="7" fill="#7fb6e0"/>'
      + '<rect x="190" y="503" width="7" height="7" fill="#7fb6e0"/>'
      + '<rect x="181" y="492" width="3" height="9" fill="#b0432f"/>'
      + '</g>';
  }

  function hotel() {
    // County Hall — long classical building, warm-lit windows, to the right.
    var s = '<g id="hotel">'
      + '<rect x="250" y="372" width="150" height="100" fill="#cdb89a"/>'
      + '<rect x="250" y="366" width="150" height="8" fill="#b59f80"/>'
      + '<rect x="250" y="372" width="150" height="100" fill="url(#riverGrad)" opacity="0.0"/>';
    // rows of lit windows
    var colX = [258, 272, 286, 300, 314, 328, 342, 356, 370, 384];
    var rowY = [384, 402, 420, 438];
    for (var r = 0; r < rowY.length; r++) {
      for (var c = 0; c < colX.length; c++) {
        // leave one window for the hidden Camile (handled below)
        if (r === 2 && c === 7) continue;
        s += '<rect x="' + colX[c] + '" y="' + rowY[r] + '" width="8" height="11" rx="1" fill="#ffdf91" opacity="0.92"/>';
      }
    }
    // a soft blue wash like the photo's uplighting
    s += '<rect x="250" y="372" width="150" height="100" fill="#5fa8e6" opacity="0.12"/>';
    // hidden Camile badge tucked into one window.
    // Outer <g> positions; inner #hiddenCamile is transform-free so it can take
    // the 'spotted' pop animation without losing its placement.
    s += '<g transform="translate(360,425) scale(0.85)"><g id="hiddenCamile" class="hotspot">' + camileBadge() + '</g></g>';
    s += '</g>';
    return s;
  }

  function railings() {
    var s = '<line x1="0" y1="572" x2="400" y2="572"/>';
    for (var x = 20; x < 400; x += 40) s += '<line x1="' + x + '" y1="566" x2="' + x + '" y2="590"/>';
    return s;
  }

  // The London Eye structure. Pods are injected into #podsLayer by game.js.
  function wheel() {
    var cx = WHEEL.cx, cy = WHEEL.cy, r = WHEEL.r;
    var s = '<g id="wheel">';
    // support A-frame legs down to the embankment
    s += '<g stroke="#dfe9f2" stroke-width="7" stroke-linecap="round">'
      + '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx - 38) + '" y2="600"/>'
      + '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + 38) + '" y2="600"/>'
      + '</g>';
    // outer rim (double ring)
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#eaf4ff" stroke-width="6"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 9) + '" fill="none" stroke="#cfe2f0" stroke-width="2"/>';
    // spokes (rotated as a group by game.js)
    s += '<g id="spokes" stroke="#bcd4e8" stroke-width="1.6" opacity="0.9">';
    for (var i = 0; i < POD_COUNT; i++) {
      var a = (i / POD_COUNT) * Math.PI * 2;
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r * Math.sin(a)).toFixed(1) + '"/>';
    }
    s += '</g>';
    // hub
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#eaf4ff" stroke="#9fc4dd" stroke-width="2"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#9fc4dd"/>';
    // pods go here
    s += '<g id="podsLayer"></g>';
    s += '</g>';
    return s;
  }

  // One gondola pod. cx,cy = center; highlight = our pod.
  function podSVG(cx, cy, highlight, withPeople) {
    var s = '<g class="pod" transform="translate(' + cx + ',' + cy + ')">';
    if (highlight) s += '<circle class="pod-glow" cx="0" cy="0" r="34" fill="url(#podGlow)"/>';
    s += '<ellipse cx="0" cy="0" rx="15" ry="9" fill="' + (highlight ? '#ffe7a6' : '#cfe2f0') + '" stroke="' + (highlight ? '#ffb938' : '#9fc4dd') + '" stroke-width="' + (highlight ? 2.5 : 1.5) + '"/>';
    s += '<ellipse cx="0" cy="-1" rx="11" ry="6" fill="' + (highlight ? '#fff3cf' : '#bfe6ff') + '" opacity="0.9"/>';
    if (withPeople) {
      s += '<g id="podPeople" style="display:none">'
        + '<g transform="translate(-5,4) scale(0.34)">' + mommo() + '</g>'
        + '<g transform="translate(3,4) scale(0.34)">' + norah() + '</g>'
        + '<g transform="translate(9,4) scale(0.26)">' + camile() + '</g>'
        + '</g>';
    }
    // bobbing finger hint (opacity-animated; never uses transform so the pod's
    // translate is preserved). Hidden once aboard.
    if (highlight) s += '<text id="podHint" class="pod-glow" x="0" y="38" text-anchor="middle" font-size="24">👆</text>';
    s += '</g>';
    return s;
  }

  window.NVart = {
    VIEW_W: VIEW_W, VIEW_H: VIEW_H, WHEEL: WHEEL, POD_COUNT: POD_COUNT, OUR_POD: OUR_POD,
    scene: scene, podSVG: podSVG, norah: norah, mommo: mommo, camile: camile, camileBadge: camileBadge
  };
})();
