// Lanternfall — a top-down stealth game about stealing moon relics
// from a night museum. Boot, the game loop and the state machine:
// title → playing → caught / levelclear → win. Screenshot scenes
// (?shot=...) freeze a posed frame of the same live state.

import { CANVAS_W, CANVAS_H } from './config.js';
import { LEVELS, parseLevel } from './levels.js';
import { createPlayer, updatePlayer, collectRelics, reachedExit } from './player.js';
import { createGuard, updateGuard } from './guards.js';
import { createInput } from './input.js';
import { renderGame } from './render.js';
import { setupShot } from './shots.js';
import { sound } from './audio.js';
import { music } from './music.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const status = document.getElementById('status');

const game = {
  state: 'title',
  levelIndex: 0,
  level: null,
  player: null,
  guards: [],
  elapsed: 0,
  timesSpotted: 0,
  shotMode: new URLSearchParams(window.location.search).get('shot'),
  shotLevel: Number(new URLSearchParams(window.location.search).get('level') ?? 0),
};

function loadLevel(index) {
  game.levelIndex = index;
  game.level = parseLevel(LEVELS[index]);
  game.player = createPlayer(game.level);
  game.guards = game.level.guardDefs.map((definition) => createGuard(definition));
  game.state = 'playing';
  status.textContent = game.level.name;
}

function announce(text) { status.textContent = text; }

let exitAnnounced = false;

function step(dt) {
  if (game.state !== 'playing') return;
  game.elapsed += dt;
  const events = [];
  updatePlayer(game.player, game.level, input, dt, events);
  const pickedBefore = game.level.relics.filter((relic) => relic.taken).length;
  collectRelics(game.player, game.level, () => {
    if (!exitAnnounced) {
      exitAnnounced = true;
      sound.exitOpen();
      announce('All relics taken. The exit is open.');
    }
  });
  if (game.level.relics.filter((relic) => relic.taken).length !== pickedBefore) {
    announce(`Relic taken: ${game.level.relics.filter((relic) => relic.taken).length} of ${game.level.relics.length}`);
  }
  const alarms = [];
  music.setTension(Math.max(0, ...game.guards.map((guard) => guard.detection)));
  for (const guard of game.guards) {
    if (updateGuard(guard, game.level, game.player, dt, events, alarms) === 'caught') {
      game.state = 'caught';
      sound.caught();
      announce('Caught. Press R to retry.');
      return;
    }
  }
  game.timesSpotted += alarms.length;
  if (reachedExit(game.player, game.level)) {
    if (game.levelIndex + 1 < LEVELS.length) {
      game.state = 'levelclear';
      announce('Gallery cleared. Press Enter.');
    } else {
      game.state = 'win';
      sound.win();
      announce('All moons stolen. You win.');
    }
  }
}

function handleStateKeys() {
  if (game.state === 'title' && input.pressed('enter')) {
    sound.unlock();
    music.start();
    game.elapsed = 0;
    game.timesSpotted = 0;
    exitAnnounced = false;
    loadLevel(0);
  } else if (game.state === 'caught' && input.pressed('r')) {
    exitAnnounced = game.level.relics.every((relic) => relic.taken);
    loadLevel(game.levelIndex);
  } else if (game.state === 'levelclear' && input.pressed('enter')) {
    exitAnnounced = false;
    loadLevel(game.levelIndex + 1);
  } else if (game.state === 'win' && input.pressed('r')) {
    game.elapsed = 0;
    game.timesSpotted = 0;
    exitAnnounced = false;
    loadLevel(0);
  }
}

// Boot: a posed scene for screenshots, or the title over gallery one.
loadLevel(game.shotMode ? game.shotLevel : 0);
if (game.shotMode) {
  setupShot(game, game.shotMode);
  game.state = 'playing';
} else {
  game.state = 'title';
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!game.shotMode) {
    handleStateKeys();
    step(dt);
    renderGame(ctx, game, now / 1000);
  } else {
    renderGame(ctx, game, 1.35);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
