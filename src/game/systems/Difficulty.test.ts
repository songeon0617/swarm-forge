import { describe, expect, it } from 'vitest';
import { chooseEnemyType, difficultyAt } from './Difficulty';

describe('difficulty scaling', () => {
  it('increases pressure across the 90-second run', () => {
    const early = difficultyAt(0);
    const middle = difficultyAt(45);
    const late = difficultyAt(80);
    expect(middle.spawnIntervalMs).toBeLessThan(early.spawnIntervalMs);
    expect(late.spawnIntervalMs).toBeLessThan(middle.spawnIntervalMs);
    expect(late.hpMultiplier).toBeGreaterThan(middle.hpMultiplier);
    expect(late.packSize).toBe(3);
  });

  it('unlocks runners and tanks only in their intended phases', () => {
    expect(chooseEnemyType(20, 0.99)).toBe('grunt');
    expect(chooseEnemyType(40, 0.9)).toBe('runner');
    expect(chooseEnemyType(70, 0.9)).toBe('tank');
  });
});
