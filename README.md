# Terumbu Karang — Cari Perbedaannya

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/butterscotchcode/terumbu-karang-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/butterscotchcode/terumbu-karang-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game set on a coral reef.
Two near-identical reef scenes side by side; click the differences
before the timer runs out. Five scenes, 43 fair differences, rising
difficulty as you dive deeper. All art is drawn procedurally on canvas
in code — no image files, no network requests.

## Play

Open `game/index.html` in desktop Chrome (or serve `game/` with any
static server). Click a difference on either panel, use **H** for a
hint, **R** to restart, **Enter** to start / continue.

- Scene 1 Laguna Dangkal — 7 differences, 150 s
- Scene 2 Taman Karang — 8 differences, 150 s
- Scene 3 Bangkai Kapal — 9 differences, 135 s
- Scene 4 Gua Biru — 9 differences, 120 s
- Scene 5 Palung Dalam — 10 differences, 105 s

A find scores +100, a scene's leftover time is worth +5/second, a hint
costs 25 points, a wrong click costs 5 points and 3 seconds.

## Layout

```
main.ts                  entry program: copies game/ + screenshots/ to
                         /output and writes /output/dossier.json
vendor/makefun-game.ts   the kit's dossier library, unchanged
game/
  index.html             the page (1280 x 720 canvas)
  src/config.js          constants: layout, scoring, palettes
  src/rng.js             seeded random (both panels share one seed)
  src/art.js             procedural drawing: fish, coral, turtle, ...
  src/scenes.js          the 5 scenes + their 43 differences
  src/state.js           rules: timer, score, hints, scene flow
  src/render.js          HUD, panels, markers, title/clear/end screens
  src/input.js           mouse + keyboard
  src/audio.js           tiny WebAudio sound effects, no files
  src/main.js            boot, game loop, demo staging params
screenshots/            4 real renders of the game in a browser
```

## Build check

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # run twice, compare bytes
```
