import { describe, expect, it } from 'vitest';
import { loadBest, saveBest } from './bestRun';

describe('best-run persistence', () => {
  it('round-trips a valid record', () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    saveBest({ score: 4200, swarm: 61, victories: 2 }, storage);
    expect(loadBest(storage)).toEqual({ score: 4200, swarm: 61, victories: 2 });
  });

  it('falls back safely for corrupt storage', () => {
    expect(loadBest({ getItem: () => '{nope' })).toEqual({ score: 0, swarm: 0, victories: 0 });
  });
});
