import Phaser from 'phaser';
import { SURVIVAL_BALANCE, SURVIVAL_ENEMIES } from '../config/balance';
import { Enemy } from '../enemies/Enemy';
import { chooseEnemyType, difficultyAt } from './Difficulty';

export class EnemySpawner {
  private nextSpawnAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: Enemy[],
  ) {}

  update(time: number, elapsedSeconds: number): Enemy[] {
    if (time < this.nextSpawnAt || this.enemies.length >= SURVIVAL_BALANCE.spawn.maxEnemies) return [];
    const difficulty = difficultyAt(elapsedSeconds);
    this.nextSpawnAt = time + difficulty.spawnIntervalMs;
    const spawned: Enemy[] = [];
    for (let index = 0; index < difficulty.packSize; index += 1) {
      if (this.enemies.length + spawned.length >= SURVIVAL_BALANCE.spawn.maxEnemies) break;
      const type = chooseEnemyType(elapsedSeconds, Math.random());
      const base = SURVIVAL_ENEMIES[type];
      const point = this.spawnPoint(index * 24);
      spawned.push(
        new Enemy(this.scene, point.x, point.y, type, {
          hp: Math.round(base.hp * difficulty.hpMultiplier),
          speed: base.speed * difficulty.speedMultiplier,
          damage: base.damage,
          xp: base.xp,
          radius: base.radius,
        }),
      );
    }
    return spawned;
  }

  private spawnPoint(offset: number): Phaser.Math.Vector2 {
    const edge = Phaser.Math.Between(0, 3);
    if (edge === 0) return new Phaser.Math.Vector2(Phaser.Math.Between(20, 370), -30 - offset);
    if (edge === 1) return new Phaser.Math.Vector2(420 + offset, Phaser.Math.Between(90, 820));
    if (edge === 2) return new Phaser.Math.Vector2(Phaser.Math.Between(20, 370), 874 + offset);
    return new Phaser.Math.Vector2(-30 - offset, Phaser.Math.Between(90, 820));
  }
}
