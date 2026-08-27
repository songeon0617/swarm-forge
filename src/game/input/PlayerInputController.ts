import Phaser from 'phaser';
import { SURVIVAL_BALANCE } from '../config/balance';

type MovementKey = 'left' | 'right' | 'up' | 'down' | 'a' | 'd' | 'w' | 's';

export class PlayerInputController {
  private readonly keys?: Record<MovementKey, Phaser.Input.Keyboard.Key>;
  private touchTarget?: Phaser.Math.Vector2;
  private readonly direction = new Phaser.Math.Vector2();
  private enabled = true;

  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (this.enabled) this.touchTarget = new Phaser.Math.Vector2(pointer.x, pointer.y);
  };

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (this.enabled && pointer.isDown) this.touchTarget?.set(pointer.x, pointer.y);
  };

  private readonly onPointerUp = (): void => {
    this.touchTarget = undefined;
  };

  constructor(private readonly scene: Phaser.Scene) {
    if (scene.input.keyboard) {
      this.keys = {
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        s: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      };
    }
    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointermove', this.onPointerMove);
    scene.input.on('pointerup', this.onPointerUp);
  }

  directionFrom(playerX: number, playerY: number): Phaser.Math.Vector2 {
    if (!this.enabled) return this.direction.set(0, 0);
    let x = 0;
    let y = 0;
    if (this.keys) {
      x = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
      y = Number(this.keys.down.isDown || this.keys.s.isDown) - Number(this.keys.up.isDown || this.keys.w.isDown);
    }
    if (x === 0 && y === 0 && this.touchTarget) {
      const offsetX = this.touchTarget.x - playerX;
      const offsetY = this.touchTarget.y - playerY;
      const distanceSquared = offsetX * offsetX + offsetY * offsetY;
      if (distanceSquared > SURVIVAL_BALANCE.player.touchDeadZone ** 2) {
        const inverseDistance = 1 / Math.sqrt(distanceSquared);
        x = offsetX * inverseDistance;
        y = offsetY * inverseDistance;
      }
    }
    return this.direction.set(x, y);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.touchTarget = undefined;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown);
    this.scene.input.off('pointermove', this.onPointerMove);
    this.scene.input.off('pointerup', this.onPointerUp);
  }
}
