import Phaser from 'phaser';

export function burst(scene: Phaser.Scene, x: number, y: number, color: number, count = 12, radius = 55): void {
  for (let index = 0; index < count; index += 1) {
    const dot = scene.add.circle(x, y, Phaser.Math.Between(1, 4), color, 0.95).setDepth(60).setBlendMode(Phaser.BlendModes.ADD);
    const angle = (index / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.2, 0.2);
    const distance = Phaser.Math.Between(Math.round(radius * 0.45), radius);
    scene.tweens.add({
      targets: dot,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0,
      duration: Phaser.Math.Between(260, 520),
      ease: 'Quad.Out',
      onComplete: () => dot.destroy(),
    });
  }
}

export function tracer(scene: Phaser.Scene, fromX: number, fromY: number, toX: number, toY: number, color: number, width = 2): void {
  const graphics = scene.add.graphics().setDepth(55).setBlendMode(Phaser.BlendModes.ADD);
  graphics.lineStyle(width + 3, color, 0.12).lineBetween(fromX, fromY, toX, toY);
  graphics.lineStyle(width, color, 0.95).lineBetween(fromX, fromY, toX, toY);
  scene.tweens.add({ targets: graphics, alpha: 0, duration: 90, onComplete: () => graphics.destroy() });
}

export function floatText(scene: Phaser.Scene, x: number, y: number, text: string, color = '#8effff', size = 26): void {
  const label = scene.add.text(x, y, text, {
    fontFamily: 'Arial Black, system-ui', fontSize: `${size}px`, color, stroke: '#02040d', strokeThickness: 6,
  }).setOrigin(0.5).setDepth(80);
  scene.tweens.add({ targets: label, y: y - 75, alpha: 0, scale: 1.18, duration: 820, ease: 'Cubic.Out', onComplete: () => label.destroy() });
}
