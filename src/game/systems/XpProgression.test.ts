import { describe, expect, it } from 'vitest';
import { xpRequiredForLevel } from './XpProgression';

describe('XP progression', () => {
  it('holds the first upgrade until a meaningful opening fight is cleared', () => {
    expect(xpRequiredForLevel(1)).toBe(70);
  });

  it('keeps upgrade requirements increasing without invalid low levels', () => {
    expect(xpRequiredForLevel(0)).toBe(xpRequiredForLevel(1));
    expect(xpRequiredForLevel(3)).toBeGreaterThan(xpRequiredForLevel(2));
    expect(xpRequiredForLevel(8)).toBeGreaterThan(xpRequiredForLevel(3));
  });
});
