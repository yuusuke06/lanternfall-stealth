// Deterministic scenes for the maker's screenshots, chosen with
// ?shot=<name>. Each scene poses the real game state — same level, same
// guards, same cones — at a moment that shows one part of the game:
// cover behind a crate, sneaking across a shadow rug, a guard alarmed
// while a coin pulls another away, and the unlocked exit.

export function setupShot(game, name) {
  const [first, second, third] = game.guards;
  if (name === 'cover') {
    // Guard's cone breaks on a crate; the thief waits in its shadow.
    first.x = 372; first.y = 190; first.angle = 0; first.detection = 0.12;
    game.player.x = 508; game.player.y = 192; game.player.angle = 0.4;
    second.x = 760; second.y = 110; second.angle = Math.PI;
    if (third) { third.x = 520; third.y = 540; third.angle = -Math.PI / 2; }
  } else if (name === 'sneak') {
    // Crossing the rug inside the edge of a cone, meter half full.
    game.player.x = 428; game.player.y = 348; game.player.angle = Math.PI / 2;
    game.player.mode = 'sneak';
    first.x = 428; first.y = 238; first.angle = Math.PI / 2; first.detection = 0.48;
    first.state = 'suspicious';
    second.x = 830; second.y = 250; second.angle = Math.PI;
    if (third) { third.x = 300; third.y = 540; third.angle = 0; }
  } else if (name === 'alert') {
    // One guard has the scent and charges; a thrown coin pulls another.
    game.player.x = 716; game.player.y = 556; game.player.angle = 0.2;
    game.player.coins.push({ x: 268, y: 128, ring: 0.55 });
    game.player.coinsLeft = 2;
    if (third) {
      third.x = 636; third.y = 552; third.angle = 0; third.detection = 1;
      third.state = 'chase';
    }
    first.x = 330; first.y = 128; first.angle = Math.PI; first.state = 'investigate';
    second.x = 800; second.y = 90; second.angle = Math.PI / 2; second.detection = 0.3;
  } else if (name === 'exit') {
    // Every relic taken: the exit burns green and the way is clear.
    for (const relic of game.level.relics) relic.taken = true;
    game.player.x = 872; game.player.y = 548; game.player.angle = 0.5;
    first.x = 220; first.y = 260; first.angle = Math.PI / 2;
    second.x = 700; second.y = 130; second.angle = Math.PI;
    if (third) { third.x = 480; third.y = 540; third.angle = -Math.PI / 2; }
  }
}
