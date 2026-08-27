# Project Status

## Milestone

MVP v0.1 — complete and validated.

## Completed features

- Portrait responsive canvas with touch, mouse, and keyboard steering.
- Immediate start, capsule gain, four mathematical gates, two tactical upgrade choices, hazards, four escalating enemy waves, and a boss.
- Rifle and laser composition, automatic target acquisition, aggregate volleys, enemy contact/ranged damage, failure, results, best score, and fast restart.
- Seeded variation in lane placement, hazard routing, and gate choice order/values.
- Procedural neon graphics, formation animation, tracers, particles, shake/flash restraint, and synthesized sound with mute.
- Bounded rendered swarm and short-lived visual effects for mobile performance.
- Deterministic logic test suite and static Vite deployment.

## Validation completed

- 13 deterministic tests pass across five suites.
- ESLint, TypeScript typecheck, and the production Vite build pass.
- A full 390 × 844 browser run was played through: capsule, gates, quality choice, mixed combat, hazards, boss, results, and instant restart.
- Browser console remained free of warnings and errors throughout the timed run.
- The playtest prompted and verified fixes for capsule-aware gate estimates, formation edge bounds, tactical-card typography, and boss durability/retaliation.

## Known gameplay concerns

- Balance is tuned heuristically and needs repeated human runs across intentionally weak and strong route choices.
- Aggregate volleys make very large late swarms intentionally explosive; boss time-to-kill may need adjustment after retention testing.
- Mouse steering follows hover, while touch follows an active drag; trackpad behavior varies slightly by browser.

## Performance risks

- Short-lived tracers and burst circles are allocated on demand, but bounded by fire cadence and event size. A future long-session mode would need explicit pools.
- The WebGL additive blend path is preferred; Canvas fallback is functional but visually flatter.
- The Phaser bundle is the dominant output size. No runtime network request or downloaded asset is required.

## Next recommended playtest

Run five consecutive portrait sessions at 390 × 844: pick quantity twice, quality twice, then alternate choices. Record first-gate comprehension, swarm count at the boss, boss time-to-kill, any zero-swarm failures, and whether RUN AGAIN is pressed within three seconds. The immediate tuning question is whether lasers feel strategically distinct before their compounding benefit becomes obvious at later multiplication gates.
