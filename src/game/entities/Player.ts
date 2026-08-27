import Phaser from 'phaser';
import { SURVIVAL_BALANCE } from '../config/balance';
import { approach } from '../movement/MovementMath';
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

  move(directionX: number, directionY: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const magnitude = Math.hypot(directionX, directionY);
    const normalizedX = magnitude > 1 ? directionX / magnitude : directionX;
    const normalizedY = magnitude > 1 ? directionY / magnitude : directionY;
    const hasInput = magnitude > 0;
    const targetVelocityX = normalizedX * this.stats.moveSpeed;
    const targetVelocityY = normalizedY * this.stats.moveSpeed;
    const acceleration = hasInput ? SURVIVAL_BALANCE.player.acceleration : SURVIVAL_BALANCE.player.deceleration;
    const clampedDelta = Math.min(delta, SURVIVAL_BALANCE.movement.maxDeltaMs);
    const maxChange = (acceleration * clampedDelta) / 1000;

    this.setVelocity(
      approach(body.velocity.x, targetVelocityX, maxChange),
      approach(body.velocity.y, targetVelocityY, maxChange),
    );
    if (body.velocity.length() > this.stats.moveSpeed) body.velocity.setLength(this.stats.moveSpeed);
    if (hasInput) {
      const targetRotation = Math.atan2(normalizedY, normalizedX) + Math.PI / 2;
      this.rotation = Phaser.Math.Angle.RotateTo(
        this.rotation,
        targetRotation,
        SURVIVAL_BALANCE.player.turnSpeed * (clampedDelta / 1000),
      );
    }
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
