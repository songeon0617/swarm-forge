import Phaser from 'phaser';

type MovementKey = 'left' | 'right' | 'up' | 'down' | 'a' | 'd' | 'w' | 's';

export class PlayerInputController {
  private readonly keys?: Record<MovementKey, Phaser.Input.Keyboard.Key>;
  private touchTarget?: Phaser.Math.Vector2;
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
    if (!this.enabled) return new Phaser.Math.Vector2();
    let x = 0;
    let y = 0;
    if (this.keys) {
      x = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
      y = Number(this.keys.down.isDown || this.keys.s.isDown) - Number(this.keys.up.isDown || this.keys.w.isDown);
    }
    if (x === 0 && y === 0 && this.touchTarget) {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, this.touchTarget.x, this.touchTarget.y);
      if (distance > 12) {
        const angle = Phaser.Math.Angle.Between(playerX, playerY, this.touchTarget.x, this.touchTarget.y);
        x = Math.cos(angle);
        y = Math.sin(angle);
      }
    }
    return new Phaser.Math.Vector2(x, y);
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
