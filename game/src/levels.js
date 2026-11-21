// The three galleries of the night museum, drawn as tile maps.
// Legend: # wall, C crate (solid cover), . open floor, , shadow rug
// (detection is slower while you stand on it), M moonlit floor under a
// high window (detection is faster — the moon betrays you there),
// P player start, E exit door, R moon relic, * the First Moon (the
// grand relic). Guards patrol the
// waypoint loops listed under each map; waypoints are tile coords.

// The grand relic: the Mother Moon, kept in the final gallery. It is
// one relic among the gallery's count, but larger, brighter, and the
// story's whole point — Lune came for this one above all.
export const GRAND_RELIC_NAME = 'the Mother Moon';

export const LEVELS = [
  {
    name: 'Gallery I — First Moon',
    hint: 'WASD / arrows to move · SHIFT run (loud) · C sneak · CLICK throw a coin',
    spirit: {
      name: 'Spirit of the Empty Vase',
      col: 18, row: 8,
      intro: [
        'I am an empty vase. Long ago, someone filled me with fresh flowers every day.',
        'I thought being empty was a lonely thing. But listen — it is because I am empty that the moonlight can gather inside me.',
        'Take my treasured moon with you. Being empty was not a lack. It was a shape for waiting.',
      ],
      farewell: 'Go safely. I will stay here, and wait for the moon.',
    },
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
    spirit: {
      name: 'Spirit of the Stopped Clock',
      col: 12, row: 13,
      intro: [
        'I am a clock that stopped. Time left me behind and hurried on ahead.',
        'But while I was stopped, people still laughed here, and cried here, and passed me by.',
        'Perhaps time is not a river that flows. Perhaps it is a jar that fills. Take my treasured moon with you.',
      ],
      farewell: 'My time moved a little today — the part of it I spent with you.',
    },
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
    spirit: {
      name: 'Spirit of the Flightless Bird',
      col: 11, row: 7,
      intro: [
        'I am a bird that cannot fly. The sky is only on the other side of the glass now.',
        'But every night, in my dreams, I am flying. My body stays here, yet my dreams are free.',
        'Perhaps freedom is not a place. It is the way a heart faces. Take my treasured moon to the sky for me.',
      ],
      farewell: 'Go safely. I will be waiting in the sky of my dreams.',
    },
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
  {
    name: 'Gallery IV — The Mother Moon',
    hint: 'Six lanterns, and the Mother Moon watching over her children.',
    spirit: {
      name: 'Spirit of the Mother Moon',
      col: 11, row: 6,
      intro: [
        'I am the Mother Moon. I have watched over the children of this museum for a very long time.',
        'But to protect and to imprison — they look alike, and they are not the same.',
        'So please, take me with you too. To let go is not the same as to stop loving, is it?',
      ],
      farewell: 'Thank you. It is lonely when what you protected leaves you. But you taught me — that, too, is love.',
    },
    coins: 4,
    map: [
      '########################',
      '#P...#......#......#...#',
      '#....#..R...#..CC..#...#',
      '#.C..#......#......#.R.#',
      '#....###.####..C...#...#',
      '#.........M............#',
      '#..CC...,,,,,...###.####',
      '#.......,,,,,..........#',
      '#..R....,,,,,....C.....#',
      '#.......,,,,,..........#',
      '#....###.####......R...#',
      '#......................#',
      '#.C..#......#..CC..#...#',
      '#....#..*...#......#..E#',
      '#....#......#..R...#...#',
      '########################',
    ],
    guards: [
      { waypoints: [[7, 1], [11, 1], [11, 3], [7, 3]] },
      { waypoints: [[18, 5], [21, 5], [21, 8], [18, 8]] },
      { waypoints: [[2, 5], [5, 5], [5, 8], [2, 8]] },
      { waypoints: [[9, 11], [14, 11], [14, 13], [9, 13]] },
      { waypoints: [[20, 11], [20, 14], [17, 14], [17, 11]] },
      { waypoints: [[12, 5], [12, 8], [15, 8], [15, 5]] },
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
      if (ch === 'R') relics.push({ x: col * 40 + 20, y: row * 40 + 20, taken: false, grand: false, phase: col * 1.7 + row });
      if (ch === '*') relics.push({ x: col * 40 + 20, y: row * 40 + 20, taken: false, grand: true, phase: col * 1.7 + row });
    });
  });
  return {
    name: definition.name,
    hint: definition.hint,
    spirit: definition.spirit
      ? { ...definition.spirit, x: definition.spirit.col * 40 + 20, y: definition.spirit.row * 40 + 20 }
      : null,
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
