# SWARM FORGE

SWARM FORGE v0.3 is a portrait-first, 90-second browser survival game. Move a neon combat core against packs arriving from the right while automatic weapons and simple defenses clear the swarm. Collect experience, choose one of three upgrades, and survive until the timer reaches zero.

The game runs entirely in the browser with cohesive procedural graphics and generated Web Audio effects. It has no backend, accounts, paid services, analytics, or external asset requirements.

## Live demo

Play the current public build at [songeon0617.github.io/swarm-forge](https://songeon0617.github.io/swarm-forge/). Portrait orientation is recommended on mobile.

## Controls

- Keyboard: WASD or Arrow keys
- Touch/pointer: press or drag toward the desired movement direction
- Weapons fire automatically

## Gameplay loop

1. Grunts begin spawning and chasing the player.
2. Auto Bolt targets the nearest enemy, Orbit Blade damages nearby enemies, and Shock Pulse clears an area periodically.
3. Defeated enemies drop visible XP orbs that attract inside the pickup radius.
4. Leveling pauses the game and presents three mutually exclusive upgrades, including Auto Turret and Blast Mine unlocks.
5. Runners enter at 20 seconds, Tanks at 45 seconds, and large mixed packs push hard from 70 seconds.
6. Spawn frequency, enemy health, enemy speed, and pack size rise toward a dangerous final 20 seconds.
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

## Deployment

Pushes to `main` are validated, built, and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. The workflow uses GitHub's official Pages actions and the package-manager version pinned in `package.json`. Vite emits relative asset URLs so the build works under the `/swarm-forge/` project path.

## Architecture summary

- `src/game/scenes/GameScene.ts` coordinates the run, input, HUD, level-up overlay, end states, and restart.
- `src/game/entities/Player.ts` owns player movement, HP, invulnerability, and base stats.
- `src/game/enemies/Enemy.ts` implements shared chase and damage behavior for Grunt, Runner, and Tank.
- `src/game/weapons/` contains independent Auto Bolt, Orbit Blade, and Shock Pulse modules.
- `src/game/defense/` contains the independent companion turret and automatic contact-mine modules.
- `src/game/audio/AudioFeedback.ts` owns input-gated, generated Web Audio feedback.
- `src/game/systems/` contains spawning, difficulty, XP collection, XP progression, and run outcome rules.
- `src/game/upgrades/SurvivalUpgradeSystem.ts` owns the reusable upgrade pool, deterministic selection logic, level caps, and effects.
- `src/game/config/balance.ts` centralizes player, weapon, enemy, spawn, and run-duration tuning.
- `src/game/render/` contains procedural textures and bounded feedback effects.

Pure calculations are kept independent from Phaser where practical, allowing deterministic Vitest coverage for XP requirements, upgrade selection, difficulty phases, and victory/defeat rules.

## Current v0.3 scope

- Smooth eight-direction keyboard movement and basic touch movement
- 90-second timer, victory, death, and restart
- Three escalating enemy archetypes
- Three modular automatic weapons
- Upgrade-unlocked Auto Turret and Blast Mine defenses
- XP drops, magnetic pickup, leveling, and paused three-choice upgrades
- A compact, dependency-aware upgrade pool with clear maximum levels
- Readable portrait HUD for HP, XP, level, time, and weapon state
- Cohesive procedural silhouettes, bounded combat effects, and lightweight generated audio

## Future improvement ideas

- Tune enemy pressure and XP pacing through repeated real-device full-run playtests
- Profile sustained 70–90 second pressure on lower-end Android hardware
- Pool transient projectiles only if real-device profiling shows allocation pressure
- Add accessibility options such as reduced shake and larger UI text

Do not add monetization, advertisements, accounts, permanent progression, bosses, weapon evolutions, or backend services until the core survival loop has been validated.
