import { describe, expect, it } from 'vitest';
import { applyUpgrade, makeUpgradePair } from './upgradeLogic';

describe('upgrade logic', () => {
  it('converts quantity to laser quality without changing total count', () => {
    const result = applyUpgrade({ rifle: 30, laser: 10 }, { kind: 'convert', ratio: 0.25, label: '25% LASER', detail: 'ARMOR BREAK' });
    expect(result).toEqual({ rifle: 20, laser: 20 });
  });

  it('scales the quantity alternative with current swarm strength', () => {
    const [early] = makeUpgradePair(10, 0.2);
    const [late] = makeUpgradePair(80, 0.8);
    expect(early.kind === 'add' && late.kind === 'add' && late.amount > early.amount).toBe(true);
  });
});
