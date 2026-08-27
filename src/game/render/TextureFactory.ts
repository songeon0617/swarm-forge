import Phaser from 'phaser';

function make(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (graphics: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) return;
  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createGameTextures(scene: Phaser.Scene): void {
  make(scene, 'grid', 96, 96, (g) => {
    g.fillStyle(0x08101d, 1).fillRect(0, 0, 96, 96);
    g.lineStyle(1, 0x244052, 0.22).lineBetween(0, 0, 96, 0).lineBetween(0, 0, 0, 96);
    g.lineStyle(1, 0x172d3d, 0.14).lineBetween(48, 0, 48, 96).lineBetween(0, 48, 96, 48);
  });
  make(scene, 'drone-rifle', 32, 38, (g) => {
    g.fillStyle(0x00eaff, 0.14).fillCircle(16, 20, 14);
    g.fillStyle(0x032436, 1).fillTriangle(16, 3, 4, 31, 28, 31);
    g.lineStyle(2, 0x47f6ff, 1).strokeTriangle(16, 3, 4, 31, 28, 31);
    g.fillStyle(0xe9ffff, 1).fillCircle(16, 18, 3);
    g.fillStyle(0x13aeca, 1).fillRect(2, 25, 7, 4).fillRect(23, 25, 7, 4);
  });
  make(scene, 'drone-laser', 34, 40, (g) => {
    g.fillStyle(0x95ffed, 0.17).fillCircle(17, 21, 16);
    g.fillStyle(0x08252a, 1).fillTriangle(17, 2, 3, 30, 31, 30);
    g.lineStyle(2, 0x7dffd4, 1).strokeTriangle(17, 2, 3, 30, 31, 30);
    g.fillStyle(0xf8ff97, 1).fillCircle(17, 17, 4);
    g.lineStyle(3, 0xc9ff56, 1).lineBetween(17, 8, 17, 28);
  });
  make(scene, 'capsule', 58, 58, (g) => {
    g.fillStyle(0x00eaff, 0.12).fillCircle(29, 29, 28);
    g.fillStyle(0x09263c, 1).fillRoundedRect(7, 14, 44, 30, 10);
    g.lineStyle(3, 0x43edff, 1).strokeRoundedRect(7, 14, 44, 30, 10);
    g.fillStyle(0x88ffff, 0.8).fillRect(24, 19, 10, 20).fillRect(19, 24, 20, 10);
  });
  make(scene, 'grunt', 38, 42, (g) => {
    g.fillStyle(0xff2e78, 0.16).fillCircle(19, 21, 18);
    g.fillStyle(0x370c22, 1).fillTriangle(19, 39, 3, 9, 35, 9);
    g.lineStyle(2, 0xff3a7e, 1).strokeTriangle(19, 39, 3, 9, 35, 9);
    g.fillStyle(0xffd0df, 1).fillCircle(19, 18, 4);
  });
  make(scene, 'heavy', 54, 56, (g) => {
    g.fillStyle(0xff501e, 0.13).fillCircle(27, 28, 26);
    g.fillStyle(0x35100e, 1).fillRoundedRect(6, 8, 42, 40, 8);
    g.lineStyle(3, 0xff5d35, 1).strokeRoundedRect(6, 8, 42, 40, 8);
    g.fillStyle(0xffbe5c, 1).fillRect(20, 16, 14, 10);
    g.lineStyle(3, 0xff5d35, 1).lineBetween(8, 18, 1, 7).lineBetween(46, 18, 53, 7);
  });
  make(scene, 'turret', 48, 48, (g) => {
    g.fillStyle(0x7c37ff, 0.18).fillCircle(24, 24, 23);
    g.fillStyle(0x251044, 1).fillCircle(24, 26, 15);
    g.lineStyle(3, 0xb86cff, 1).strokeCircle(24, 26, 15);
    g.fillStyle(0xf0dcff, 1).fillRect(21, 1, 6, 25);
    g.fillStyle(0xb86cff, 1).fillCircle(24, 26, 5);
  });
  make(scene, 'boss', 132, 132, (g) => {
    g.fillStyle(0xff1c68, 0.12).fillCircle(66, 66, 64);
    g.fillStyle(0x260b25, 1).fillCircle(66, 66, 49);
    g.lineStyle(5, 0xff2b77, 1).strokeCircle(66, 66, 49);
    g.lineStyle(6, 0x7e184d, 1);
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      g.lineBetween(
        66 + Math.cos(angle) * 44,
        66 + Math.sin(angle) * 44,
        66 + Math.cos(angle) * 61,
        66 + Math.sin(angle) * 61,
      );
    }
    g.fillStyle(0xffe2ee, 1).fillCircle(66, 66, 13);
    g.fillStyle(0xff276e, 1).fillCircle(66, 66, 7);
  });
  make(scene, 'survivor-player', 36, 36, (g) => {
    g.fillStyle(0x113449, 1).fillTriangle(18, 1, 3, 30, 18, 25).fillTriangle(18, 1, 33, 30, 18, 25);
    g.lineStyle(3, 0x5cf5ff, 1).strokeTriangle(18, 1, 3, 30, 18, 25).strokeTriangle(18, 1, 33, 30, 18, 25);
    g.fillStyle(0xeaffff, 1).fillCircle(18, 15, 4);
    g.fillStyle(0x26c9dd, 1).fillTriangle(9, 27, 18, 34, 27, 27);
  });
  make(scene, 'survivor-grunt', 34, 34, (g) => {
    g.fillStyle(0x3a0a20, 1).fillCircle(17, 18, 13);
    g.lineStyle(3, 0xff3b78, 1).strokeCircle(17, 17, 13);
    g.fillStyle(0x3a0a20, 1).fillTriangle(5, 12, 11, 2, 14, 11).fillTriangle(20, 11, 23, 2, 29, 12);
    g.lineStyle(2, 0xff3b78, 1).lineBetween(5, 12, 11, 2).lineBetween(23, 2, 29, 12);
    g.fillStyle(0xffd4e1, 1).fillCircle(17, 18, 4);
  });
  make(scene, 'survivor-runner', 30, 34, (g) => {
    g.fillStyle(0x351033, 1).fillTriangle(15, 0, 3, 25, 15, 20).fillTriangle(15, 0, 27, 25, 15, 20);
    g.lineStyle(3, 0xff61e6, 1).strokeTriangle(15, 0, 3, 25, 15, 20).strokeTriangle(15, 0, 27, 25, 15, 20);
    g.fillStyle(0xffe6fb, 1).fillCircle(15, 13, 3);
    g.fillStyle(0xc22fa9, 1).fillTriangle(8, 25, 15, 33, 22, 25);
  });
  make(scene, 'survivor-tank', 52, 52, (g) => {
    g.fillStyle(0x351408, 1).fillRoundedRect(3, 5, 46, 42, 6);
    g.lineStyle(4, 0xff7b31, 1).strokeRoundedRect(3, 5, 46, 42, 6);
    g.fillStyle(0x713119, 1).fillRect(8, 10, 7, 32).fillRect(37, 10, 7, 32);
    g.fillStyle(0xffd080, 1).fillRect(20, 17, 12, 18);
    g.lineStyle(3, 0xff7b31, 1).strokeRect(17, 14, 18, 24);
  });
  make(scene, 'survivor-bolt', 18, 8, (g) => {
    g.fillStyle(0x8effff, 1).fillTriangle(0, 1, 18, 4, 0, 7);
    g.fillStyle(0xffffff, 1).fillTriangle(8, 2, 18, 4, 8, 6);
  });
  make(scene, 'survivor-turret', 34, 34, (g) => {
    g.fillStyle(0x142d23, 1).fillCircle(17, 19, 12);
    g.lineStyle(3, 0xbaf45c, 1).strokeCircle(17, 19, 12);
    g.fillStyle(0xeaffb6, 1).fillRect(14, 1, 6, 18);
    g.fillStyle(0x6fae34, 1).fillCircle(17, 19, 5);
    g.fillStyle(0x142d23, 1).fillTriangle(5, 28, 1, 34, 11, 31).fillTriangle(29, 28, 33, 34, 23, 31);
  });
  make(scene, 'survivor-mine', 28, 28, (g) => {
    g.fillStyle(0x3a2610, 1).fillCircle(14, 14, 10);
    g.lineStyle(3, 0xffbd42, 1).strokeCircle(14, 14, 10);
    g.lineStyle(3, 0x9a6524, 1).lineBetween(14, 0, 14, 5).lineBetween(14, 23, 14, 28);
    g.lineBetween(0, 14, 5, 14).lineBetween(23, 14, 28, 14);
    g.fillStyle(0xfff0b3, 1).fillCircle(14, 14, 3);
  });
}
