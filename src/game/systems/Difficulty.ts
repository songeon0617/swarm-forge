import { SURVIVAL_BALANCE, SURVIVAL_ENEMIES } from '../config/balance';
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
  if (elapsedSeconds >= SURVIVAL_ENEMIES.runner.unlockAt) availableTypes.push('runner');
  if (elapsedSeconds >= SURVIVAL_ENEMIES.tank.unlockAt) availableTypes.push('tank');
  return {
    progress,
    spawnIntervalMs: Math.round(
      SURVIVAL_BALANCE.spawn.startIntervalMs +
        (SURVIVAL_BALANCE.spawn.endIntervalMs - SURVIVAL_BALANCE.spawn.startIntervalMs) * progress,
    ),
    hpMultiplier: 1 + Math.pow(progress, SURVIVAL_BALANCE.difficulty.hpExponent) * SURVIVAL_BALANCE.difficulty.hpGrowth,
    speedMultiplier: 1 + progress * SURVIVAL_BALANCE.difficulty.speedGrowth,
    availableTypes,
    packSize:
      elapsedSeconds >= SURVIVAL_BALANCE.difficulty.packThreeAt
        ? 3
        : elapsedSeconds >= SURVIVAL_BALANCE.difficulty.packTwoAt
          ? 2
          : 1,
  };
}

export function chooseEnemyType(elapsedSeconds: number, roll: number): SurvivalEnemyType {
  if (elapsedSeconds >= SURVIVAL_ENEMIES.tank.unlockAt && roll > SURVIVAL_BALANCE.difficulty.tankRollThreshold)
    return 'tank';
  if (elapsedSeconds >= SURVIVAL_ENEMIES.runner.unlockAt && roll > SURVIVAL_BALANCE.difficulty.runnerRollThreshold)
    return 'runner';
  return 'grunt';
}
