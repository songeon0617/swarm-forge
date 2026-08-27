import Phaser from 'phaser';
import type { PlayerStats } from '../survivalTypes';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  level = 1;
  xp = 0;
  lastHitAt = -Infinity;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly stats: PlayerStats,
  ) {
    super(scene, x, y, 'survivor-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = stats.maxHp;
    this.setDepth(30).setCollideWorldBounds(true).setCircle(14, 4, 4);
  }

  move(directionX: number, directionY: number): void {
    const direction = new Phaser.Math.Vector2(directionX, directionY);
    if (direction.lengthSq() > 1) direction.normalize();
    this.setVelocity(direction.x * this.stats.moveSpeed, direction.y * this.stats.moveSpeed);
    if (direction.lengthSq() > 0)
      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, direction.angle() + Math.PI / 2, 0.15);
  }

  takeDamage(amount: number, time: number, invulnerabilityMs: number): boolean {
    if (time - this.lastHitAt < invulnerabilityMs) return false;
    this.lastHitAt = time;
    this.hp = Math.max(0, this.hp - amount);
    return true;
  }

  increaseMaxHp(ratio: number): void {
    const gain = Math.round(this.stats.maxHp * ratio);
    this.stats.maxHp += gain;
    this.hp = Math.min(this.stats.maxHp, this.hp + gain);
  }
}
