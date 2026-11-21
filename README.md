# The Quiet Gallery

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Ranger-putih/stealth-game/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Ranger-putih/stealth-game/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**The Quiet Gallery** is a top-down stealth game made for make.fun's [best stealth game bounty](https://make.fun/bounty/best-stealth-game-20261121-1759) ($50 in USDC). You are the night archivist of a small museum, sneaking through the galleries after hours to return three borrowed artifacts to their cases before dawn — while three guards patrol the floor with lanterns and watchful eyes.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static server). No network, no install, no library — plain Canvas 2D and procedural WebAudio.

- **WASD / arrow keys** — move
- **Shift** — walk slow and quiet (smaller noise, harder to spot)
- **E** — pick up / return an artifact when you are close to it
- **R** — restart after being caught or after winning

Stay out of the guards' yellow vision cones. A guard who glimpses you grows suspicious (**?**) and comes to look; a guard who sees you clearly gives chase (**!**) — and if one catches you, the night is over. Hide behind display cases and statues, which block a guard's sight, and duck into the dark shadow pools, where you are much harder to spot. Running is loud: your noise ring gives you away. Collect all three artifacts — the Sun Disk, the Jade Mask and the Moon Scroll — then slip out the exit door unseen.

## The game

- One museum floor, seen from above: the North Gallery, the Grand Hall, the East and West Wings
- Three patrolling guards (Mara, Bram and Ilsa) with visible vision cones and three states — patrol, suspicious, alert
- Cover you can read at a glance: glass display cases, marble statues, shadow zones
- A detection meter, a clock, and an objective line in the HUD
- Procedural sound only: soft footsteps, an alert blip, a pickup chime, a win arpeggio — no audio files
- Title screen, caught screen and win screen

## Screenshots

The four screenshots under `screenshots/` are renders of the game's own code, taken in a browser at 1280×720:

1. `1-overview.jpg` — the whole floor, all three guards and their cones
2. `2-cone.jpg` — a near miss at the edge of Mara's cone
3. `3-cover.jpg` — hiding behind a display case while a cone sweeps past
4. `4-win.jpg` — dawn breaks: all three artifacts returned, out the exit unseen

Each shot is deterministic: open `game/index.html?shot=overview&seed=1` (or `cone`, `cover`, `win`) and the scene is frozen, so the same shot always renders the same picture.

## Run it

```sh
# Play it in a browser (any static server works):
cd game && python3 -m http.server 8080
# then open http://localhost:8080

# Hand it in (writes game/, screenshots/ and dossier.json to out/):
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built with [make.fun](https://make.fun/r/6r5bjdgf) — if you want to try the bounties yourself, that link is Gilang's referral.
