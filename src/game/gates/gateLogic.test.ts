import { describe, expect, it } from 'vitest';
import { applyGate, gateGain, makeMeaningfulGatePair } from './gateLogic';

describe('gate logic', () => {
  it('adds only rifle drones and preserves lasers', () => {
    expect(applyGate({ rifle: 8, laser: 3 }, { operation: 'add', value: 6, label: '+6' })).toEqual({ rifle: 14, laser: 3 });
  });

  it('multiplies the full composition', () => {
    expect(applyGate({ rifle: 8, laser: 3 }, { operation: 'multiply', value: 2, label: '×2' })).toEqual({ rifle: 16, laser: 6 });
  });

  it('generates choices whose immediate gains remain reasonably close', () => {
    for (const count of [3, 8, 19, 42, 80]) {
      for (const roll of [0.05, 0.31, 0.57, 0.88]) {
        const [left, right] = makeMeaningfulGatePair(count, 0.6, roll);
        const ratio = gateGain(count, left) / gateGain(count, right);
        expect(ratio).toBeGreaterThanOrEqual(0.75);
        expect(ratio).toBeLessThan(1.34);
      }
    }
  });
});
