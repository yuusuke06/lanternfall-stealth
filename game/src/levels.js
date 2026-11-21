// The three galleries of the night museum, drawn as tile maps.
// Legend: # wall, C crate (solid cover), . open floor, , shadow rug
// (detection is slower while you stand on it), M moonlit floor under a
// high window (detection is faster — the moon betrays you there),
// P player start, E exit door, R moon relic. Guards patrol the
// waypoint loops listed under each map; waypoints are tile coords.

export const LEVELS = [
  {
    name: 'Gallery I — First Moon',
    hint: 'WASD / arrows to move · SHIFT run (loud) · C sneak · CLICK throw a coin',
    coins: 3,
    map: [
      '########################',
      '#P..M..#.......#...M...#',
      '#..R...#...C...#...C...#',
      '#......#.......#.......#',
      '#..CC......C.......R...#',
      '#......#####.#####.....#',
      '#......M.......M.......#',
      '#...C....,,,,....C.....#',
      '#........,,,,..........#',
      '#..R.....,,,,.....CC...#',
      '#......................#',
      '#####.##########.#######',
      '#.......#.......#......#',
      '#...C...#...R...#..C..E#',
      '#.......#.......#......#',
      '########################',
    ],
    guards: [
      { waypoints: [[5, 6], [11, 6], [11, 9], [5, 9]] },
      { waypoints: [[18, 2], [21, 2], [21, 6], [18, 6]] },
      { waypoints: [[12, 13], [17, 13], [17, 14], [12, 14]] },
    ],
  },
  {
    name: 'Gallery II — The Long Hall',
    hint: 'Guards check noises. A coin click can pull one off his loop.',
    coins: 3,
    map: [
      '########################',
      '#P....#........#.......#',
      '#..C..#..R.....#..CC...#',
      '#.....#........#.......#',
      '#.....#####.####...R...#',
      '#...M..........M.......#',
      '#..CC....,,,,....#####.#',
      '#........,,,,..........#',
      '#..R.....,,,,....C.....#',
      '#......................#',
      '#####.########.#########',
      '#......#..........#....#',
      '#..C...#..CC..R...#..C.#',
      '#......#..........#...E#',
      '#..R...#..........#....#',
      '########################',
    ],
    guards: [
      { waypoints: [[3, 5], [9, 5], [9, 8], [3, 8]] },
      { waypoints: [[13, 1], [13, 4], [19, 4], [19, 1]] },
      { waypoints: [[8, 12], [8, 14], [15, 14], [15, 12]] },
      { waypoints: [[20, 8], [22, 8], [22, 12], [20, 12]] },
    ],
  },
  {
    name: 'Gallery III — Lantern Vault',
    hint: 'Five lanterns, four moons. Patience is the master key.',
    coins: 4,
    map: [
      '########################',
      '#P...#......#......#..R#',
      '#....#..R...#..C...#...#',
      '#.C..#......#......#...#',
      '#....#####.#####.###...#',
      '#.....M.......M........#',
      '#..C....,,,,,.....C....#',
      '#.......,,,,,..........#',
      '#..R....,,,,,....C..R..#',
      '#......................#',
      '####.##########.########',
      '#.....#.......#........#',
      '#.C...#...C...#..CC....#',
      '#.....#.......#.......E#',
      '#..R..#.......#........#',
      '########################',
    ],
    guards: [
      { waypoints: [[6, 5], [11, 5], [11, 8], [6, 8]] },
      { waypoints: [[16, 1], [21, 1], [21, 4], [16, 4]] },
      { waypoints: [[2, 11], [5, 11], [5, 14], [2, 14]] },
      { waypoints: [[10, 12], [14, 12], [14, 14], [10, 14]] },
      { waypoints: [[19, 6], [21, 6], [21, 9], [19, 9]] },
    ],
  },
];

// Parse one level map into the world model the other modules use:
// solid tiles, shadow tiles, the player start, the exit and the relics.
export function parseLevel(definition) {
  const solid = new Set();
  const shadow = new Set();
  const moonlit = new Set();
  let playerStart = { x: 60, y: 60 };
  let exit = { x: 0, y: 0 };
  const relics = [];
  const key = (col, row) => col + ',' + row;
  definition.map.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === '#' || ch === 'C') solid.add(key(col, row));
      if (ch === ',') shadow.add(key(col, row));
      if (ch === 'M') moonlit.add(key(col, row));
      if (ch === 'P') playerStart = { x: col * 40 + 20, y: row * 40 + 20 };
      if (ch === 'E') exit = { x: col * 40 + 20, y: row * 40 + 20, col, row };
      if (ch === 'R') relics.push({ x: col * 40 + 20, y: row * 40 + 20, taken: false, phase: col * 1.7 + row });
    });
  });
  return {
    name: definition.name,
    hint: definition.hint,
    coins: definition.coins,
    map: definition.map,
    solid,
    shadow,
    moonlit,
    playerStart,
    exit,
    relics,
    guardDefs: definition.guards,
  };
}

export function isSolidTile(level, col, row) {
  if (col < 0 || row < 0 || col >= 24 || row >= 16) return true;
  return level.solid.has(col + ',' + row);
}

export function tileAt(level, x, y) {
  return { col: Math.floor(x / 40), row: Math.floor(y / 40) };
}

export function isShadowAt(level, x, y) {
  const { col, row } = tileAt(level, x, y);
  return level.shadow.has(col + ',' + row);
}

export function isMoonlitAt(level, x, y) {
  const { col, row } = tileAt(level, x, y);
  return level.moonlit.has(col + ',' + row);
}
