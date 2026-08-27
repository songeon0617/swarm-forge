import { describe, expect, it } from 'vitest';
import { createUpgradeLevels, selectUpgradeChoices } from './SurvivalUpgradeSystem';

describe('survival upgrade selection', () => {
  it('returns three unique deterministic choices', () => {
    const sequence = [0.1, 0.7, 0.3];
    let index = 0;
    const choices = selectUpgradeChoices(createUpgradeLevels(), () => sequence[index++ % sequence.length]);
    expect(choices).toHaveLength(3);
    expect(new Set(choices.map((choice) => choice.id)).size).toBe(3);
  });

  it('excludes upgrades that reached their maximum level', () => {
    const levels = createUpgradeLevels();
    levels.boltDamage = 5;
    const choices = selectUpgradeChoices(levels, () => 0, 10);
    expect(choices.some((choice) => choice.id === 'boltDamage')).toBe(false);
  });
});
