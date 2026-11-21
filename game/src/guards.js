// Lantern guards. Each one loops his patrol waypoints, pauses to look
// around, and reacts in stages: a glimpse fills his suspicion, a full
// meter turns him suspicious and he comes to look, certainty makes him
// chase. Break his line of sight and the meter drains — you always get
// a chance to recover, until his hands reach you.

import {
  GUARD_RADIUS, GUARD_PATROL_SPEED, GUARD_INVESTIGATE_SPEED, GUARD_CHASE_SPEED,
  GUARD_TURN_SPEED, GUARD_WAYPOINT_PAUSE, VISION_HALF_ANGLE, CATCH_DISTANCE,
  DETECTION_FILL_SECONDS, DETECTION_DECAY_PER_SECOND, SUSPICIOUS_THRESHOLD,
  SHADOW_DETECTION_FACTOR, MOONLIGHT_DETECTION_FACTOR, SNEAK_DETECTION_FACTOR, RUN_DETECTION_FACTOR,
  COIN_DISTRACT_RADIUS,
} from './config.js';
import { canSee, collideWithSolids } from './vision.js';
import { isShadowAt, isMoonlitAt } from './levels.js';
import { sound } from './audio.js';

let guardCounter = 0;

export function createGuard(definition) {
  guardCounter += 1;
  const waypoints = definition.waypoints.map(([col, row]) => ({ x: col * 40 + 20, y: row * 40 + 20 }));
  const start = waypoints[0];
  const next = waypoints[1] ?? start;
  return {
    id: guardCounter,
    x: start.x,
    y: start.y,
    radius: GUARD_RADIUS,
    angle: Math.atan2(next.y - start.y, next.x - start.x),
    halfAngle: VISION_HALF_ANGLE,
    waypoints,
    waypointIndex: 1,
    pauseTimer: 0,
    state: 'patrol', // patrol | suspicious | investigate | chase | search
    detection: 0,
    wasSuspicious: false,
    investigateTarget: null,
    lastSeen: null,
    searchTimer: 0,
    lookDirection: 1,
    stepTimer: 0,
    stepPhase: guardCounter * 0.37,
  };
}

function turnToward(guard, targetAngle, dt) {
  let diff = targetAngle - guard.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const maxTurn = GUARD_TURN_SPEED * dt;
  guard.angle += Math.max(-maxTurn, Math.min(maxTurn, diff));
  return Math.abs(diff);
}

function moveToward(guard, level, targetX, targetY, speed, dt) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 2) return 0;
  turnToward(guard, Math.atan2(dy, dx), dt);
  const step = Math.min(distance, speed * dt);
  const moved = collideWithSolids(level, guard.x + (dx / distance) * step, guard.y + (dy / distance) * step, guard.radius);
  guard.x = moved.x;
  guard.y = moved.y;
  return distance;
}

function hearEvents(guard, events) {
  for (const event of events) {
    if (event.type === 'noise' && Math.hypot(event.x - guard.x, event.y - guard.y) < event.radius) {
      guard.investigateTarget = { x: event.x, y: event.y };
      if (guard.state === 'patrol') guard.state = 'investigate';
    }
    if (event.type === 'coin' && Math.hypot(event.x - guard.x, event.y - guard.y) < COIN_DISTRACT_RADIUS) {
      guard.investigateTarget = { x: event.x, y: event.y };
      if (guard.state === 'patrol' || guard.state === 'investigate') guard.state = 'investigate';
    }
  }
}

function sensePlayer(guard, level, player, dt, alarms) {
  const { seen, distance } = canSee(level, guard, player.x, player.y);
  if (seen) {
    let factor = 1 - (distance / 190) * 0.55;
    if (isShadowAt(level, player.x, player.y)) factor *= SHADOW_DETECTION_FACTOR;
    if (isMoonlitAt(level, player.x, player.y)) factor *= MOONLIGHT_DETECTION_FACTOR;
    if (player.mode === 'sneak') factor *= SNEAK_DETECTION_FACTOR;
    if (player.mode === 'run') factor *= RUN_DETECTION_FACTOR;
    guard.detection = Math.min(1, guard.detection + (dt / DETECTION_FILL_SECONDS) * factor);
    guard.lastSeen = { x: player.x, y: player.y };
    if (guard.detection >= 1 && guard.state !== 'chase') {
      guard.state = 'chase';
      alarms.push(guard);
      sound.alarm();
    } else if (guard.detection >= SUSPICIOUS_THRESHOLD && guard.state === 'patrol') {
      guard.state = 'suspicious';
      if (!guard.wasSuspicious) sound.suspicious();
    }
  } else {
    guard.detection = Math.max(0, guard.detection - DETECTION_DECAY_PER_SECOND * dt);
    if (guard.state === 'suspicious' && guard.detection <= 0.05) {
      guard.state = 'patrol';
      guard.wasSuspicious = false;
    }
  }
  if (guard.detection >= SUSPICIOUS_THRESHOLD) guard.wasSuspicious = true;
  return seen;
}

export function updateGuard(guard, level, player, dt, events, alarms) {
  hearEvents(guard, events);
  const seen = sensePlayer(guard, level, player, dt, alarms);

  if (guard.state === 'patrol') {
    if (guard.pauseTimer > 0) {
      guard.pauseTimer -= dt;
      guard.angle += Math.sin(guard.pauseTimer * 2.2 + guard.stepPhase) * 0.35 * dt;
    } else {
      const target = guard.waypoints[guard.waypointIndex % guard.waypoints.length];
      if (moveToward(guard, level, target.x, target.y, GUARD_PATROL_SPEED, dt) < 6) {
        guard.waypointIndex += 1;
        guard.pauseTimer = GUARD_WAYPOINT_PAUSE;
      }
    }
  } else if (guard.state === 'suspicious') {
    if (guard.lastSeen) turnToward(guard, Math.atan2(guard.lastSeen.y - guard.y, guard.lastSeen.x - guard.x), dt);
    if (guard.detection >= 0.75) {
      guard.state = 'investigate';
      guard.investigateTarget = guard.lastSeen;
    }
  } else if (guard.state === 'investigate') {
    const target = guard.investigateTarget ?? guard.lastSeen;
    if (!target) {
      guard.state = 'patrol';
    } else if (moveToward(guard, level, target.x, target.y, GUARD_INVESTIGATE_SPEED, dt) < 10) {
      guard.state = 'search';
      guard.searchTimer = 2.2;
    }
  } else if (guard.state === 'chase') {
    if (seen && guard.lastSeen) {
      moveToward(guard, level, guard.lastSeen.x, guard.lastSeen.y, GUARD_CHASE_SPEED, dt);
    } else if (guard.lastSeen && moveToward(guard, level, guard.lastSeen.x, guard.lastSeen.y, GUARD_CHASE_SPEED, dt) < 10) {
      guard.state = 'search';
      guard.searchTimer = 2.6;
      guard.detection = 0.55;
    }
    if (Math.hypot(player.x - guard.x, player.y - guard.y) < CATCH_DISTANCE) return 'caught';
  } else if (guard.state === 'search') {
    guard.searchTimer -= dt;
    guard.angle += guard.lookDirection * 1.9 * dt;
    if (Math.sin(guard.searchTimer * 3) > 0.96) guard.lookDirection *= -1;
    if (guard.searchTimer <= 0) {
      guard.state = 'patrol';
      guard.detection = Math.min(guard.detection, 0.2);
    }
  }

  guard.stepTimer -= dt;
  const walking = guard.state === 'patrol' || guard.state === 'investigate' || guard.state === 'chase';
  if (walking && guard.pauseTimer <= 0 && guard.stepTimer <= 0) {
    guard.stepTimer = guard.state === 'chase' ? 0.22 : 0.38;
    sound.guardStep(Math.hypot(player.x - guard.x, player.y - guard.y));
  }
  return null;
}
