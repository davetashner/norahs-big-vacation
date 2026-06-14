# Norah's Big Vacation — Game Design Spec

> A fully-offline, tap-only, all-cartoon **explore-and-collect** storybook game that
> mirrors Norah's real trip from home (Richmond VA) to **London** and **Paris** and
> back. Built for Norah (age 7–8, confident reader) to play on a **mobile browser
> on the plane**. Deployed on **norahtashner.com**.

- **Spec status:** Draft (decisions locked, character details pending)
- **Last updated:** 2026-06-14
- **For:** Norah
- **Companion:** Camile, her doll

---

## 1. Design Decisions (locked)

| Decision | Choice |
| --- | --- |
| Player | Norah, age 7–8, confident reader |
| Genre | Explore & collect storybook (chapter per trip leg) |
| Art | All cartoon illustration |
| Controls | **Tap only** (phone/touch first — no keyboard) |
| Audio | **SFX only** + easy mute button (headphone-optional) |
| Offline | **Fully offline**, self-contained — must work with no wifi in flight |
| Personalization | Fully personal — real names & cartoon likenesses |
| Collectibles | **Passport stamp per chapter** + a **hidden Camile** to find in every scene |

---

## 2. Deployment (matches existing site pattern)

The site already ships a self-contained game at `public/games/unikittyville/`
(vanilla JS, shown through an iframe in `src/pages/GamePage.jsx`). Norah's game
follows the same pattern:

```
public/games/norahs-big-vacation/
  index.html          # entry; loads modules, sets up canvas/DOM
  game.js             # main loop, chapter state machine, save/restore
  chapters.js         # data for each chapter (scene, items, collectibles)
  scene.js            # render a scene + tappable hotspots
  passport.js         # passport/sticker book UI + hidden-Camile tracker
  audio.js            # SFX playback + mute toggle
  ui.js               # buttons, dialog/narration, transitions
  assets/
    images/           # cartoon backgrounds, characters, stamps, items
    sfx/              # short tap/collect/win sounds
```

- **Touch-first** (Unikittyville is keyboard/arrow-key; this one is tap/drag).
- **No build step** for the game itself — plain JS so it loads offline.
- New React page `VacationGamePage.jsx` + route, iframing
  `/games/norahs-big-vacation/index.html` (mirrors `GamePage.jsx`).
- Because it's on a plane: ship as a regular page **and** make sure all assets are
  local (no CDNs). Optionally add a tiny service worker so a pre-flight visit
  caches everything for guaranteed offline play.

---

## 3. Core Loop

1. **Arrive** at a new place (a short narrated intro card, 1–2 sentences).
2. **Explore** the scene by tapping — characters, objects, and animals react
   with little animations and sounds.
3. **Do the chapter's activity** (e.g. ride the London Eye, climb the Eiffel
   Tower) — a simple, no-fail tap interaction.
4. **Find the hidden Camile** tucked somewhere in the scene.
5. **Earn the passport stamp** — a satisfying stamp-thunk animation in the book.
6. **Travel on** — tap the "Next" vehicle (car, plane, train, Chunnel) to the
   next chapter.

No timers, no losing, no dead ends — cozy and re-playable for a whole flight.

---

## 4. Collectibles & Progress

### 4.1 Passport (the spine of progression)
A passport/sticker book the player can open anytime. One page per chapter; a
stamp lands when the chapter's activity is done.

| Chapter | Stamp |
| --- | --- |
| Goodbye to the Pups | Paw print |
| Drive to the Airport | Little car |
| Fly to New York | Airplane |
| Overnight to London | Moon + stars |
| The London Eye | Ferris wheel |
| Daddy's Train | Train |
| Around London with Mom | Double-decker bus / Big Ben |
| Leeds Castle Sleepover | Crown |
| The Chunnel to France | Tunnel |
| Up the Eiffel Tower | Eiffel Tower |
| Croissants & Macarons | Macaron |
| Fly Home (Boston → Richmond) | Home / heart |

### 4.2 Hidden Camile (the hunt)
Camile (blonde shoulder-length hair, blue eyes, **hot-pink dress**) is hidden
once in every scene. Tapping her gives a happy chime and adds a "Found Camile!"
checkmark. A running counter (e.g. "Camile found: 7 / 12") rewards 100%.

### 4.3 Optional sparkle items
A few tappable extras per scene (the pups' toys, a red London bus, a swan on the
moat, a croissant) that pop and sparkle — pure delight, no penalty for missing.

---

## 5. Chapters (the trip → the game)

> Real-photo references you provided are noted to guide the cartoon art.

### Ch 1 — Goodbye to the Pups 🐾  *(Home, Richmond VA)*
- **Beat:** A sweet, slightly sad goodbye. Hug and give a treat to the two pups.
- **Tap activity:** Pet each pup (they wag/wiggle), put a treat in each bowl.
- **Hidden Camile:** peeking from the suitcase by the door.
- **Stamp:** Paw print. *Emotional note: keep it warm, not weepy — "We'll be home soon!"*

### Ch 2 — Drive to the Airport 🚗  *(with Camile)*
- **Beat:** Buckle up Camile, drive off, wave bye to the house.
- **Tap activity:** "Don't forget Camile!" — tap to grab her, then tap things out
  the window (trees, other cars, a plane in the sky).
- **Hidden Camile:** she's the buckle-up character — instead hide a pup toy.
- **Stamp:** Car.

### Ch 3 — Fly to New York ✈️
- **Beat:** First flight, a short hop. Take off through the clouds.
- **Tap activity:** Tap clouds/birds as the plane climbs; tap the seatbelt sign.
- **Hidden Camile:** in the seat-back pocket.
- **Stamp:** Airplane.

### Ch 4 — Overnight to London 🌙
- **Beat:** The big night flight. Dim the cabin, tuck in Camile, "sleep," wake to
  a sunrise breakfast tray.
- **Tap activity:** Turn off the reading light, pull the blanket, tap stars out
  the window; morning = tap the breakfast tray.
- **Hidden Camile:** under the blanket.
- **Stamp:** Moon + stars.

### Ch 5 — The London Eye 🎡  *(Marriott London County Hall, right by the Eye)*
- **Beat:** Arrive at the hotel on the Thames; the giant wheel is right outside.
  *(Ref: hotel lit blue at dusk with the red-lit Eye beside it; pod interior view
  over the river toward Big Ben.)*
- **Tap activity:** Tap to board a pod, **tap to spin the wheel up**, and as it
  rises tap landmarks that appear (Big Ben, the river, boats, Parliament).
- **Hidden Camile:** in the pod, holding the glass.
- **Stamp:** Ferris wheel.

### Ch 6 — Daddy's Train 🚆
- **Beat:** Daddy has to go to work for a few days. Wave goodbye at the station as
  his train pulls away. *(Bittersweet but reassuring — "See you soon, Daddy!")*
- **Tap activity:** Hand Daddy his bag, wave (tap to wave), the train chugs off.
- **Hidden Camile:** on the platform bench.
- **Stamp:** Train.

### Ch 7 — Around London with Mom 🚌
- **Beat:** Norah + Mom explore London together (just the two of them now).
- **Tap activity:** Ride a red double-decker bus; tap sights (red phone box,
  guards, pigeons, Big Ben). Maybe a quick "find 3 red buses" mini-hunt.
- **Hidden Camile:** on the top deck of the bus.
- **Stamp:** Double-decker bus / Big Ben.

### Ch 8 — Leeds Castle Sleepover 👑
- **Beat:** Stay overnight in a real castle on a lake. *(Ref: honey-stone castle
  reflected in its moat by day; glowing warm at dusk with gardens.)*
- **Tap activity:** Cross the bridge, explore rooms, **count the swans** on the
  moat, then light the candles as night falls and go to bed.
- **Hidden Camile:** in a castle window / four-poster bed.
- **Stamp:** Crown.

### Ch 9 — The Chunnel to France 🚄  *(Eurotunnel)*
- **Beat:** Take the train under the sea to France. *(Ref: blue Eurotunnel train
  at the tunnel mouth.)*
- **Tap activity:** Board the train, **tap to speed through the tunnel** (fun
  whoosh + lights flicking past), pop out into the French countryside.
- **Hidden Camile:** in the train window.
- **Stamp:** Tunnel.

### Ch 10 — Up the Eiffel Tower 🗼  *(Paris)*
- **Beat:** Reach Paris and go up the tower. *(Ref: Eiffel Tower lit gold against
  a dark evening sky.)*
- **Tap activity:** Tap the elevator up level by level; at the top tap to see the
  view; as night falls **tap to make the tower sparkle/light up**.
- **Hidden Camile:** at a viewing telescope.
- **Stamp:** Eiffel Tower.

### Ch 11 — Croissants & Macarons 🥐
- **Beat:** A Paris café treat.
- **Tap activity:** A gentle "catch the pastries" — tap falling croissants and
  pastel macarons into a box; build a macaron tower; pick Norah's flavor.
- **Hidden Camile:** at a café table.
- **Stamp:** Macaron.

### Ch 12 — Fly Home 🏠  *(Paris → Boston → Richmond VA)*
- **Beat:** The long way home, then the best part — the pups are waiting!
- **Tap activity:** Two quick flight hops (tap through clouds), land, and a big
  reunion: tap to hug the pups. Passport shown complete.
- **Hidden Camile:** safe in Norah's arms (auto-found — sweet ending).
- **Stamp:** Home / heart. **🎉 Passport complete → celebration screen.**

---

## 6. Characters  *(needs your input — see §10)*

| Character | Role | Look | Status |
| --- | --- | --- | --- |
| **Norah** | Hero | Shoulder-length brown hair (often half pulled up), brown eyes, big smile; signature **hot-pink/coral dress** | ✅ known |
| **Camile** | Doll sidekick | Blonde wavy hair, blue eyes, **pink dress with tulle skirt**, **teal boots** | ✅ known |
| **Mommo** | Travels with Norah | Dark brown hair pulled back, warm smile, **mint-green top** + black pants | ✅ known |
| **Daddo** | Leaves for work (Ch 6), reunites at home | Glasses, **black ball cap**, black button-up over gray tee, blue jeans; tall | ✅ known |
| **Penny** | Pup — goodbye + reunion | Caramel/tan brown, big perky ears, athletic, sweet smile (loves her colorful harness) | ✅ known |
| **Obi** | Pup — goodbye + reunion | Tricolor: white body, brown/tan head with tan eyebrows, floppy ears (Jack Russell / fox-terrier type) | ✅ known |

---

## 7. Visual Style
- Warm, friendly cartoon illustration; rounded shapes, bright but cozy palette.
- Each location's cartoon background is inspired by the real photos (hotel + Eye,
  pod view, castle by moat, Eurotunnel, Eiffel at night).
- Big, obvious tappable elements with a gentle "tap me" shimmer for 7-8 yo clarity.
- Consistent character sprites so Norah + Camile are recognizable everywhere.

## 8. Audio
- **SFX only:** soft taps, a happy "collect" chime, a stamp thunk, a win fanfare.
- **Mute button** always visible (top corner); safe/quiet if no headphones.

## 9. Technical
- Vanilla JS + HTML5 (canvas and/or DOM), no framework, no network at runtime.
- All assets local under the game folder. No external fonts/CDNs.
- **Save progress** in `localStorage` (stamps earned, Camiles found) so a closed
  tab mid-flight resumes.
- Responsive portrait layout for phones; large hit targets.
- Optional service worker for guaranteed offline caching after one online load.

---

## 10. Open Items — all characters locked ✅
1. ~~The two pups~~ — ✅ Penny (brown) & Obi (white & brown).
2. ~~Mom & Daddy names~~ — ✅ Mommo & Daddo.
3. ~~Norah's cartoon look~~ — ✅ brown hair, brown eyes, hot-pink dress.
4. ~~Mommo & Daddo looks~~ — ✅ (see character table).
5. *(Optional, anytime)* anything special to include — favorite food, catchphrase,
   a toy besides Camile, a song she loves.

## 11. Suggested Build Order
1. **Skeleton:** game shell + chapter state machine + passport UI (1 placeholder scene).
2. **Vertical slice:** fully build **Ch 5 — The London Eye** end-to-end as the
   proof-of-fun (it's the signature moment).
3. **Fill chapters** 1→12 reusing the scene/collectible system.
4. **Polish:** SFX, animations, save/restore, celebration screen.
5. **Wire into site:** add `VacationGamePage.jsx` + route, deploy.
