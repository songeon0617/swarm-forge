import Phaser from 'phaser';
import { SURVIVAL_BALANCE, SURVIVAL_ENEMIES } from '../config/balance';
import { Enemy } from '../enemies/Enemy';
import { createRightEdgeSpawnPoint, type SpawnPointProvider } from '../spawning/SpawnPointProvider';
import { chooseEnemyType, difficultyAt } from './Difficulty';

export class EnemySpawner {
  private nextSpawnAt = 0;
  private readonly random: () => number;
  private readonly spawnPoint: SpawnPointProvider;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: Enemy[],
    options: { random?: () => number; spawnPoint?: SpawnPointProvider } = {},
  ) {
    this.random = options.random ?? Math.random;
    this.spawnPoint = options.spawnPoint ?? createRightEdgeSpawnPoint;
  }

  update(time: number, elapsedSeconds: number): Enemy[] {
    if (time < this.nextSpawnAt || this.enemies.length >= SURVIVAL_BALANCE.spawn.maxEnemies) return [];
    const difficulty = difficultyAt(elapsedSeconds);
    this.nextSpawnAt = time + difficulty.spawnIntervalMs;
    const spawned: Enemy[] = [];
    for (let index = 0; index < difficulty.packSize; index += 1) {
      if (this.enemies.length + spawned.length >= SURVIVAL_BALANCE.spawn.maxEnemies) break;
      const type = chooseEnemyType(elapsedSeconds, this.random());
      const base = SURVIVAL_ENEMIES[type];
      const point = this.spawnPoint(index, this.random);
      const enemy = new Enemy(this.scene, point.x, point.y, type, {
        hp: Math.round(base.hp * difficulty.hpMultiplier),
        speed: base.speed * difficulty.speedMultiplier,
        damage: base.damage,
        xp: base.xp,
        radius: base.radius,
      });
      enemy.playSpawnIntro();
      spawned.push(enemy);
    }
    return spawned;
  }
}
