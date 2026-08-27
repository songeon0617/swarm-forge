import { describe, expect, it } from 'vitest';
import { GAME_HEIGHT, GAME_WIDTH, SURVIVAL_LAYOUT } from '../config/balance';
import { createRightEdgeSpawnPoint } from './SpawnPointProvider';

describe('right-edge spawn points', () => {
  it('places every enemy beyond the right edge and within the playable vertical range', () => {
    const randomValues = [0, 0.25, 0.5, 0.75, 1];

    randomValues.forEach((value) => {
      const point = createRightEdgeSpawnPoint(0, () => value);
      expect(point.x).toBe(GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding);
      expect(point.y).toBeGreaterThanOrEqual(SURVIVAL_LAYOUT.playfield.top);
      expect(point.y).toBeLessThanOrEqual(GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom);
    });
  });

  it('staggers pack members horizontally so they cannot fully overlap', () => {
    const fixedRandom = () => 0.5;
    const points = [0, 1, 2].map((packIndex) => createRightEdgeSpawnPoint(packIndex, fixedRandom));

    expect(points.map(({ x }) => x)).toEqual([
      GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding,
      GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding + SURVIVAL_LAYOUT.packOffset,
      GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding + SURVIVAL_LAYOUT.packOffset * 2,
    ]);
    expect(new Set(points.map(({ x, y }) => `${x},${y}`)).size).toBe(points.length);
  });
});
