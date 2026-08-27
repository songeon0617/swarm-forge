export type RunOutcome = 'playing' | 'victory' | 'defeat';

export function getRunOutcome(hp: number, elapsedSeconds: number, runSeconds: number): RunOutcome {
  if (hp <= 0) return 'defeat';
  if (elapsedSeconds >= runSeconds) return 'victory';
  return 'playing';
}
