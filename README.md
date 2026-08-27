# SWARM FORGE

SWARM FORGE is a portrait-first, 90-second browser survival roguelite. Move a neon combat core through an enclosing swarm while three weapons fire automatically, collect experience from destroyed enemies, and choose one of three upgrades whenever you level up. Survive until the timer reaches zero to win.

The MVP runs entirely in the browser with procedural placeholder graphics. It has no backend, accounts, paid services, analytics, or external asset requirements.

## Controls

- Keyboard: WASD or Arrow keys
- Touch/pointer: press or drag toward the desired movement direction
- Weapons fire automatically

## Gameplay loop

1. Grunts begin spawning and chasing the player.
2. Auto Bolt targets the nearest enemy, Orbit Blade damages nearby enemies, and Shock Pulse clears an area periodically.
3. Defeated enemies drop visible XP orbs that attract inside the pickup radius.
4. Leveling pauses the game and presents three randomized, mutually exclusive upgrades.
5. Runners enter around 30 seconds; Tanks enter around 60 seconds.
6. Spawn frequency, enemy health, enemy speed, and pack size rise toward a dangerous final 15 seconds.
7. Reach 90 seconds to win, or lose all core HP to end the run. `RUN AGAIN` restarts immediately.

## Development

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The primary test viewport is 390 × 844.

## Validation commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The production output is written to `dist/` and can be deployed as static files to itch.io, GitHub Pages, or Cloudflare Pages.

## Architecture summary

- `src/game/scenes/GameScene.ts` coordinates the run, input, HUD, level-up overlay, end states, and restart.
- `src/game/entities/Player.ts` owns player movement, HP, invulnerability, and base stats.
- `src/game/enemies/Enemy.ts` implements shared chase and damage behavior for Grunt, Runner, and Tank.
- `src/game/weapons/` contains independent Auto Bolt, Orbit Blade, and Shock Pulse modules.
- `src/game/systems/` contains spawning, difficulty, XP collection, XP progression, and run outcome rules.
- `src/game/upgrades/SurvivalUpgradeSystem.ts` owns the reusable upgrade pool, deterministic selection logic, level caps, and effects.
- `src/game/config/balance.ts` centralizes player, weapon, enemy, spawn, and run-duration tuning.
- `src/game/render/` contains procedural textures and bounded feedback effects.

Pure calculations are kept independent from Phaser where practical, allowing deterministic Vitest coverage for XP requirements, upgrade selection, difficulty phases, and victory/defeat rules.

## Current MVP scope

- Smooth eight-direction keyboard movement and basic touch movement
- 90-second timer, victory, death, and restart
- Three escalating enemy archetypes
- Three modular automatic weapons
- XP drops, magnetic pickup, leveling, and paused three-choice upgrades
- Ten reusable upgrades with maximum levels
- Readable portrait HUD for HP, XP, level, time, and weapon state
- Procedural neon placeholder visuals and lightweight feedback

## Future improvement ideas

- Tune enemy pressure and XP pacing through repeated full-run playtests
- Improve hit audio and combat readability without increasing visual noise
- Add stronger formation motion and escalation cues during the final 15 seconds
- Pool transient projectiles and effects if mobile profiling shows allocation pressure
- Add accessibility options such as reduced shake and larger UI text

Do not add monetization, advertisements, accounts, permanent progression, bosses, weapon evolutions, or backend services until the core survival loop has been validated.
