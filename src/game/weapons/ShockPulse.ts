import Phaser from 'phaser';
import type { Enemy } from '../enemies/Enemy';
import type { Player } from '../entities/Player';
import type { WeaponStats } from '../survivalTypes';

export class ShockPulse {
  private lastPulseAt = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stats: WeaponStats,
  ) {}

  update(time: number, player: Player, enemies: Enemy[], onHit: (enemy: Enemy, damage: number) => void): void {
    if (time - this.lastPulseAt < this.stats.pulseCooldownMs) return;
    this.lastPulseAt = time;
    const radiusSquared = this.stats.pulseRadius * this.stats.pulseRadius;
    enemies.forEach((enemy) => {
      const offsetX = enemy.x - player.x;
      const offsetY = enemy.y - player.y;
      if (enemy.active && offsetX * offsetX + offsetY * offsetY <= radiusSquared) onHit(enemy, this.stats.pulseDamage);
    });
    const ring = this.scene.add
      .circle(player.x, player.y, 18, 0x6d7dff, 0.05)
      .setStrokeStyle(4, 0x87b8ff, 0.95)
      .setDepth(22)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: ring,
      radius: this.stats.pulseRadius,
      alpha: 0,
      duration: 430,
      ease: 'Quad.Out',
      onComplete: () => ring.destroy(),
    });
  }
}
