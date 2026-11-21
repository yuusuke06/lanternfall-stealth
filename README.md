# Lanternfall — Night Museum Stealth

![make.fun bounty](https://make.fun/badge/best-stealth-game-20261121-1759.svg)
![rank](https://make.fun/badge/best-stealth-game-20261121-1759/yuusuke06/lanternfall-stealth/rank.svg)
![reward](https://make.fun/badge/best-stealth-game-20261121-1759/yuusuke06/lanternfall-stealth/reward.svg)

An original top-down stealth game for the make.fun
[best stealth game bounty](https://make.fun/c/best-stealth-game-20261121-1759).

The night museum keeps its moon relics under lantern light. You are
Lune, a small girl with a little lantern who has slipped in after
closing: slip past the lantern guards, take every moon relic in four
galleries, and reach the exit unseen — a quiet, slightly eerie night
walk through dark halls. In the last gallery waits the Mother Moon,
the grand relic she came for above all.

## How to play

- **WASD / arrow keys** — move
- **SHIFT** — run: fast, but your footsteps carry and guards come to look
- **C** — sneak: slow, faint, and hard to spot
- **Mouse click** — throw a coin; its click pulls guards off their patrol
- Guards see in cones that walls and crates carve up. A glimpse fills a
  guard's suspicion arc; hide and it drains. Full certainty means a chase —
  break line of sight and he loses you at the last place he saw.
- Dark rugs muffle you: detection fills far more slowly while you cross them.
- Moonlight pools under the high windows betray you twice over:
  detection fills far faster while you stand in one, and the light rings
  like glass underfoot — walking or running across it chimes, and nearby
  guards come to look. Only sneaking crosses in silence. The prettiest
  floor is the most dangerous.
- Clear a gallery without ever being chased and it is marked PHANTOM,
  with your time — vanish unseen, like the rumour she is.
- The exit door stays locked red until every relic in the gallery is taken,
  then it burns green.

## Music

An original generative score, synthesised live with WebAudio — a felt
piano and a music box over a slow Dm9 – B♭maj7 – Fmaj9 – A7sus cycle,
written as a moonlit miniature. When a guard's suspicion rises, a quiet
tension voice joins the score and fades again when the danger passes.
See `game/src/music.js`.

## Running it

The game is plain static files under `game/` with no build step and no
network requests. Serve that folder with any static server, or run
`node serve.ts` and open http://localhost:8080.

## Layout

- `game/src/main.js` — boot, game loop and state machine
- `game/src/levels.js` — the three galleries as tile maps and patrol loops
- `game/src/vision.js` — line of sight, vision cones, collision
- `game/src/guards.js` — guard patrols, suspicion, investigation, chase
- `game/src/player.js` — the thief: gaits, noise, coins, relics
- `game/src/render.js` — floor, cover, cones, lantern lighting, HUD
- `game/src/audio.js` — synthesised footsteps, coins and alarms (WebAudio)
- `game/src/music.js` — the generative moonlit score and its tension voice
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — posed scenes used for the screenshots

`main.ts` at the root hands the entry in: it copies `game/` and
`screenshots/` to the output directory and writes `dossier.json`.
