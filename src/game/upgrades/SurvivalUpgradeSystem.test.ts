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

  it('always offers one understandable defense unlock before its upgrades', () => {
    const choices = selectUpgradeChoices(createUpgradeLevels(), () => 0.99);
    expect(choices.some((choice) => choice.id === 'turretUnlock' || choice.id === 'mineUnlock')).toBe(true);
    expect(choices.some((choice) => choice.id === 'turretDamage' || choice.id === 'turretSpeed')).toBe(false);
    expect(choices.some((choice) => choice.id === 'mineDamage' || choice.id === 'mineCooldown')).toBe(false);
  });

  it('adds defense improvements after the matching unlock', () => {
    const levels = createUpgradeLevels();
    levels.turretUnlock = 1;
    const choices = selectUpgradeChoices(levels, () => 0, 20);
    expect(choices.some((choice) => choice.id === 'turretDamage')).toBe(true);
    expect(choices.some((choice) => choice.id === 'turretSpeed')).toBe(true);
  });
});
