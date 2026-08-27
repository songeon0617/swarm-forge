import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SURVIVAL_LAYOUT } from '../config/balance';

export type SpawnPointProvider = (packIndex: number, random: () => number) => Phaser.Math.Vector2;

function between(min: number, max: number, random: () => number): number {
  return Math.round(min + (max - min) * random());
}

export const createArenaSpawnPoint: SpawnPointProvider = (packIndex, random) => {
  const offset = packIndex * SURVIVAL_LAYOUT.packOffset;
  const edge = Math.min(3, Math.floor(random() * 4));
  const horizontalPosition = between(
    SURVIVAL_LAYOUT.playfield.left,
    GAME_WIDTH - SURVIVAL_LAYOUT.playfield.right,
    random,
  );
  const verticalPosition = between(
    SURVIVAL_LAYOUT.playfield.top,
    GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom,
    random,
  );
  if (edge === 0) return new Phaser.Math.Vector2(horizontalPosition, -SURVIVAL_LAYOUT.spawnPadding - offset);
  if (edge === 1) return new Phaser.Math.Vector2(GAME_WIDTH + SURVIVAL_LAYOUT.spawnPadding + offset, verticalPosition);
  if (edge === 2)
    return new Phaser.Math.Vector2(horizontalPosition, GAME_HEIGHT + SURVIVAL_LAYOUT.spawnPadding + offset);
  return new Phaser.Math.Vector2(-SURVIVAL_LAYOUT.spawnPadding - offset, verticalPosition);
};
