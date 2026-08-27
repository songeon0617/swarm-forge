import { SURVIVAL_BALANCE } from '../config/balance';
import type { SurvivalEnemyType } from '../survivalTypes';

export interface DifficultySnapshot {
  progress: number;
  spawnIntervalMs: number;
  hpMultiplier: number;
  speedMultiplier: number;
  availableTypes: SurvivalEnemyType[];
  packSize: number;
}

export function difficultyAt(elapsedSeconds: number): DifficultySnapshot {
  const progress = Math.min(1, Math.max(0, elapsedSeconds / SURVIVAL_BALANCE.runSeconds));
  const availableTypes: SurvivalEnemyType[] = ['grunt'];
  if (elapsedSeconds >= 28) availableTypes.push('runner');
  if (elapsedSeconds >= 58) availableTypes.push('tank');
  return {
    progress,
    spawnIntervalMs: Math.round(
      SURVIVAL_BALANCE.spawn.startIntervalMs +
        (SURVIVAL_BALANCE.spawn.endIntervalMs - SURVIVAL_BALANCE.spawn.startIntervalMs) * progress,
    ),
    hpMultiplier: 1 + Math.pow(progress, 1.35) * 1.5,
    speedMultiplier: 1 + progress * 0.22,
    availableTypes,
    packSize: elapsedSeconds >= 75 ? 3 : elapsedSeconds >= 48 ? 2 : 1,
  };
}

export function chooseEnemyType(elapsedSeconds: number, roll: number): SurvivalEnemyType {
  if (elapsedSeconds >= 60 && roll > 0.76) return 'tank';
  if (elapsedSeconds >= 30 && roll > 0.48) return 'runner';
  return 'grunt';
}
