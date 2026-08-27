import { describe, expect, it } from 'vitest';
import { getRunOutcome } from './RunRules';

describe('run outcome', () => {
  it('wins at 90 seconds while alive', () => expect(getRunOutcome(1, 90, 90)).toBe('victory'));
  it('loses immediately at zero HP', () => expect(getRunOutcome(0, 25, 90)).toBe('defeat'));
  it('prioritizes defeat if HP reaches zero at the deadline', () => expect(getRunOutcome(0, 90, 90)).toBe('defeat'));
});
