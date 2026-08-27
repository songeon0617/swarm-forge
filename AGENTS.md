# AGENTS.md

## Product invariants

- Preserve the portrait-first, one-thumb, auto-fire runner design.
- Keep a complete run around 60–90 seconds and restart nearly instant.
- Maintain understandable quantity-versus-quality decisions through weapon count, attack rate, damage, and player upgrades.
- Do not add any required backend, paid API, paid asset, account, or recurring infrastructure cost.
- Favor readability over particle count or screen noise.

## Engineering conventions

- Centralize gameplay tuning in `src/game/config/balance.ts` and data generators.
- Keep arithmetic and generation deterministic and Phaser-independent so Vitest can cover them.
- Treat `Player`, `WeaponStats`, and `UpgradeLevels` as the current run-state sources of truth.
- Avoid unnecessary physics bodies and preserve bounded, short-lived effects.
- Add new responsibilities in specifically named modules, not generic helper files.
- Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` after meaningful changes.

## Gameplay review

At a 390 × 844 viewport, verify touch and keyboard movement, all three automatic weapons, XP collection, the mutually exclusive three-choice level-up flow, readable late-run pressure, victory/death, and a clean RUN AGAIN restart.

## Delivery workflow

For each major implementation or refactoring unit, follow:

`implementation/refactor → validation → git status review → Conventional Commit → normal GitHub push`

Run formatting, lint, typecheck, tests, and production build before committing. Never force push or rewrite history as part of the normal workflow.

## Direction after the current MVP

- Keep the game mobile-first, readable, short-session, and fast to reward.
- Favor a simple survival-defense feel with many enemies approaching from one direction.
- Do not grow into a complex Vampire Survivors clone.
- Keep spawn geometry and movement policy replaceable until the side-view v0.2 rules are validated.
