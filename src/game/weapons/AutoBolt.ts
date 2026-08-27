import Phaser from 'phaser';
import type { Enemy } from '../enemies/Enemy';
import type { Player } from '../entities/Player';
import type { WeaponStats } from '../survivalTypes';

interface Bolt {
  sprite: Phaser.GameObjects.Sprite;
  target: Enemy;
  damage: number;
}

export class AutoBolt {
  private lastShotAt = -Infinity;
  private readonly bolts: Bolt[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stats: WeaponStats,
  ) {}

  update(
    time: number,
    delta: number,
    player: Player,
    enemies: Enemy[],
    onHit: (enemy: Enemy, damage: number) => void,
  ): void {
    const living = enemies.filter((enemy) => enemy.active);
    if (living.length > 0 && time - this.lastShotAt >= this.stats.boltCooldownMs) {
      this.lastShotAt = time;
      const sorted = living.sort(
        (a, b) =>
          Phaser.Math.Distance.Squared(player.x, player.y, a.x, a.y) -
          Phaser.Math.Distance.Squared(player.x, player.y, b.x, b.y),
      );
      for (let index = 0; index < this.stats.boltCount; index += 1) {
        const target = sorted[index % sorted.length];
        const sprite = this.scene.add.sprite(player.x, player.y, 'survivor-bolt').setDepth(25);
        this.bolts.push({ sprite, target, damage: this.stats.boltDamage });
      }
    }

    for (let index = this.bolts.length - 1; index >= 0; index -= 1) {
      const bolt = this.bolts[index];
      if (!bolt.target.active) {
        bolt.sprite.destroy();
        this.bolts.splice(index, 1);
        continue;
      }
      const offsetX = bolt.target.x - bolt.sprite.x;
      const offsetY = bolt.target.y - bolt.sprite.y;
      const distance = Math.hypot(offsetX, offsetY);
      const angle = Math.atan2(offsetY, offsetX);
      const step = Math.min((this.stats.boltSpeed * delta) / 1000, distance);
      bolt.sprite.x += Math.cos(angle) * step;
      bolt.sprite.y += Math.sin(angle) * step;
      bolt.sprite.rotation = angle;
      if (distance <= Math.max(14, step)) {
        onHit(bolt.target, bolt.damage);
        bolt.sprite.destroy();
        this.bolts.splice(index, 1);
      }
    }
  }

  destroy(): void {
    this.bolts.splice(0).forEach((bolt) => bolt.sprite.destroy());
  }
}
