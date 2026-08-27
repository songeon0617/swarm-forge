import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SURVIVAL_BALANCE, SURVIVAL_LAYOUT } from '../config/balance';
import type { Enemy } from '../enemies/Enemy';
import type { Player } from '../entities/Player';
import { burst } from '../render/NeonEffects';
import type { WeaponStats } from '../survivalTypes';

const DROP_OFFSETS = [
  { x: 62, y: 12 },
  { x: -48, y: 45 },
  { x: 16, y: -66 },
] as const;

export class AutoMine {
  private readonly mines: Phaser.GameObjects.Sprite[] = [];
  private lastDropAt = -Infinity;
  private dropIndex = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stats: WeaponStats,
  ) {}

  update(
    time: number,
    player: Player,
    enemies: Enemy[],
    onHit: (enemy: Enemy, damage: number, sourceX: number, sourceY: number) => void,
    onExplode?: () => void,
  ): void {
    if (!this.stats.mineUnlocked) return;
    if (this.mines.length < SURVIVAL_BALANCE.mine.maxActive && time - this.lastDropAt >= this.stats.mineCooldownMs) {
      this.drop(player);
      this.lastDropAt = time;
    }
    for (let index = this.mines.length - 1; index >= 0; index -= 1) {
      const mine = this.mines[index];
      let triggered = false;
      for (const enemy of enemies) {
        if (!enemy.active) continue;
        const triggerDistance = SURVIVAL_BALANCE.mine.triggerRadius + enemy.displayWidth * 0.35;
        if (Phaser.Math.Distance.Squared(mine.x, mine.y, enemy.x, enemy.y) <= triggerDistance * triggerDistance) {
          triggered = true;
          break;
        }
      }
      if (!triggered) continue;
      this.explode(mine, enemies, onHit);
      this.mines.splice(index, 1);
      onExplode?.();
    }
  }

  private drop(player: Player): void {
    const offset = DROP_OFFSETS[this.dropIndex % DROP_OFFSETS.length];
    this.dropIndex += 1;
    const x = Phaser.Math.Clamp(
      player.x + offset.x,
      SURVIVAL_LAYOUT.playfield.left + 14,
      GAME_WIDTH - SURVIVAL_LAYOUT.playfield.right - 14,
    );
    const y = Phaser.Math.Clamp(
      player.y + offset.y,
      SURVIVAL_LAYOUT.playfield.top + 14,
      GAME_HEIGHT - SURVIVAL_LAYOUT.playfield.bottom - 14,
    );
    const mine = this.scene.add.sprite(x, y, 'survivor-mine').setDepth(11).setScale(0);
    this.scene.tweens.add({ targets: mine, scale: 1, duration: 190, ease: 'Back.Out' });
    this.mines.push(mine);
  }

  private explode(
    mine: Phaser.GameObjects.Sprite,
    enemies: Enemy[],
    onHit: (enemy: Enemy, damage: number, sourceX: number, sourceY: number) => void,
  ): void {
    const radiusSquared = this.stats.mineRadius * this.stats.mineRadius;
    for (const enemy of enemies) {
      const offsetX = enemy.x - mine.x;
      const offsetY = enemy.y - mine.y;
      if (enemy.active && offsetX * offsetX + offsetY * offsetY <= radiusSquared) {
        onHit(enemy, this.stats.mineDamage, mine.x, mine.y);
      }
    }
    const ring = this.scene.add
      .circle(mine.x, mine.y, 12, 0xffb02e, 0.16)
      .setStrokeStyle(4, 0xffd66b, 0.95)
      .setDepth(56);
    this.scene.tweens.add({
      targets: ring,
      radius: this.stats.mineRadius,
      alpha: 0,
      duration: 260,
      ease: 'Quad.Out',
      onComplete: () => ring.destroy(),
    });
    burst(this.scene, mine.x, mine.y, 0xff9b32, 8, 58);
    mine.destroy();
  }

  destroy(): void {
    this.mines.splice(0).forEach((mine) => mine.destroy());
  }
}
