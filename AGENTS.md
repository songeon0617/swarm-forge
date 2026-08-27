# AGENTS.md

## Product invariants

- Preserve the portrait-first, one-thumb, auto-fire runner design.
- Keep a complete run around 60–90 seconds and restart nearly instant.
- Maintain the quantity-versus-quality decision: rifle count and laser composition must both matter.
- Do not add any required backend, paid API, paid asset, account, or recurring infrastructure cost.
- Favor readability over particle count or screen noise.

## Engineering conventions

- Centralize gameplay tuning in `src/game/config/balance.ts` and data generators.
- Keep arithmetic and generation deterministic and Phaser-independent so Vitest can cover them.
- Treat `SwarmState` as the source of truth; rendered drone count is intentionally capped.
- Avoid a physics body per drone or bullet. Preserve bounded, short-lived effects.
- Add new responsibilities in specifically named modules, not generic helper files.
- Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` after meaningful changes.

## Gameplay review

At a 390 × 844 viewport, verify the first capsule and gate explain the loop, gates remain legible, hazards telegraph clearly, laser conversion is visible, the boss health bar appears, and RUN AGAIN starts a clean new run.
