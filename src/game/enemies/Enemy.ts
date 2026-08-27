import Phaser from 'phaser';
import { SURVIVAL_BALANCE } from '../config/balance';
import { smoothResponse } from '../movement/MovementMath';
import type { SurvivalEnemyType } from '../survivalTypes';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  readonly maxHp: number;
  readonly speed: number;
  readonly contactDamage: number;
  readonly xpValue: number;
  private hitFlashUntil = -Infinity;
  private knockedBackUntil = -Infinity;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly enemyType: SurvivalEnemyType,
    values: { hp: number; speed: number; damage: number; xp: number; radius: number },
  ) {
    super(scene, x, y, `survivor-${enemyType}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = values.hp;
    this.maxHp = values.hp;
    this.speed = values.speed;
    this.contactDamage = values.damage;
    this.xpValue = values.xp;
    this.setDepth(15).setCircle(values.radius, this.width / 2 - values.radius, this.height / 2 - values.radius);
  }

  chase(targetX: number, targetY: number, delta: number, time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (time < this.knockedBackUntil) {
      if (time >= this.hitFlashUntil && this.isTinted) this.clearTint();
      return;
    }
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    const clampedDelta = Math.min(delta, SURVIVAL_BALANCE.movement.maxDeltaMs);
    const velocityX = smoothResponse(
      body.velocity.x,
      Math.cos(angle) * this.speed,
      SURVIVAL_BALANCE.movement.enemyTurnResponse,
      clampedDelta,
    );
    const velocityY = smoothResponse(
      body.velocity.y,
      Math.sin(angle) * this.speed,
      SURVIVAL_BALANCE.movement.enemyTurnResponse,
      clampedDelta,
    );
    this.setVelocity(velocityX, velocityY);
    this.rotation = Math.atan2(velocityY, velocityX) + Math.PI / 2;
    if (time >= this.hitFlashUntil && this.isTinted) this.clearTint();
  }

  playSpawnIntro(): void {
    this.setAlpha(SURVIVAL_BALANCE.feedback.spawnStartAlpha).setScale(SURVIVAL_BALANCE.feedback.spawnStartScale);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: SURVIVAL_BALANCE.feedback.spawnDurationMs,
      ease: 'Quad.Out',
    });
  }

  showHitFeedback(time: number, sourceX: number, sourceY: number): void {
    this.hitFlashUntil = time + SURVIVAL_BALANCE.feedback.enemyHitFlashMs;
    this.knockedBackUntil = time + SURVIVAL_BALANCE.feedback.enemyHitKnockbackMs;
    this.setTintFill(0xffffff);
    const angle = Math.atan2(this.y - sourceY, this.x - sourceX);
    this.setVelocity(
      Math.cos(angle) * SURVIVAL_BALANCE.feedback.enemyHitKnockbackSpeed,
      Math.sin(angle) * SURVIVAL_BALANCE.feedback.enemyHitKnockbackSpeed,
    );
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }

  playDeath(): void {
    this.scene.tweens.killTweensOf(this);
    this.disableBody(true, false);
    this.setTintFill(0xffffff);
    this.scene.tweens.add({
      targets: this,
      scale: 1.32,
      alpha: 0,
      angle: this.angle + 24,
      duration: SURVIVAL_BALANCE.feedback.enemyDeathDurationMs,
      ease: 'Quad.Out',
      onComplete: () => this.destroy(),
    });
  }
}
