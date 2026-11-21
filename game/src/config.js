// Lanternfall tuning: world size, speeds, vision and detection balance.
// Every number the rest of the game shares lives here so the feel can be
// adjusted in one place.

export const TILE = 40;
export const COLS = 24;
export const ROWS = 16;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
export const HUD_H = 40;
export const CANVAS_W = WORLD_W;
export const CANVAS_H = WORLD_H + HUD_H;

export const PLAYER_RADIUS = 13;
export const PLAYER_WALK_SPEED = 138;
export const PLAYER_RUN_SPEED = 218;
export const PLAYER_SNEAK_SPEED = 74;
export const RUN_NOISE_RADIUS = 96;
export const MOONLIGHT_CHIME_RADIUS = 74;

export const GUARD_RADIUS = 14;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_INVESTIGATE_SPEED = 96;
export const GUARD_CHASE_SPEED = 158;
export const GUARD_TURN_SPEED = 3.4;
export const GUARD_WAYPOINT_PAUSE = 1.1;

export const VISION_RANGE = 168;
export const VISION_HALF_ANGLE = 0.56; // about 32 degrees each side
export const CATCH_DISTANCE = 24;

export const DETECTION_FILL_SECONDS = 0.85; // point blank, standing in the open
export const DETECTION_DECAY_PER_SECOND = 0.32;
export const SUSPICIOUS_THRESHOLD = 0.35;
export const SHADOW_DETECTION_FACTOR = 0.42;
export const MOONLIGHT_DETECTION_FACTOR = 1.55;
export const SNEAK_DETECTION_FACTOR = 0.55;
export const RUN_DETECTION_FACTOR = 1.35;

export const COIN_DISTRACT_RADIUS = 118;
export const COINS_PER_LEVEL = 3;

export const COLORS = {
  floor: '#232838',
  floorAlt: '#262c40',
  rug: '#151a2c',
  rugEdge: '#2e3a5f',
  wall: '#4a3f35',
  wallTop: '#6b5b4a',
  wallSide: '#33291f',
  crate: '#8a6a3b',
  crateDark: '#6e532c',
  exitLocked: '#7a2e35',
  exitOpen: '#2fae5f',
  relic: '#ffd94d',
  playerCloak: '#1f8a70',
  playerCloakDark: '#146653',
  guardCoat: '#b03a3a',
  guardCoatDark: '#7e2828',
  coneCalm: 'rgba(255, 214, 90, 0.20)',
  coneEdge: 'rgba(255, 214, 90, 0.05)',
};
