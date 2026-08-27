# Project Map

## Run flow

`GameScene` creates the player, weapon modules, enemy spawner, XP system, HUD, and input. Each active frame advances the 90-second clock, moves the player, spawns and chases enemies, updates all automatic weapons, attracts XP, and evaluates victory or defeat. Level-up pauses both the clock and Arcade Physics until one upgrade card is selected.

## Responsibilities

- `src/main.ts` — Phaser bootstrap, portrait scaling, and zero-gravity Arcade Physics.
- `src/game/config/balance.ts` — all primary player, weapon, enemy, spawn, and run-duration tuning.
- `src/game/scenes/GameScene.ts` — system orchestration, input, collisions, HUD, choice UI, results, and restart.
- `src/game/entities/Player.ts` — movement, HP, invulnerability, and mutable player stats.
- `src/game/enemies/Enemy.ts` — shared enemy state, pursuit, HP, and contact damage.
- `src/game/weapons/AutoBolt.ts` — nearest-target projectile weapon.
- `src/game/weapons/OrbitBlade.ts` — player-centered orbiting contact weapon.
- `src/game/weapons/ShockPulse.ts` — periodic area damage weapon.
- `src/game/systems/EnemySpawner.ts` — bounded off-screen spawning and pack creation.
- `src/game/systems/Difficulty.ts` — deterministic pacing curve and enemy-type selection rules.
- `src/game/systems/ExperienceSystem.ts` — XP drops, attraction, and collection visuals.
- `src/game/systems/XpProgression.ts` — Phaser-independent XP requirement formula.
- `src/game/systems/RunRules.ts` — Phaser-independent victory and defeat rules.
- `src/game/upgrades/SurvivalUpgradeSystem.ts` — upgrade definitions, unique three-choice selection, caps, and application.
- `src/game/render/` — generated placeholder textures and short-lived effects.

## Performance model

Enemy count is capped at 125. Auto Bolt uses short-lived logical projectiles, Orbit Blade uses only its current blade count, Shock Pulse applies aggregate area damage, and visual bursts self-destruct quickly. There is no body or projectile per logical swarm unit and no external asset loading.

## Main tuning locations

Start in `src/game/config/balance.ts`. Difficulty interpolation and phase thresholds live in `src/game/systems/Difficulty.ts`; upgrade descriptions and maximum levels live in `src/game/upgrades/SurvivalUpgradeSystem.ts`.
