// Drawing the night museum: lamplit floor, wooden crates and brick
// walls you can read at a glance, vision cones that warm from gold to
// red as a guard's suspicion grows, and a darkness pass that cuts pools
// of light around lanterns so shadow reads as safety.

import { TILE, COLS, ROWS, HUD_H, COLORS } from './config.js';
import { buildVisionCone } from './vision.js';

const lightCanvas = document.createElement('canvas');

function coneColor(detection, state) {
  if (state === 'chase') return 'rgba(255, 70, 50, 0.42)';
  if (detection > 0.6) return 'rgba(255, 130, 40, 0.40)';
  if (detection > 0.3) return 'rgba(255, 180, 60, 0.36)';
  return 'rgba(255, 214, 90, 0.32)';
}

function drawFloor(ctx, level, time) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ch = level.map[row][col];
      const x = col * TILE;
      const y = row * TILE;
      ctx.fillStyle = (col + row) % 2 === 0 ? COLORS.floor : COLORS.floorAlt;
      ctx.fillRect(x, y, TILE, TILE);
      if (ch === ',') {
        ctx.fillStyle = COLORS.rug;
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        ctx.strokeStyle = COLORS.rugEdge;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
      }
      if (ch === 'M') {
        // A pool of moonlight from a high window: beautiful, and the
        // most dangerous floor in the museum to be caught standing on.
        const glow = ctx.createRadialGradient(x + TILE / 2, y + TILE / 2, 2, x + TILE / 2, y + TILE / 2, TILE * 0.85);
        glow.addColorStop(0, 'rgba(168, 199, 255, 0.34)');
        glow.addColorStop(1, 'rgba(168, 199, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - TILE / 2, y - TILE / 2, TILE * 2, TILE * 2);
        ctx.fillStyle = 'rgba(220, 234, 255, 0.5)';
        ctx.fillRect(x + 9, y + 7, 2, 2);
        ctx.fillRect(x + 27, y + 24, 2, 2);
        ctx.fillRect(x + 17, y + 31, 1.6, 1.6);
      }
    }
  }
}

function drawWallsAndCrates(ctx, level) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ch = level.map[row][col];
      const x = col * TILE;
      const y = row * TILE;
      if (ch === '#') {
        ctx.fillStyle = COLORS.wallSide;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.wallTop;
        ctx.fillRect(x, y, TILE, TILE - 9);
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x + 3, y + 3, TILE - 6, 4);
        ctx.fillRect(x + 3, y + 13, TILE - 6, 4);
      } else if (ch === 'C') {
        ctx.fillStyle = COLORS.crate;
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        ctx.strokeStyle = COLORS.crateDark;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 4, y + 4, TILE - 8, TILE - 8);
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + TILE - 4, y + TILE - 4);
        ctx.moveTo(x + TILE - 4, y + 4);
        ctx.lineTo(x + 4, y + TILE - 4);
        ctx.stroke();
      }
    }
  }
}

function drawExit(ctx, level, time) {
  const { x, y } = level.exit;
  const open = level.relics.every((relic) => relic.taken);
  const pulse = 0.75 + Math.sin(time * 3) * 0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = open ? COLORS.exitOpen : COLORS.exitLocked;
  ctx.globalAlpha = open ? pulse : 0.85;
  ctx.fillRect(-17, -19, 34, 38);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#0b0e17';
  ctx.lineWidth = 3;
  ctx.strokeRect(-17, -19, 34, 38);
  ctx.fillStyle = '#0b0e17';
  ctx.beginPath();
  ctx.arc(10, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 0, -25);
  ctx.restore();
}

function drawRelics(ctx, level, time) {
  for (const relic of level.relics) {
    if (relic.taken) continue;
    // The Mother Moon is drawn grand: half again as large, haloed,
    // with a slow crown of orbiting sparks — the one she came for.
    const scale = relic.grand ? 1.55 : 1;
    const bob = Math.sin(time * 2.4 + relic.phase) * 3;
    ctx.save();
    ctx.translate(relic.x, relic.y + bob);
    if (relic.grand) {
      const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
      halo.addColorStop(0, 'rgba(255, 217, 77, 0.35)');
      halo.addColorStop(1, 'rgba(255, 217, 77, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(-30, -30, 60, 60);
      ctx.fillStyle = 'rgba(255, 243, 176, 0.9)';
      for (let i = 0; i < 3; i++) {
        const orbit = time * 0.9 + (i * Math.PI * 2) / 3;
        ctx.fillRect(Math.cos(orbit) * 17 - 1, Math.sin(orbit) * 17 - 1, 2, 2);
      }
    }
    ctx.scale(scale, scale);
    ctx.shadowColor = COLORS.relic;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COLORS.relic;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 11);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawCoins(ctx, player) {
  for (const coin of player.coins) {
    ctx.fillStyle = '#e8c766';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (coin.ring < 1) {
      ctx.strokeStyle = `rgba(232, 199, 102, ${0.7 * (1 - coin.ring)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 6 + coin.ring * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawVisionCones(ctx, level, guards) {
  for (const guard of guards) {
    const cone = buildVisionCone(level, guard);
    ctx.fillStyle = coneColor(guard.detection, guard.state);
    ctx.beginPath();
    ctx.moveTo(cone[0].x, cone[0].y);
    for (let i = 1; i < cone.length; i++) ctx.lineTo(cone[i].x, cone[i].y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlayer(ctx, player, time) {
  ctx.save();
  ctx.translate(player.x, player.y);
  // Noise ring while running: what the guards hear.
  if (player.mode === 'run' && player.moving) {
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + Math.sin(time * 14) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.rotate(player.angle);
  ctx.scale(1.35, player.mode === 'sneak' ? 1.16 : 1.35);
  // Lune: a small girl in a flared indigo dress, bobbed dark hair, and
  // the little lantern she carries — the museum's one friendly light.
  ctx.fillStyle = player.mode === 'sneak' ? '#3a4a85' : '#46589e';
  ctx.beginPath();
  ctx.moveTo(3, -4);
  ctx.lineTo(8, -2);
  ctx.lineTo(11, 10);
  ctx.lineTo(-9, 11);
  ctx.lineTo(-11, -3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8fa3e8';
  ctx.fillRect(-9.5, 9.2, 20, 1.8);
  ctx.fillStyle = '#f2d7c4';
  ctx.beginPath();
  ctx.arc(2, -3, 6.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c2430';
  ctx.beginPath();
  ctx.arc(1.2, -4.4, 6.8, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();
  ctx.fillRect(-5.8, -6, 3.2, 10);
  const flicker = 0.75 + Math.sin(time * 11) * 0.12;
  const glow = ctx.createRadialGradient(14, 3, 1, 14, 3, 13);
  glow.addColorStop(0, `rgba(255, 214, 130, ${0.5 * flicker})`);
  glow.addColorStop(1, 'rgba(255, 214, 130, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(1, -10, 26, 26);
  ctx.fillStyle = '#ffd682';
  ctx.fillRect(12.4, 1.2, 3.4, 4.2);
  ctx.restore();
  if (player.mode === 'sneak') {
    ctx.fillStyle = 'rgba(180, 230, 255, 0.8)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('sneak', player.x, player.y - 20);
  }
}

function drawGuard(ctx, guard, time) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.angle);
  ctx.fillStyle = guard.state === 'chase' ? '#d94848' : COLORS.guardCoat;
  ctx.beginPath();
  ctx.arc(0, 0, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.guardCoatDark;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-10, -10);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2d5b6';
  ctx.beginPath();
  ctx.arc(3, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  // The lantern that names the game.
  ctx.fillStyle = '#ffca55';
  ctx.shadowColor = '#ffca55';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(13, -9, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Detection arc above the head: gold filling toward red.
  if (guard.detection > 0.02) {
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 21, -Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = guard.detection > 0.75 ? '#ff5040' : guard.detection > 0.35 ? '#ff9a3c' : '#ffd94d';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 21, -Math.PI / 2, -Math.PI / 2 + guard.detection * Math.PI * 2);
    ctx.stroke();
  }
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  if (guard.state === 'chase') {
    ctx.fillStyle = '#ff5040';
    ctx.fillText('!', guard.x, guard.y - 27);
  } else if (guard.state === 'suspicious' || guard.state === 'search') {
    ctx.fillStyle = '#ffd94d';
    ctx.fillText('?', guard.x, guard.y - 27);
  } else if (guard.state === 'investigate') {
    ctx.fillStyle = '#ffb35c';
    ctx.fillText('?', guard.x, guard.y - 27);
  }
}

// Dust motes drifting in the lantern light: slow, deterministic, and
// purely for the room's held breath.
function drawDustMotes(ctx, time) {
  ctx.fillStyle = 'rgba(230, 238, 255, 0.35)';
  for (let i = 0; i < 42; i++) {
    const seedX = (i * 197.3) % 960;
    const seedY = (i * 89.7) % 640;
    const x = seedX + Math.sin(time * 0.24 + i * 1.7) * 14;
    const y = (seedY + time * (4 + (i % 5))) % 640;
    const size = 1 + (i % 3) * 0.5;
    ctx.globalAlpha = 0.12 + (i % 4) * 0.06;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawVignette(ctx) {
  const { width } = ctx.canvas;
  const gradient = ctx.createRadialGradient(width / 2, 320, 300, width / 2, 320, 720);
  gradient.addColorStop(0, 'rgba(3, 4, 10, 0)');
  gradient.addColorStop(1, 'rgba(3, 4, 10, 0.42)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 640);
}

function drawDarkness(ctx, game) {
  const { width, height } = ctx.canvas;
  lightCanvas.width = width;
  lightCanvas.height = height - HUD_H;
  const light = lightCanvas.getContext('2d');
  light.clearRect(0, 0, width, lightCanvas.height);
  light.fillStyle = 'rgba(5, 7, 16, 0.34)';
  light.fillRect(0, 0, width, lightCanvas.height);
  light.globalCompositeOperation = 'destination-out';
  const cut = (x, y, radius, strength) => {
    const gradient = light.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    light.fillStyle = gradient;
    light.beginPath();
    light.arc(x, y, radius, 0, Math.PI * 2);
    light.fill();
  };
  cut(game.player.x, game.player.y, 105, 0.85);
  for (const guard of game.guards) cut(guard.x, guard.y, 92, 0.8);
  for (const relic of game.level.relics) if (!relic.taken) cut(relic.x, relic.y, 40, 0.5);
  if (game.level.relics.every((relic) => relic.taken)) cut(game.level.exit.x, game.level.exit.y, 62, 0.7);
  ctx.drawImage(lightCanvas, 0, 0);
}

function drawHud(ctx, game) {
  ctx.save();
  ctx.fillStyle = '#0d1120';
  ctx.fillRect(0, 0, ctx.canvas.width, HUD_H);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.level.name, 12, 26);
  const taken = game.level.relics.filter((relic) => relic.taken).length;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(`◆ relics ${taken}/${game.level.relics.length}`, 452, 26);
  ctx.fillText(`○ coins ${game.player.coinsLeft}`, 580, 26);
  const maxDetection = Math.max(0, ...game.guards.map((guard) => guard.detection));
  ctx.fillText('eye', 684, 26);
  ctx.fillStyle = '#2a3049';
  ctx.fillRect(716, 14, 110, 10);
  ctx.fillStyle = maxDetection > 0.75 ? '#ff5040' : maxDetection > 0.35 ? '#ff9a3c' : '#ffd94d';
  ctx.fillRect(716, 14, 110 * maxDetection, 10);
  const exitOpen = taken === game.level.relics.length;
  ctx.fillStyle = exitOpen ? '#7be495' : '#9aa3c0';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(exitOpen ? 'EXIT OPEN' : 'EXIT LOCKED', 948, 26);
  ctx.restore();
}

export function renderGame(ctx, game, time) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(0, HUD_H);
  drawFloor(ctx, game.level, time);
  drawExit(ctx, game.level, time);
  drawRelics(ctx, game.level, time);
  drawCoins(ctx, game.player);
  drawWallsAndCrates(ctx, game.level);
  drawDarkness(ctx, game);
  // Cones are lantern light: they sit above the darkness pass, clipped
  // by the walls they cannot shine through.
  drawVisionCones(ctx, game.level, game.guards);
  for (const guard of game.guards) drawGuard(ctx, guard, time);
  drawPlayer(ctx, game.player, time);
  drawDustMotes(ctx, time);
  drawVignette(ctx);
  ctx.restore();
  drawHud(ctx, game);
  if (game.state !== 'playing') drawOverlay(ctx, game);
}

function drawOverlay(ctx, game) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = 'rgba(5, 7, 16, 0.72)';
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = 'center';
  if (game.state === 'title') {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText('LANTERNFALL', width / 2, 210);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Lune, a girl with a little lantern, has slipped into the sleeping museum.', width / 2, 252);
    ctx.fillText('It keeps its moons under lantern light. She has come to take them back, unseen.', width / 2, 282);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#9aa3c0';
    ctx.fillText('WASD / arrows — move      SHIFT — run (loud, fast)', width / 2, 340);
    ctx.fillText('C — sneak (slow, faint)      CLICK — throw a coin to distract', width / 2, 368);
    ctx.fillText('Dark rugs muffle you. Crates and walls break the lantern gaze.', width / 2, 396);
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Press ENTER to begin', width / 2, 452);
  } else if (game.state === 'caught') {
    ctx.fillStyle = '#ff5040';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('CAUGHT BY LANTERNLIGHT', width / 2, 300);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Press R to try this gallery again', width / 2, 344);
  } else if (game.state === 'levelclear') {
    const seconds = Math.floor(game.levelTime);
    const clock = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
    ctx.fillStyle = '#7be495';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText(game.seenThisLevel ? 'GALLERY CLEARED' : 'GALLERY CLEARED — PHANTOM', width / 2, 292);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText((game.seenThisLevel ? 'Seen, but gone like mist.' : 'Never seen. A rumour with a lantern.') + '  Time ' + clock, width / 2, 330);
    ctx.fillText('Press ENTER for the next gallery', width / 2, 362);
  } else if (game.state === 'win') {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText('ALL MOONS STOLEN', width / 2, 290);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillText(`The museum wakes none the wiser. Time: ${game.elapsed.toFixed(1)}s · Times spotted: ${game.timesSpotted}`, width / 2, 334);
    ctx.fillText('Press R to play again', width / 2, 372);
  }
}
