import Phaser from 'phaser';
import type { Enemy } from '../enemies/Enemy';
import type { Player } from '../entities/Player';
import type { WeaponStats } from '../survivalTypes';
import { SURVIVAL_BALANCE } from '../config/balance';

export class OrbitBlade {
  private angle = 0;
  private readonly blades: Phaser.GameObjects.Rectangle[] = [];
  private readonly lastHits = new Map<Enemy, number>();

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
    while (this.blades.length < this.stats.bladeCount) {
      this.blades.push(
        this.scene.add
          .rectangle(player.x, player.y, 24, 8, 0xd6ff64, 1)
          .setStrokeStyle(2, 0xffffff, 0.8)
          .setDepth(24)
          .setBlendMode(Phaser.BlendModes.ADD),
      );
    }
    while (this.blades.length > this.stats.bladeCount) this.blades.pop()?.destroy();
    this.angle += (this.stats.bladeSpeed * delta) / 1000;
    this.blades.forEach((blade, index) => {
      const bladeAngle = this.angle + (index / this.blades.length) * Math.PI * 2;
      blade.x = player.x + Math.cos(bladeAngle) * this.stats.bladeRadius;
      blade.y = player.y + Math.sin(bladeAngle) * this.stats.bladeRadius;
      blade.rotation = bladeAngle + Math.PI / 2;
      enemies.forEach((enemy) => {
        const offsetX = enemy.x - blade.x;
        const offsetY = enemy.y - blade.y;
        if (!enemy.active || offsetX * offsetX + offsetY * offsetY > 25 * 25) return;
        if (time - (this.lastHits.get(enemy) ?? -Infinity) < SURVIVAL_BALANCE.orbitBlade.hitCooldownMs) return;
        this.lastHits.set(enemy, time);
        onHit(enemy, this.stats.bladeDamage);
      });
    });
  }

  destroy(): void {
    this.blades.splice(0).forEach((blade) => blade.destroy());
    this.lastHits.clear();
  }
}
