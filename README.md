# Norah's Big Vacation 🎡

A fully-offline, tap-only, all-cartoon **explore-and-collect** storybook game of
Norah's real trip to England & France. Built for a confident 7–8-year-old to play
on a mobile browser (e.g. on a plane).

This is a **standalone static site** — `index.html` at the repo root loads the
plain `<script>` files below. No build step, no dependencies. Open `index.html`
directly in a browser, or deploy the repo as static hosting (GitHub Pages /
Vercel / Netlify).

## Status
**All 12 chapters playable** end to end, each with its own mini-game. Chapter 8
(Leeds Castle) fades from day to evening mid-chapter. A dedicated reunion
background and a few bespoke music tracks are still TODO (see `assets.js`).

## How it plays
Everything is a tap (or a drag). Each chapter: read the story card, play that
place's mini-game, earn **1–3 stars** and a **passport stamp**, then travel on.
Camile hides in every painting (peeking out from somewhere); finding her is a
bonus, never required. There is no losing: every game finishes, and stars
reward how well it went, so it's worth replaying. The passport (📖) shows the
stamps, stars and Camiles found, and doubles as a chapter picker. Progress
saves to `localStorage`.

| # | Chapter | Mini-game |
| --- | --- | --- |
| 1 | Goodbye Pups | Drag Norah's things into the suitcase and the pups' toys onto their bed, then hug Penny and Obi |
| 2 | To the Airport | Spot our family's bags (colour + sticker) on the moving baggage belt |
| 3 | Fly to New York | Hold to climb, let go to glide; catch stars and dodge birds |
| 4 | Night Flight | Join the stars 1, 2, 3… to draw a house, a heart, a crown and a star |
| 5 | The London Eye | Tap to snap a photo when our pod reaches the very top |
| 6 | Daddo's Train | Find Daddo in the passing train windows and blow him kisses |
| 7 | London & Mommo | Postcard memory match, with a fun London fact for each pair |
| 8 | Leeds Castle | Count the swans, then (at sunset) repeat the lantern light pattern |
| 9 | The Chunnel | Switch tracks under the sea to grab lights and dodge cones |
| 10 | Eiffel Tower | Tap the rings on the beat to play "Frère Jacques" and make the tower sparkle |
| 11 | Croissants | Catch falling pastries (not pigeons!), then pick Norah's favourite macaron |
| 12 | Fly Home | Press and hold each pup for a welcome-home hug, then pop balloons |

## Files (no build step, plain `<script>` globals)
| File | Role |
| --- | --- |
| `index.html` | Markup: `#scene` (painted `#bg`/`#bg2` + game `<canvas>`), `<audio>`, overlays |
| `styles.css` | Mobile-first layout, story card, buttons, passport, celebration |
| `assets.js` | `window.NVassets`: chapter → background image + music file |
| `audio.js` | `window.NVaudio`: Web Audio SFX **+** looping `<audio>` music; mute controls both |
| `games.js` | `window.NVgames`: the 12 mini-games |
| `game.js` | Chapters, the canvas runner and drawing helpers, hidden Camile, stars, passport, save |

## Assets
`assets/images/*.png` are full **painted backgrounds** (portrait 4:7, same ratio as
the 400×700 SVG viewBox, so tap hotspots line up). `assets/music/*.m4a` are looping
chapter themes. Wire a new file by adding it to `assets/` and referencing it in
`assets.js`. The background and overlay live in `#scene` and zoom together, so
hotspot taps stay aligned with the artwork even during the "ride up" zoom.

## Adding or changing a mini-game
Everything moving is drawn on one canvas in the painting's own **400×700**
coordinates (`game.js` cover-fits both the painting and the canvas to the
screen, so they always line up). A mini-game is a factory in `games.js`:
`NVgames.name = function (api) { return { update(dt), draw(ctx), down(p), move(p), up(p) }; }`.
`api` gives drawing helpers (`emoji`, `sprite`, `text`, `rr`, `burst`, `float`),
`sfx`, `tip`, `hud`, `choices`, `after`, `setBg`, `zoom`, the visible play area
`api.S`, and `finish(stars, line)`. Point a chapter at it with `game:` in
`CHAPTERS` (`game.js`), along with where Camile hides.

## Characters
Norah (brown bob, hot-pink dress) · Camile (blonde, pink tutu, teal boots) ·
Mommo (dark hair, mint top) · Daddo (cap + glasses) · pups Penny & Obi.
