import Phaser from 'phaser';
import type { Player } from '../entities/Player';

interface XpOrb {
  sprite: Phaser.GameObjects.Arc;
  value: number;
}

export class ExperienceSystem {
  private readonly orbs: XpOrb[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  drop(x: number, y: number, value: number): void {
    const sprite = this.scene.add.circle(x, y, 5, 0x89ffec, 1).setStrokeStyle(2, 0xffffff, 0.8).setDepth(12);
    this.scene.tweens.add({ targets: sprite, scale: 1.35, duration: 420, yoyo: true, repeat: -1 });
    this.orbs.push({ sprite, value });
  }

  update(player: Player, delta: number): number {
    let collected = 0;
    for (let index = this.orbs.length - 1; index >= 0; index -= 1) {
      const orb = this.orbs[index];
      const distance = Phaser.Math.Distance.Between(orb.sprite.x, orb.sprite.y, player.x, player.y);
      if (distance < player.stats.pickupRadius * 2.4) {
        const speed = distance < player.stats.pickupRadius ? 0.022 : 0.009;
        orb.sprite.x = Phaser.Math.Linear(orb.sprite.x, player.x, Math.min(1, delta * speed));
        orb.sprite.y = Phaser.Math.Linear(orb.sprite.y, player.y, Math.min(1, delta * speed));
      }
      if (distance < 18) {
        collected += orb.value;
        orb.sprite.destroy();
        this.orbs.splice(index, 1);
      }
    }
    return collected;
  }

  destroy(): void {
    this.orbs.splice(0).forEach((orb) => orb.sprite.destroy());
  }
}
