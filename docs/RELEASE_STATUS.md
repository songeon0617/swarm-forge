# Release Status

## State

- Product: SWARM FORGE v0.3.0
- Release state: Experimental Public Beta — release freeze
- Freeze date: 2026-08-28
- Operating mode: HOLD / DATA COLLECTION

## Validation performed

- Reinstalled dependencies with `pnpm install --frozen-lockfile`.
- Passed `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Served the production build locally at 390 × 844 and checked startup, canvas sizing, automatic weapons, XP collection, level-up pause and mutually exclusive selection, Auto Turret, Blast Mine, defeat, victory, and `RUN AGAIN` reset.
- Reloaded the production page and monitored the browser console during QA; no warnings or errors were observed.
- Reviewed tracked files and repository text for secrets, machine-specific paths, debug statements, and ignored build/dependency artifacts.

## Release-freeze changes

- Made the victory headline read the centralized run duration rather than duplicating a hard-coded value.
- Added `pnpm preview` and the combined `pnpm validate` release check.
- Updated GitHub Pages actions to their Node 24-compatible major versions.
- Updated public-beta status, setup, validation, limitations, and HOLD / DATA COLLECTION guidance.
- Corrected stale architecture/status documentation.

## Known issues and limitations

- Sustained keyboard and touch movement were previously smoke-tested manually; this automated pass could send discrete input but could not hold input long enough for a meaningful movement sample.
- A complete human-played 90-second balance and readability sample remains required; the victory branch was exercised with a temporary shortened local test configuration that was restored before final validation.
- Lower-end physical Android performance has not been profiled.

## Distribution

`pnpm build` creates the static `dist/` output. Pushes to `main` run validation and deploy that output through `.github/workflows/deploy-pages.yml`. No backend, account, paid API, or external asset service is required.

## Next action

Run at least five complete 390 × 844 real-device sessions and collect death time, level progression, upgrade choices, peak pressure, and final-15-second readability before changing balance or adding features.
