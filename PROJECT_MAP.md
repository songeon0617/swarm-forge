# Project Map

## What happens in a run

`GameScene` starts the swarm immediately, projects a finite course toward the player, routes input into horizontal formation movement, resolves choices and hazards, selects combat targets, and presents the boss/results flow. `stageGenerator.ts` supplies the seeded course rhythm, so lane placement and gate ordering vary while the designed escalation remains intact.

## Main locations

- `src/main.ts` — Phaser bootstrap and responsive 390 × 844 virtual canvas.
- `src/game/scenes/GameScene.ts` — run orchestration, input, encounter resolution, combat timing, HUD, boss, and results.
- `src/game/config/balance.ts` — movement speed, drone damage/fire rates, formation limits, enemy stats, and playfield dimensions.
- `src/game/progression/` — seeded randomness and complete stage generation.
- `src/game/swarm/` — authoritative logical counts plus formation point calculation.
- `src/game/gates/` — gate result arithmetic and context-aware gate-pair generation.
- `src/game/upgrades/` — quantity/quality option generation and rifle-to-laser transformations.
- `src/game/render/` — procedural textures, formation view, tracers, bursts, and floating feedback.
- `src/game/audio/` — original Web Audio oscillator effects; no downloaded sound files.
- `src/game/persistence/` — defensive local best-run storage.

## Swarm state and formation

`SwarmState` owns logical rifle and laser counts. The logical count can grow freely. `SwarmView` draws at most 48 drones, distributes them in stable rows, and adjusts the visible laser ratio to match the logical composition. This makes swarm growth readable without turning 100 logical units into 100 heavyweight objects.

## Gates and upgrades

Gate generation compares the immediate gain from addition and multiplication and keeps the alternatives within a useful range. Addition adds baseline rifle drones; multiplication preserves and scales the full composition, which makes earlier laser investment improve future multipliers. Upgrade choices explicitly trade more rifles against converting 25–30% of the current swarm into stronger, slower laser drones.

## Combat

The scene performs lightweight target queries in front of the formation. Rifle and laser volleys are aggregate logical damage events with brief procedural tracers, rather than per-drone physics bullets. Grunts, heavies, turrets, capsules, and the boss use a small runtime record and a few display objects each. Turrets fire back; other enemies deal damage on contact and can be dodged.

## Stage generation

`generateStage(seed)` fixes the pacing beats but varies choice ordering, lanes, hazard sides, and some gate values. Difficulty rises through larger mixed formations and health scaling. A run reaches the boss at distance 4680; at 64 distance units per second, preparation takes about 73 seconds before the short boss lock.

## Tuning

Start with `src/game/config/balance.ts` for global feel. Adjust event distances, capsule values, encounter composition, and boss placement in `src/game/progression/stageGenerator.ts`. Adjust meaningful gate closeness in `src/game/gates/gateLogic.ts`, and quantity/quality offers in `src/game/upgrades/upgradeLogic.ts`.
