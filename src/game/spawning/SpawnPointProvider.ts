import { GAME_HEIGHT, GAME_WIDTH, SURVIVAL_LAYOUT } from '../config/balance';

export interface SpawnPoint {
  x: number;
  y: number;
}

export type SpawnPointProvider = (packIndex: number, random: () => number) => SpawnPoint;

function between(min: number, max: number, random: () => number): number {
  return Math.round(min + (max - min) * random());
}

export const createArenaSpawnPoint: SpawnPointProvider = (packIndex, random) => {
  const offset = packIndex * SURVIVAL_LAYOUT.packOffset;
  const edge = Math.min(3, Math.floor(random() * 4));
  const horizontalPosition = between(
    SURVIVAL_LAYOUT.playfield.left,
    GAME_WIDTH - SURVIVAL_LAYOUT.playfield.right,
    random,
  );
  const verticalPosition = between(
    SURVIVAL_LAYOUT.playfield.top,
    GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom,
    random,
  );
  if (edge === 0) return { x: horizontalPosition, y: -SURVIVAL_LAYOUT.spawnPadding - offset };
  if (edge === 1) return { x: GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding + offset, y: verticalPosition };
  if (edge === 2) return { x: horizontalPosition, y: GAME_HEIGHT + SURVIVAL_LAYOUT.spawnPadding + offset };
  return { x: -SURVIVAL_LAYOUT.spawnPadding - offset, y: verticalPosition };
};

export const createRightEdgeSpawnPoint: SpawnPointProvider = (packIndex, random) => ({
  x: GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding + packIndex * SURVIVAL_LAYOUT.packOffset,
  y: between(SURVIVAL_LAYOUT.playfield.top, GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom, random),
});
