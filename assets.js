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

  // chapters use placeholder music (reused tracks) until bespoke ones exist
  pups: {
    bg: 'assets/images/home-richmond.png',
    music: 'assets/music/richmond-home.mp3'      // placeholder: cozy home theme
  },
  airport: {
    bg: 'assets/images/richmond-airport.png',
    music: 'assets/music/airport-music.mp3'
  },
  nyc: {
    bg: 'assets/images/plane-ride-nyc.png',
    music: 'assets/music/chunnel-adventure.m4a'  // placeholder: travel/adventure
  },
  overnight: {
    bg: 'assets/images/plane-ride-night.png',
    music: 'assets/music/leeds-castle-evening.m4a' // placeholder: calm night theme
  },
  train: {
    bg: 'assets/images/london-train-station.png',
    music: 'assets/music/london-stroll.m4a'       // placeholder: London theme
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
    // reunion at home with the pups — reuse the cozy home scene (better than the
    // airport for the "we're home!" beat) until a dedicated reunion bg exists.
    bg: 'assets/images/home-richmond.png',
    music: 'assets/music/richmond-home.mp3'
  }

  // ⚠️ placeholders in use: music for pups/nyc/overnight/train reuse existing
  //    tracks; home reuses the home-richmond scene. Swap in bespoke assets later.
};
