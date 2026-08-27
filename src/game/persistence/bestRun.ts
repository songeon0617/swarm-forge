export interface BestRun { score: number; swarm: number; victories: number }

const KEY = 'swarm-forge-best-v1';

export function loadBest(storage: Pick<Storage, 'getItem'> = localStorage): BestRun {
  try {
    const value = storage.getItem(KEY);
    if (!value) return { score: 0, swarm: 0, victories: 0 };
    const parsed = JSON.parse(value) as Partial<BestRun>;
    return {
      score: Math.max(0, Number(parsed.score) || 0),
      swarm: Math.max(0, Number(parsed.swarm) || 0),
      victories: Math.max(0, Number(parsed.victories) || 0),
    };
  } catch {
    return { score: 0, swarm: 0, victories: 0 };
  }
}

export function saveBest(run: BestRun, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(KEY, JSON.stringify(run));
}
