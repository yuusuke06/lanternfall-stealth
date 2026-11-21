// Deterministic scenes for the maker's screenshots, chosen with
// ?shot=<name>&level=<n>. Each scene poses the real game state — same
// levels, same guards, same cones — at a moment that shows one part of
// the game, and together they tour all three galleries: cover behind a
// crate in Gallery I, sneaking across a shadow rug in Gallery II, a
// chase breaking out in the Lantern Vault while a coin pulls another
// guard away, and the unlocked exit at the vault's end.

export function setupShot(game, name) {
  const guards = game.guards;
  const place = (guard, x, y, angle, extra = {}) => {
    if (!guard) return;
    guard.x = x;
    guard.y = y;
    guard.angle = angle;
    Object.assign(guard, extra);
  };

  if (name === 'cover') {
    // Gallery I: a guard's cone breaks on a crate; the thief waits in
    // the shadow the crate makes, a moonlit pool glowing beside him.
    place(guards[0], 372, 190, 0, { detection: 0.12 });
    place(guards[1], 760, 110, Math.PI);
    place(guards[2], 520, 540, -Math.PI / 2);
    game.player.x = 508; game.player.y = 192; game.player.angle = 0.4;
  } else if (name === 'sneak') {
    // Gallery II: crossing the shadow rug inside the edge of a cone,
    // the guard's suspicion arc half full — one held breath from safe.
    place(guards[0], 390, 215, Math.PI / 2, { detection: 0.48, state: 'suspicious' });
    place(guards[1], 700, 110, Math.PI);
    place(guards[2], 340, 500, 0);
    place(guards[3], 850, 340, -Math.PI / 2);
    game.player.x = 428; game.player.y = 330; game.player.angle = Math.PI / 2;
    game.player.mode = 'sneak';
  } else if (name === 'alert') {
    // Gallery III, the Lantern Vault: one guard has the scent and
    // charges; a thrown coin's ring pulls another off his patrol.
    place(guards[0], 425, 295, 0, { detection: 1, state: 'chase' });
    place(guards[1], 700, 90, Math.PI);
    place(guards[2], 215, 140, Math.PI, { state: 'investigate' });
    place(guards[3], 500, 520, -Math.PI / 2);
    place(guards[4], 820, 300, Math.PI / 2, { detection: 0.3 });
    game.player.x = 500; game.player.y = 300; game.player.angle = 0.2;
    game.player.coins.push({ x: 150, y: 140, ring: 0.55 });
    game.player.coinsLeft = 3;
  } else if (name === 'exit') {
    // Gallery IV emptied — even the Mother Moon is hers: the exit
    // burns green and six lanterns sweep empty halls behind her.
    for (const relic of game.level.relics) relic.taken = true;
    place(guards[0], 300, 60, Math.PI / 2);
    place(guards[1], 740, 220, Math.PI / 2);
    place(guards[2], 100, 220, 0);
    place(guards[3], 460, 500, -Math.PI / 2);
    place(guards[4], 820, 500, Math.PI);
    place(guards[5], 500, 260, 0);
    game.player.x = 868; game.player.y = 545; game.player.angle = 0.5;
  }
}
