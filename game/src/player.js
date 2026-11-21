// The thief: movement with three gaits, coin throwing, relic pickup
// and the noise he makes. Walking is silent, running is fast but every
// guard within earshot hears it, sneaking is slow and hard to spot.

import {
  PLAYER_RADIUS, PLAYER_WALK_SPEED, PLAYER_RUN_SPEED, PLAYER_SNEAK_SPEED,
  RUN_NOISE_RADIUS, MOONLIGHT_CHIME_RADIUS, COINS_PER_LEVEL,
} from './config.js';
import { collideWithSolids } from './vision.js';
import { isMoonlitAt } from './levels.js';
import { sound } from './audio.js';

export function createPlayer(level) {
  return {
    x: level.playerStart.x,
    y: level.playerStart.y,
    radius: PLAYER_RADIUS,
    angle: -Math.PI / 2,
    mode: 'walk', // walk | run | sneak
    moving: false,
    coinsLeft: level.coins ?? COINS_PER_LEVEL,
    stepTimer: 0,
    coins: [], // thrown coins resting on the floor: {x, y, ring}
  };
}

export function updatePlayer(player, level, input, dt, events) {
  const axis = input.axis();
  player.moving = axis.x !== 0 || axis.y !== 0;
  player.mode = input.running() && player.moving ? 'run' : input.sneaking() ? 'sneak' : 'walk';
  const speed = player.mode === 'run' ? PLAYER_RUN_SPEED : player.mode === 'sneak' ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;

  if (player.moving) {
    player.angle = Math.atan2(axis.y, axis.x);
    const moved = collideWithSolids(level, player.x + axis.x * speed * dt, player.y + axis.y * speed * dt, player.radius);
    player.x = moved.x;
    player.y = moved.y;
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = player.mode === 'run' ? 0.24 : player.mode === 'sneak' ? 0.5 : 0.34;
      if (player.mode !== 'sneak') sound.playerStep(player.mode === 'run');
      if (player.mode === 'run') events.push({ type: 'noise', x: player.x, y: player.y, radius: RUN_NOISE_RADIUS });
      // Moonlight rings like glass underfoot: crossing a moonlit pool
      // while walking or running chimes faintly, and nearby guards
      // hear it. Only sneaking crosses in silence.
      if (player.mode !== 'sneak' && isMoonlitAt(level, player.x, player.y)) {
        events.push({ type: 'noise', x: player.x, y: player.y, radius: MOONLIGHT_CHIME_RADIUS });
        events.push({ type: 'chime', x: player.x, y: player.y });
      }
    }
  }

  for (const click of input.takeClicks()) {
    throwCoin(player, click.x, click.y, events);
  }

  for (const coin of player.coins) coin.ring = Math.min(1, coin.ring + dt * 1.4);
}

export function throwCoin(player, worldX, worldY, events) {
  if (player.coinsLeft <= 0) return false;
  // The HUD strip is not part of the world; clicks there do nothing.
  const targetY = worldY - 40;
  if (targetY < 0) return false;
  player.coinsLeft -= 1;
  const coin = { x: worldX, y: targetY, ring: 0 };
  player.coins.push(coin);
  sound.coin();
  events.push({ type: 'coin', x: coin.x, y: coin.y });
  return true;
}

export function collectRelics(player, level, onAllCollected) {
  let picked = 0;
  for (const relic of level.relics) {
    if (relic.taken) continue;
    if (Math.hypot(relic.x - player.x, relic.y - player.y) < player.radius + 13) {
      relic.taken = true;
      picked += 1;
      sound.relic();
    }
  }
  if (picked > 0 && level.relics.every((relic) => relic.taken)) onAllCollected();
  return picked;
}

export function reachedExit(player, level) {
  if (!level.relics.every((relic) => relic.taken)) return false;
  return Math.hypot(level.exit.x - player.x, level.exit.y - player.y) < player.radius + 16;
}
