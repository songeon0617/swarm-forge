import { describe, expect, it } from 'vitest';
import { SURVIVAL_BALANCE, SURVIVAL_ENEMIES } from '../config/balance';
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
    expect(chooseEnemyType(SURVIVAL_ENEMIES.runner.unlockAt - 1, 0.99)).toBe('grunt');
    expect(
      chooseEnemyType(SURVIVAL_ENEMIES.runner.unlockAt, SURVIVAL_BALANCE.difficulty.runnerRollThreshold + 0.01),
    ).toBe('runner');
    expect(chooseEnemyType(SURVIVAL_ENEMIES.tank.unlockAt, SURVIVAL_BALANCE.difficulty.tankRollThreshold + 0.01)).toBe(
      'tank',
    );
    expect(difficultyAt(SURVIVAL_ENEMIES.runner.unlockAt).availableTypes).toContain('runner');
    expect(difficultyAt(SURVIVAL_ENEMIES.tank.unlockAt).availableTypes).toContain('tank');
  });
});
