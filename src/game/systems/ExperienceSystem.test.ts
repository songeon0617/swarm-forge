import { describe, expect, it } from 'vitest';
import { xpRequiredForLevel } from './XpProgression';

describe('XP requirements', () => {
  it('increase monotonically with player level', () => {
    const requirements = Array.from({ length: 12 }, (_, index) => xpRequiredForLevel(index + 1));
    requirements.slice(1).forEach((value, index) => expect(value).toBeGreaterThan(requirements[index]));
  });

  it('normalizes invalid low levels', () => {
    expect(xpRequiredForLevel(0)).toBe(xpRequiredForLevel(1));
  });
});
