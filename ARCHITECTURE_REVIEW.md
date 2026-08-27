# Architecture Review

Reviewed against commit `7e650d4` with the next direction defined as a mobile-first, short-session survival defense game where many enemies approach from one direction.

## Main findings

### GameScene responsibility

`GameScene` had accumulated input registration, persistent HUD construction, upgrade-card construction, combat coordination, run lifecycle, effects, and result UI. That was too much for a scene that will need a different camera and movement model in v0.2. The safe refactor extracted player input, persistent HUD rendering, and upgrade overlay rendering. The scene now remains the composition root and coordinates combat/run events.

It still owns direct enemy-contact resolution, enemy death rewards, backdrop creation, and result UI. Those are acceptable for the current MVP. Extracting a general combat framework or state-machine layer now would be premature; revisit only when the side-view combat rules are concrete.

### Module boundaries

- `Player` cleanly owns movement, HP, invulnerability, and mutable player stats.
- `Enemy` is small and cohesive but its radial `chase(target)` behavior is arena-specific.
- Weapon modules are appropriately separate and bounded. They depend on concrete `Player` and `Enemy` classes, which is simpler than introducing interfaces before v0.2 rules are known.
- `EnemySpawner` owns cadence and entity creation. Spawn geometry is now injected through a small `SpawnPointProvider` seam.
- XP progression and run rules are Phaser-independent and well tested. XP visuals and attraction remain together because separating them would add little value at MVP scale.
- Difficulty calculations are pure. Enemy unlocks, pack thresholds, multipliers, and selection thresholds now come from centralized configuration instead of duplicated literals.
- Upgrade selection is deterministic when supplied a random source, enforces unique choices, and has a UI-level plus scene-level single-selection guard. Upgrade application still knows concrete player/weapon fields; retain this until the modifier set becomes materially larger.

### Balance and configuration

Obsolete runner-era balance tables were removed. Player, weapon, enemy, spawn, difficulty, XP attraction, upgrade effects, playfield bounds, and spawn padding are centralized in `balance.ts`. Presentation coordinates, colors, collision-shape offsets, and short effect timings remain local because they are layout/rendering concerns rather than gameplay balance.

### Mobile readiness

The fixed 390 × 844 virtual canvas with Phaser `FIT`, dynamic viewport CSS, scroll suppression, and landscape guidance remains a sound MVP approach. Input is now isolated behind `PlayerInputController`, so a v0.2 one-axis drag/virtual-stick policy can replace the current move-toward-pointer behavior without changing `GameScene`.

Remaining mobile risks are the lack of safe-area-specific HUD offsets, no reduced-motion option, unpooled transient projectiles/effects, and the absence of profiling on ordinary phones.

### Abstraction and duplication

The codebase does not need a generic entity/component framework, event bus, dependency injection container, or universal weapon base class. The new input, HUD, upgrade overlay, and spawn-point provider are narrow boundaries tied to demonstrated change pressure. Weapon implementations intentionally retain some similar update signatures instead of introducing a base hierarchy with little shared behavior.

## Reuse for v0.2

- Phaser/Vite bootstrap and portrait viewport handling
- Player HP, stats, invulnerability, and upgrade interaction
- Auto Bolt targeting/projectile behavior
- Orbit Blade and Shock Pulse as optional weapon modules after directional-play testing
- XP drops, attraction, progression formula, and level-up pause
- Upgrade pool, unique selection, caps, and single-choice locking
- Pure difficulty/run rules and their tests
- Procedural texture/effect pipeline and persistent HUD module

## Change for v0.2

1. Replace `createArenaSpawnPoint` with a one-direction/lane-oriented provider and wave composition rules.
2. Replace radial `Enemy.chase` with an approach policy suitable for enemies advancing toward a defensive line or player corridor.
3. Replace unrestricted 2D movement with the chosen mobile movement policy, probably constrained vertical positioning or short lateral movement.
4. Add camera/world motion only after the defensive line and scrolling model are decided.
5. Rebalance weapons and XP around dense forward pressure and faster rewards; avoid importing Vampire Survivors complexity.
6. Profile enemy, bolt, orb, and effect allocations before raising density; pool only where measurements justify it.
7. Extract combat resolution or run-state presentation from `GameScene` only when the side-view rules make their responsibilities stable.
