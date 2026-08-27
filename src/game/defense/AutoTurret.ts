import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SURVIVAL_BALANCE, SURVIVAL_LAYOUT } from '../config/balance';
import type { Enemy } from '../enemies/Enemy';
import type { Player } from '../entities/Player';
import type { WeaponStats } from '../survivalTypes';

interface TurretBolt {
  sprite: Phaser.GameObjects.Rectangle;
  target: Enemy;
}

export class AutoTurret {
  private sprite?: Phaser.GameObjects.Sprite;
  private lastShotAt = -Infinity;
  private readonly bolts: TurretBolt[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stats: WeaponStats,
  ) {}

  update(
    time: number,
    delta: number,
    player: Player,
    enemies: Enemy[],
    onHit: (enemy: Enemy, damage: number, sourceX: number, sourceY: number) => void,
    onFire?: () => void,
  ): void {
    if (!this.stats.turretUnlocked) return;
    this.ensureSprite(player);
    const sprite = this.sprite!;
    const forwardAngle = player.rotation - Math.PI / 2;
    const desiredX = Phaser.Math.Clamp(
      player.x - Math.cos(forwardAngle) * SURVIVAL_BALANCE.autoTurret.followDistance,
      SURVIVAL_LAYOUT.playfield.left + 15,
      GAME_WIDTH - SURVIVAL_LAYOUT.playfield.right - 15,
    );
    const desiredY = Phaser.Math.Clamp(
      player.y - Math.sin(forwardAngle) * SURVIVAL_BALANCE.autoTurret.followDistance,
      SURVIVAL_LAYOUT.playfield.top + 15,
      GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom - 15,
    );
    sprite.x = Phaser.Math.Linear(sprite.x, desiredX, Math.min(1, delta * 0.012));
    sprite.y = Phaser.Math.Linear(sprite.y, desiredY, Math.min(1, delta * 0.012));

    const target = this.closestEnemy(sprite.x, sprite.y, enemies);
    if (target) {
      sprite.rotation = Phaser.Math.Angle.Between(sprite.x, sprite.y, target.x, target.y) + Math.PI / 2;
      if (time - this.lastShotAt >= this.stats.turretCooldownMs) {
        this.lastShotAt = time;
        this.bolts.push({
          sprite: this.scene.add
            .rectangle(sprite.x, sprite.y, 11, 4, 0xc6ff63, 1)
            .setStrokeStyle(1, 0xffffff, 0.75)
            .setDepth(26),
          target,
        });
        onFire?.();
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
      const step = Math.min((this.stats.turretProjectileSpeed * delta) / 1000, distance);
      bolt.sprite.x += Math.cos(angle) * step;
      bolt.sprite.y += Math.sin(angle) * step;
      bolt.sprite.rotation = angle;
      if (distance <= Math.max(13, step)) {
        onHit(bolt.target, this.stats.turretDamage, bolt.sprite.x, bolt.sprite.y);
        bolt.sprite.destroy();
        this.bolts.splice(index, 1);
      }
    }
  }

  private ensureSprite(player: Player): void {
    if (this.sprite) return;
    this.sprite = this.scene.add
      .sprite(player.x - 40, player.y, 'survivor-turret')
      .setDepth(27)
      .setScale(0);
    this.scene.tweens.add({ targets: this.sprite, scale: 1, duration: 220, ease: 'Back.Out' });
  }

  private closestEnemy(x: number, y: number, enemies: Enemy[]): Enemy | undefined {
    let target: Enemy | undefined;
    let closestDistance = Infinity;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const distance = Phaser.Math.Distance.Squared(x, y, enemy.x, enemy.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        target = enemy;
      }
    }
    return target;
  }

  destroy(): void {
    this.sprite?.destroy();
    this.sprite = undefined;
    this.bolts.splice(0).forEach((bolt) => bolt.sprite.destroy());
  }
}
