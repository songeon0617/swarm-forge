import Phaser from 'phaser';
import { BALANCE, PLAYER_Y } from '../config/balance';
import type { SwarmSnapshot } from '../types';
import { calculateFormation } from '../swarm/formation';

export class SwarmView {
  readonly container: Phaser.GameObjects.Container;
  private drones: Phaser.GameObjects.Image[] = [];
  private renderedSnapshot: SwarmSnapshot = { rifle: 0, laser: 0 };
  private targetX = 195;
  private formationHalfWidth = 34;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(this.targetX, PLAYER_Y).setDepth(30);
  }

  sync(snapshot: SwarmSnapshot): void {
    if (snapshot.rifle === this.renderedSnapshot.rifle && snapshot.laser === this.renderedSnapshot.laser) return;
    this.renderedSnapshot = { ...snapshot };
    const visibleTotal = Math.min(snapshot.rifle + snapshot.laser, BALANCE.renderedDroneCap);
    while (this.drones.length < visibleTotal) {
      const image = this.scene.add.image(0, 0, 'drone-rifle').setScale(0).setBlendMode(Phaser.BlendModes.ADD);
      this.container.add(image);
      this.drones.push(image);
      this.scene.tweens.add({ targets: image, scale: 0.72, duration: 220, ease: 'Back.Out' });
    }
    while (this.drones.length > visibleTotal) this.drones.pop()?.destroy();
    const laserVisible = snapshot.laser === 0 ? 0 : Math.max(1, Math.round(visibleTotal * snapshot.laser / Math.max(1, snapshot.rifle + snapshot.laser)));
    this.drones.forEach((drone, index) => drone.setTexture(index < laserVisible ? 'drone-laser' : 'drone-rifle'));
    const points = calculateFormation(snapshot.rifle + snapshot.laser);
    this.formationHalfWidth = Math.max(34, ...points.map((point) => Math.abs(point.x) + 14));
    this.targetX = Phaser.Math.Clamp(this.targetX, 35 + this.formationHalfWidth, 355 - this.formationHalfWidth);
    this.drones.forEach((drone, index) => {
      const point = points[index];
      this.scene.tweens.add({ targets: drone, x: point.x, y: point.y, scale: 0.72 * point.scale, duration: 280, ease: 'Sine.Out' });
    });
  }

  setTargetX(value: number): void {
    this.targetX = Phaser.Math.Clamp(value, 35 + this.formationHalfWidth, 355 - this.formationHalfWidth);
  }
  get x(): number { return this.container.x; }

  update(time: number, delta: number): void {
    const amount = 1 - Math.pow(0.0008, delta / 1000);
    this.container.x = Phaser.Math.Linear(this.container.x, this.targetX, amount);
    this.drones.forEach((drone, index) => {
      drone.rotation = Math.sin(time * 0.005 + index * 0.7) * 0.035;
      drone.setAlpha(0.86 + Math.sin(time * 0.006 + index) * 0.14);
    });
  }

  pulse(color = 0xffffff): void {
    this.drones.forEach((drone) => drone.setTint(color));
    this.scene.time.delayedCall(110, () => this.drones.forEach((drone) => drone.clearTint()));
    this.scene.tweens.add({ targets: this.container, scale: 1.12, yoyo: true, duration: 120 });
  }

  frontPoint(): Phaser.Math.Vector2 { return new Phaser.Math.Vector2(this.container.x, PLAYER_Y - 5); }
}
