import { SURVIVAL_BALANCE, SURVIVAL_ENEMIES, SURVIVAL_WAVE_PHASES } from '../config/balance';
import type { SurvivalEnemyType } from '../survivalTypes';

export interface DifficultySnapshot {
  progress: number;
  spawnIntervalMs: number;
  hpMultiplier: number;
  speedMultiplier: number;
  availableTypes: SurvivalEnemyType[];
  packSize: number;
  runnerChance: number;
  tankChance: number;
}

export function difficultyAt(elapsedSeconds: number, packRoll = 0): DifficultySnapshot {
  const progress = Math.min(1, Math.max(0, elapsedSeconds / SURVIVAL_BALANCE.runSeconds));
  const phase = [...SURVIVAL_WAVE_PHASES].reverse().find((candidate) => elapsedSeconds >= candidate.startsAt)!;
  const availableTypes: SurvivalEnemyType[] = ['grunt'];
  if (elapsedSeconds >= SURVIVAL_ENEMIES.runner.unlockAt) availableTypes.push('runner');
  if (elapsedSeconds >= SURVIVAL_ENEMIES.tank.unlockAt) availableTypes.push('tank');
  return {
    progress,
    spawnIntervalMs: phase.spawnIntervalMs,
    hpMultiplier: 1 + Math.pow(progress, SURVIVAL_BALANCE.difficulty.hpExponent) * SURVIVAL_BALANCE.difficulty.hpGrowth,
    speedMultiplier: 1 + progress * SURVIVAL_BALANCE.difficulty.speedGrowth,
    availableTypes,
    packSize:
      phase.packMin + Math.floor(Math.min(0.999999, Math.max(0, packRoll)) * (phase.packMax - phase.packMin + 1)),
    runnerChance: phase.runnerChance,
    tankChance: phase.tankChance,
  };
}

export function chooseEnemyType(elapsedSeconds: number, roll: number): SurvivalEnemyType {
  const phase = difficultyAt(elapsedSeconds);
  if (elapsedSeconds >= SURVIVAL_ENEMIES.tank.unlockAt && roll < phase.tankChance) return 'tank';
  if (elapsedSeconds >= SURVIVAL_ENEMIES.runner.unlockAt && roll < phase.tankChance + phase.runnerChance)
    return 'runner';
  return 'grunt';
}
