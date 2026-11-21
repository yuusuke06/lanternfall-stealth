// Line of sight and vision cones. Walls and crates block sight: a ray
// marches in small steps until it leaves the vision range or steps into
// a solid tile. The cone the player sees is built from many such rays,
// so cover genuinely carves holes in a guard's view.

import { TILE, VISION_RANGE } from './config.js';
import { isSolidTile } from './levels.js';

const RAY_STEP = 6;

export function rayDistance(level, fromX, fromY, angle, maxDistance) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let distance = 0;
  while (distance < maxDistance) {
    distance += RAY_STEP;
    const x = fromX + dx * distance;
    const y = fromY + dy * distance;
    if (isSolidTile(level, Math.floor(x / TILE), Math.floor(y / TILE))) {
      return distance;
    }
  }
  return maxDistance;
}

export function hasLineOfSight(level, fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const steps = Math.max(1, Math.floor(distance / RAY_STEP));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = fromX + dx * t;
    const y = fromY + dy * t;
    if (isSolidTile(level, Math.floor(x / TILE), Math.floor(y / TILE))) return false;
  }
  return true;
}

// The visible cone as a polygon: fan of rays across the field of view.
export function buildVisionCone(level, guard) {
  const rayCount = 26;
  const points = [{ x: guard.x, y: guard.y }];
  for (let i = 0; i <= rayCount; i++) {
    const t = i / rayCount;
    const angle = guard.angle - guard.halfAngle + t * guard.halfAngle * 2;
    const distance = rayDistance(level, guard.x, guard.y, angle, VISION_RANGE);
    points.push({ x: guard.x + Math.cos(angle) * distance, y: guard.y + Math.sin(angle) * distance });
  }
  return points;
}

// Is a point inside this guard's cone and truly visible from his eyes?
export function canSee(level, guard, targetX, targetY) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > VISION_RANGE) return { seen: false, distance };
  let angleDiff = Math.atan2(dy, dx) - guard.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  if (Math.abs(angleDiff) > guard.halfAngle) return { seen: false, distance };
  const seen = hasLineOfSight(level, guard.x, guard.y, targetX, targetY);
  return { seen, distance };
}

// Circle against solid tiles: push the circle out of any tile it overlaps.
export function collideWithSolids(level, x, y, radius) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (!isSolidTile(level, c, r)) continue;
      const left = c * TILE;
      const top = r * TILE;
      const nearX = Math.max(left, Math.min(x, left + TILE));
      const nearY = Math.max(top, Math.min(y, top + TILE));
      const dx = x - nearX;
      const dy = y - nearY;
      const distSq = dx * dx + dy * dy;
      if (distSq >= radius * radius) continue;
      if (distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        x = nearX + (dx / dist) * radius;
        y = nearY + (dy / dist) * radius;
      } else {
        // Centre inside the tile: push out along the smallest exit.
        const exits = [
          { d: x - left, nx: left - radius, ny: y },
          { d: left + TILE - x, nx: left + TILE + radius, ny: y },
          { d: y - top, nx: x, ny: top - radius },
          { d: top + TILE - y, nx: x, ny: top + TILE + radius },
        ].sort((a, b) => a.d - b.d);
        x = exits[0].nx;
        y = exits[0].ny;
      }
    }
  }
  return { x, y };
}
