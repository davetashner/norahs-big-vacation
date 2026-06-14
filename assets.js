/* assets.js — manifest mapping each chapter to its painted background + music.
   Paths are relative to the game's index.html, so they work both as a standalone
   site (repo root) and when copied into norahtashner.com/public/games/<name>/.
   Add an entry here when you drop new files into assets/images and assets/music. */
window.NVassets = {
  // ✅ playable now
  londoneye: {
    bg: 'assets/images/london-eye-county-hall.png',
    music: 'assets/music/london-stroll.m4a'
  },

  // ⏳ backgrounds/music ready, chapters not built yet
  pups: {
    bg: 'assets/images/home-richmond.png'
    // music: TODO (cozy home / goodbye theme)
  },
  airport: {
    bg: 'assets/images/richmond-airport.png',
    music: 'assets/music/airport-music.mp3'
  },
  nyc: {
    bg: 'assets/images/plane-ride-nyc.png'
    // music: TODO (flight theme)
  },
  overnight: {
    bg: 'assets/images/plane-ride-night.png'
    // music: TODO (sleepy night-flight theme)
  },
  train: {
    bg: 'assets/images/london-train-station.png'
    // music: TODO (train theme)
  },
  london: {
    bg: 'assets/images/county-hall-hotel.png',
    music: 'assets/music/london-stroll.m4a'
  },
  castle: {
    bg: 'assets/images/leeds-castle-day.png',
    bgEvening: 'assets/images/leeds-castle-evening.png',
    music: 'assets/music/leeds-castle-day.m4a',
    musicEvening: 'assets/music/leeds-castle-evening.m4a'
  },
  chunnel: {
    bg: 'assets/images/chunnel.png',
    music: 'assets/music/chunnel-adventure.m4a'
  },
  eiffel: {
    bg: 'assets/images/paris-eiffel-tower.png',
    music: 'assets/music/paris-eiffel-tower.m4a'
  },
  treats: {
    bg: 'assets/images/paris-boulangerie.png',
    music: 'assets/music/paris-bakery.m4a'
  },
  home: {
    // placeholder bg: reuse the daytime airport until a richmond-airport-evening
    // (reunion) background is generated.
    bg: 'assets/images/richmond-airport.png',
    music: 'assets/music/richmond-home.mp3'
  }

  // ❌ still missing: a dedicated 'home' evening/reunion background, and music
  //    for pups / nyc / overnight / train.
};
