import { describe, expect, it } from 'vitest';
import { generateStage } from './stageGenerator';

describe('stage generation', () => {
  it('is deterministic for a given run seed', () => {
    expect(generateStage(1729)).toEqual(generateStage(1729));
    expect(generateStage(1729)).not.toEqual(generateStage(1730));
  });

  it('preserves the complete finite run rhythm', () => {
    const events = generateStage(9);
    expect(events[0]?.kind).toBe('capsule');
    expect(events.filter((event) => event.kind === 'gate')).toHaveLength(4);
    expect(events.filter((event) => event.kind === 'upgrade')).toHaveLength(2);
    expect(events.some((event) => event.kind === 'hazard')).toBe(true);
    expect(events.at(-1)?.kind).toBe('boss');
    expect((events.at(-1)?.distance ?? 0) / 64).toBeGreaterThan(60);
    expect((events.at(-1)?.distance ?? 0) / 64).toBeLessThan(90);
  });

  it('ramps enemy health toward later encounters', () => {
    const waves = generateStage(101).filter((event) => event.kind === 'enemyWave');
    const totalHp = (index: number) => waves[index].enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0);
    expect(totalHp(waves.length - 1)).toBeGreaterThan(totalHp(0));
  });

  it('accounts for guaranteed capsule growth when creating the first choice', () => {
    const firstGate = generateStage(77).find((event) => event.kind === 'gate');
    if (!firstGate || firstGate.kind !== 'gate') throw new Error('missing first gate');
    const gains = [firstGate.left, firstGate.right].map((gate) => gate.operation === 'add' ? gate.value : 9 * (gate.value - 1));
    expect(Math.min(...gains) / Math.max(...gains)).toBeGreaterThanOrEqual(0.75);
  });
});
