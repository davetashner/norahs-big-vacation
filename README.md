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
| `index.html` | Markup + overlays (passport, celebration) |
| `styles.css` | Mobile-first layout, animations |
| `art.js` | `window.NVart` — all cartoon art as inline SVG (people, scene, London Eye, pods) |
| `audio.js` | `window.NVaudio` — SFX synthesized with Web Audio (no audio files) |
| `game.js` | `CHAPTERS`/`SIGHTS` data, the London Eye state machine, passport, save |

## Adding the other chapters
`game.js` is structured around a phase state machine and a `CHAPTERS` array. To
add a chapter: build its scene in `art.js`, add its `SIGHTS`/collectibles + phase
flow in `game.js`, and reuse the passport + hidden-Camile + celebration systems.
See `GAME_SPEC.md` in this repo for the full 12-chapter design.

## Characters
Norah (brown bob, hot-pink dress) · Camile (blonde, pink tutu, teal boots) ·
Mommo (dark hair, mint top) · Daddo (cap + glasses) · pups Penny & Obi.
