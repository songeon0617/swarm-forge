# SWARM FORGE

SWARM FORGE is a short-session portrait arcade strategy runner. Steer a tiny futuristic drone squad through capsules, mathematical gates, tactical upgrades, hazards, and enemy formations; turn it into an overwhelming mixed swarm; then melt the Null Foundry boss.

The v0.1 run is finite, semi-procedural, and designed to last roughly 60–90 seconds. It is an original zero-cost HTML5 game built entirely with procedural graphics and synthesized sound.

## Controls

- Touch: drag horizontally.
- Mouse: move or drag horizontally over the game.
- Keyboard: A/D or Left/Right.
- Weapons fire automatically. The top-right sound control mutes all generated audio.

For the best experience, play in portrait orientation. Landscape phones show a rotate-device message.

## Install and develop

Requires a current Node.js LTS release and pnpm.

```bash
pnpm install
pnpm dev
```

The development server prints a local URL. Open it at a portrait viewport such as 390 × 844.

## Validation commands

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

The deterministic tests cover swarm arithmetic, gate quality, upgrade conversion, seeded stage structure, difficulty ramping, and local persistence. Rendering is verified through browser playtesting rather than fragile scene snapshots.

## Static deployment

`pnpm build` creates `dist/`. Vite uses a relative base path, so the same folder works when uploaded to itch.io as an HTML5 ZIP or served by GitHub Pages or Cloudflare Pages. There is no server-side component.

- itch.io: ZIP the contents of `dist/`, create an HTML project, and select “This file will be played in the browser.”
- GitHub Pages: publish `dist/` with a Pages workflow or static deployment action.
- Cloudflare Pages: build command `pnpm build`; output directory `dist`.

## Zero-cost architecture

The game needs no account, backend, database, network API, analytics product, hosted asset, paid font, or commercial media. Phaser, TypeScript, Vite, Vitest, and ESLint are free/open-source dependencies. Art is generated at runtime with Phaser Graphics. Sound is synthesized locally with the Web Audio API. Best score, largest swarm, victories, and settings live only in browser storage. Production output is static files.

See [PROJECT_MAP.md](./PROJECT_MAP.md) for the implementation map and [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current product status.
