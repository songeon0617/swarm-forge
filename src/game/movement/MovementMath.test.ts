import { describe, expect, it } from 'vitest';
import { approach, smoothResponse } from './MovementMath';

describe('movement math', () => {
  it('approaches a target without overshooting in either direction', () => {
    expect(approach(0, 10, 3)).toBe(3);
    expect(approach(10, 0, 3)).toBe(7);
    expect(approach(8, 10, 3)).toBe(10);
  });

  it('produces nearly frame-rate-independent smoothing', () => {
    const oneFrame = smoothResponse(0, 100, 9, 32);
    const firstHalf = smoothResponse(0, 100, 9, 16);
    const twoFrames = smoothResponse(firstHalf, 100, 9, 16);

    expect(twoFrames).toBeCloseTo(oneFrame, 10);
  });
});
