import Phaser from 'phaser';
import type { SurvivalEnemyType } from '../survivalTypes';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  readonly maxHp: number;
  readonly speed: number;
  readonly contactDamage: number;
  readonly xpValue: number;

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

  chase(target: Phaser.Math.Vector2): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.rotation = angle + Math.PI / 2;
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }
}
