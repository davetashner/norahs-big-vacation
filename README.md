# Norah's Big Vacation 🎡

A fully-offline, tap-only, all-cartoon **explore-and-collect** storybook game of
Norah's real trip to England & France. Built for a confident 7–8-year-old to play
on a mobile browser (e.g. on a plane).

This is a **standalone static site** — `index.html` at the repo root loads the
plain `<script>` files below. No build step, no dependencies. Open `index.html`
directly in a browser, or deploy the repo as static hosting (GitHub Pages /
Vercel / Netlify).

## Status
**Vertical slice:** Chapter 5 — *The London Eye* is fully playable. The other 11
chapters appear (locked) in the passport and are not built yet.

## How it plays
Everything is a tap. Board the glowing pod → tap the wheel to ride up → tap the
London sights (Big Ben, red bus, river boat) → find the hidden Camile → earn the
ferris-wheel **passport stamp**. Progress saves to `localStorage`.

## Files (no build step, plain `<script>` globals)
| File | Role |
| --- | --- |
| `index.html` | Markup: `#scene` (painted `#bg` + SVG `#stage` overlay), `<audio>`, overlays |
| `styles.css` | Mobile-first layout, animations, scene zoom |
| `art.js` | `window.NVart` — SVG **overlay** (tap hotspots, guide rings, characters) |
| `assets.js` | `window.NVassets` — manifest: chapter → background image + music file |
| `audio.js` | `window.NVaudio` — Web Audio SFX **+** looping `<audio>` music; mute controls both |
| `game.js` | `CHAPTERS`/`SIGHTS` data, the London Eye state machine, passport, save |

## Assets
`assets/images/*.png` are full **painted backgrounds** (portrait 4:7, same ratio as
the 400×700 SVG viewBox, so tap hotspots line up). `assets/music/*.m4a` are looping
chapter themes. Wire a new file by adding it to `assets/` and referencing it in
`assets.js`. The background and overlay live in `#scene` and zoom together, so
hotspot taps stay aligned with the artwork even during the "ride up" zoom.

## Adding the other chapters
`game.js` is structured around a phase state machine and a `CHAPTERS` array. To
add a chapter: build its scene in `art.js`, add its `SIGHTS`/collectibles + phase
flow in `game.js`, and reuse the passport + hidden-Camile + celebration systems.
See `GAME_SPEC.md` in this repo for the full 12-chapter design.

## Characters
Norah (brown bob, hot-pink dress) · Camile (blonde, pink tutu, teal boots) ·
Mommo (dark hair, mint top) · Daddo (cap + glasses) · pups Penny & Obi.
