# Project Status

## Milestone

Experimental v0.3 public beta release-frozen for HOLD / DATA COLLECTION.

## Completed

- Portrait client-side Phaser game with WASD, Arrow keys, and basic pointer/touch movement.
- Player HP, movement, experience, levels, invulnerability, death, victory, and immediate restart.
- Grunt, Runner, and Tank enemies with staged introduction and increasing pressure.
- Modular Auto Bolt, Orbit Blade, and Shock Pulse weapons.
- Visible XP drops, attraction, collection, increasing level requirements, and paused level-up flow.
- Three randomized unique upgrade cards with a guarded, mutually exclusive selection path.
- Ten upgrades covering weapon damage, speed, count/radius, player speed, HP, and XP pickup range.
- Readable HP, XP, level, timer, and weapon HUD.
- Deterministic tests for XP progression, upgrade selection, difficulty scaling, and run outcomes.
- Static zero-cost build with procedural visuals and no backend or external assets.

## Validation

- Browser smoke-tested at 390 × 844: touch movement, enemy pursuit, automatic attacks, XP collection, level-up pause, one-of-three upgrade application, and gameplay resume.
- Selecting `EXTRA BLADE` increased only Orbit Blade from one to two and dismissed all cards.
- Browser console remained free of warnings and errors during the test.
- TypeScript, ESLint, Vitest, and production build validation pass.

## Remaining MVP weaknesses

- A complete human-played 90-second balance sample is still needed; automated rules verify the deadline but cannot judge fun or fairness.
- Combat uses compact procedural graphics and generated Web Audio rather than authored assets or accessibility controls.
- Enemy avoidance may be too easy early and too abrupt late until spawn, XP, and damage curves receive several full-run samples.
- Transient bolts and effects are bounded but not pooled; profile on ordinary mobile hardware before increasing density.

## Next recommended action

Play five complete runs at 390 × 844 and record death time, level at 30/60/90 seconds, upgrade selections, peak enemy count, and final-15-second readability. Hold feature development until those measurements justify a focused game-feel or balance change.

## Architecture checkpoint

- Extracted keyboard/touch handling from `GameScene` into a replaceable input controller.
- Extracted persistent HUD and level-up card presentation into focused UI modules.
- Added an injectable spawn-point provider while preserving current arena spawning.
- Removed obsolete runner-era balance values and centralized difficulty, XP attraction, upgrade effects, playfield, and spawn tuning.
- Reduced `GameScene` while deliberately retaining combat coordination and run lifecycle until v0.2 directional rules are defined.
- Documented retained and changed components for the one-direction survival-defense transition in `ARCHITECTURE_REVIEW.md`.
