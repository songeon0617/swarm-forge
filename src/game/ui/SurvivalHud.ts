import Phaser from 'phaser';
import { GAME_HEIGHT, SURVIVAL_BALANCE } from '../config/balance';
import type { Player } from '../entities/Player';
import { xpRequiredForLevel } from '../systems/XpProgression';
import type { UpgradeLevels, WeaponStats } from '../survivalTypes';

export class SurvivalHud {
  private readonly root: Phaser.GameObjects.Container;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly weaponText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(90);
    const coreLabel = scene.add.text(18, 10, 'CORE', {
      fontFamily: 'Arial Black',
      fontSize: '10px',
      color: '#77cde0',
    });
    const hpBack = scene.add.rectangle(18, 31, 116, 10, 0x26101c, 1).setOrigin(0, 0.5);
    this.hpFill = scene.add.rectangle(20, 31, 112, 6, 0xff2d76, 1).setOrigin(0, 0.5);
    this.hpText = scene.add
      .text(76, 47, '100 / 100', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '10px',
        color: '#ffb2c9',
      })
      .setOrigin(0.5);
    this.levelText = scene.add.text(154, 10, 'LV 1', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#dfffff',
    });
    const xpBack = scene.add.rectangle(154, 35, 104, 8, 0x11243a, 1).setOrigin(0, 0.5);
    this.xpFill = scene.add.rectangle(156, 35, 2, 4, 0x7dffe5, 1).setOrigin(0, 0.5);
    const xpLabel = scene.add
      .text(154, 48, 'EXPERIENCE', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '8px',
        color: '#6fa2ba',
      })
      .setLetterSpacing(1);
    this.timeText = scene.add
      .text(365, 12, '01:30', {
        fontFamily: 'Arial Black',
        fontSize: '25px',
        color: '#ffffff',
        stroke: '#06384b',
        strokeThickness: 4,
      })
      .setOrigin(1, 0);
    this.weaponText = scene.add
      .text(14, GAME_HEIGHT - 23, 'BOLT 1  •  BLADE 1  •  PULSE 1', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '10px',
        color: '#8ad6e8',
      })
      .setLetterSpacing(1);
    this.root.add([
      coreLabel,
      hpBack,
      this.hpFill,
      this.hpText,
      this.levelText,
      xpBack,
      this.xpFill,
      xpLabel,
      this.timeText,
      this.weaponText,
    ]);
  }

  update(player: Player, elapsedSeconds: number, levels: UpgradeLevels, weapons: WeaponStats): void {
    this.hpFill.width = (112 * player.hp) / player.stats.maxHp;
    this.hpText.setText(`${Math.ceil(player.hp)} / ${player.stats.maxHp}`);
    this.levelText.setText(`LV ${player.level}`);
    this.xpFill.width = Math.max(2, 100 * Math.min(1, player.xp / xpRequiredForLevel(player.level)));
    const remaining = Math.max(0, Math.ceil(SURVIVAL_BALANCE.runSeconds - elapsedSeconds));
    this.timeText
      .setText(`${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`)
      .setColor(remaining <= 15 ? '#ff7098' : '#ffffff');
    this.weaponText.setText(
      `BOLT ${1 + levels.boltDamage + levels.boltSpeed + levels.boltCount}  •  BLADE ${weapons.bladeCount}  •  PULSE ${1 + levels.pulseDamage + levels.pulseRadius}`,
    );
  }

  destroy(): void {
    this.root.destroy(true);
  }
}
