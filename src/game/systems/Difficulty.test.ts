import { describe, expect, it } from 'vitest';
import { SURVIVAL_ENEMIES } from '../config/balance';
import { chooseEnemyType, difficultyAt } from './Difficulty';

describe('difficulty scaling', () => {
  it('increases pressure across the 90-second run', () => {
    const early = difficultyAt(0);
    const middle = difficultyAt(45);
    const late = difficultyAt(80, 0.99);
    expect(middle.spawnIntervalMs).toBeLessThan(early.spawnIntervalMs);
    expect(late.spawnIntervalMs).toBeLessThan(middle.spawnIntervalMs);
    expect(late.hpMultiplier).toBeGreaterThan(middle.hpMultiplier);
    expect(late.packSize).toBe(6);
  });

  it('unlocks runners and tanks only in their intended phases', () => {
    expect(chooseEnemyType(SURVIVAL_ENEMIES.runner.unlockAt - 1, 0.99)).toBe('grunt');
    expect(chooseEnemyType(SURVIVAL_ENEMIES.runner.unlockAt, 0.2)).toBe('runner');
    expect(chooseEnemyType(SURVIVAL_ENEMIES.tank.unlockAt, 0.1)).toBe('tank');
    expect(difficultyAt(SURVIVAL_ENEMIES.runner.unlockAt).availableTypes).toContain('runner');
    expect(difficultyAt(SURVIVAL_ENEMIES.tank.unlockAt).availableTypes).toContain('tank');
  });

  it('switches to distinct pack profiles at each phase boundary', () => {
    expect(difficultyAt(19.99, 0).packSize).toBe(1);
    expect(difficultyAt(20, 0).packSize).toBe(2);
    expect(difficultyAt(45, 0).packSize).toBe(3);
    expect(difficultyAt(70, 0).packSize).toBe(4);
    expect(difficultyAt(70).spawnIntervalMs).toBeLessThan(difficultyAt(45).spawnIntervalMs);
  });
});
