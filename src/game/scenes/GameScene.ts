import Phaser from 'phaser';
import { SURVIVAL_BALANCE, GAME_HEIGHT, GAME_WIDTH } from '../config/balance';
import { Enemy } from '../enemies/Enemy';
import { Player } from '../entities/Player';
import { burst, floatText } from '../render/NeonEffects';
import { createGameTextures } from '../render/TextureFactory';
import { EnemySpawner } from '../systems/EnemySpawner';
import { ExperienceSystem } from '../systems/ExperienceSystem';
import { getRunOutcome } from '../systems/RunRules';
import { xpRequiredForLevel } from '../systems/XpProgression';
import type { UpgradeLevels, WeaponStats } from '../survivalTypes';
import {
  applySurvivalUpgrade,
  createUpgradeLevels,
  selectUpgradeChoices,
  type UpgradeChoice,
} from '../upgrades/SurvivalUpgradeSystem';
import { AutoBolt } from '../weapons/AutoBolt';
import { OrbitBlade } from '../weapons/OrbitBlade';
import { ShockPulse } from '../weapons/ShockPulse';

const CYAN = 0x3cefff;
const MAGENTA = 0xff2d76;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private spawner!: EnemySpawner;
  private experience!: ExperienceSystem;
  private autoBolt!: AutoBolt;
  private orbitBlade!: OrbitBlade;
  private shockPulse!: ShockPulse;
  private weaponStats!: WeaponStats;
  private upgradeLevels!: UpgradeLevels;
  private elapsedSeconds = 0;
  private kills = 0;
  private runEnded = false;
  private isChoosingUpgrade = false;
  private choiceOverlay?: Phaser.GameObjects.Container;
  private grid!: Phaser.GameObjects.TileSprite;
  private hpFill!: Phaser.GameObjects.Rectangle;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private keys?: Record<'left' | 'right' | 'up' | 'down' | 'a' | 'd' | 'w' | 's', Phaser.Input.Keyboard.Key>;
  private touchTarget?: Phaser.Math.Vector2;

  constructor() {
    super('game');
  }

  create(): void {
    createGameTextures(this);
    this.physics.world.setBounds(12, 78, GAME_WIDTH - 24, GAME_HEIGHT - 90);
    this.createBackdrop();
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, {
      maxHp: SURVIVAL_BALANCE.player.maxHp,
      moveSpeed: SURVIVAL_BALANCE.player.speed,
      pickupRadius: SURVIVAL_BALANCE.player.pickupRadius,
    });
    this.weaponStats = {
      boltDamage: SURVIVAL_BALANCE.autoBolt.damage,
      boltCooldownMs: SURVIVAL_BALANCE.autoBolt.cooldownMs,
      boltSpeed: SURVIVAL_BALANCE.autoBolt.speed,
      boltCount: SURVIVAL_BALANCE.autoBolt.projectileCount,
      bladeDamage: SURVIVAL_BALANCE.orbitBlade.damage,
      bladeCount: SURVIVAL_BALANCE.orbitBlade.count,
      bladeSpeed: SURVIVAL_BALANCE.orbitBlade.rotationSpeed,
      bladeRadius: SURVIVAL_BALANCE.orbitBlade.radius,
      pulseDamage: SURVIVAL_BALANCE.shockPulse.damage,
      pulseCooldownMs: SURVIVAL_BALANCE.shockPulse.cooldownMs,
      pulseRadius: SURVIVAL_BALANCE.shockPulse.radius,
    };
    this.upgradeLevels = createUpgradeLevels();
    this.enemies = [];
    this.spawner = new EnemySpawner(this, this.enemies);
    this.experience = new ExperienceSystem(this);
    this.autoBolt = new AutoBolt(this, this.weaponStats);
    this.orbitBlade = new OrbitBlade(this, this.weaponStats);
    this.shockPulse = new ShockPulse(this, this.weaponStats);
    this.createHud();
    this.configureInput();
    this.showOpeningPrompt();
    this.cameras.main.fadeIn(280, 2, 6, 16);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  private createBackdrop(): void {
    this.grid = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'grid').setDepth(-20);
    this.add.rectangle(GAME_WIDTH / 2, 39, GAME_WIDTH, 78, 0x020611, 0.96).setDepth(80);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 6, GAME_WIDTH, 12, 0x020611, 0.96).setDepth(80);
    for (let index = 0; index < 18; index += 1) {
      const accent = this.add
        .circle(
          Phaser.Math.Between(20, 370),
          Phaser.Math.Between(90, 820),
          Phaser.Math.Between(1, 3),
          index % 3 === 0 ? MAGENTA : CYAN,
          0.22,
        )
        .setDepth(-10);
      this.tweens.add({
        targets: accent,
        alpha: 0.65,
        duration: Phaser.Math.Between(700, 1800),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createHud(): void {
    this.add.text(18, 10, 'CORE', { fontFamily: 'Arial Black', fontSize: '10px', color: '#77cde0' }).setDepth(90);
    this.add.rectangle(18, 31, 116, 10, 0x26101c, 1).setOrigin(0, 0.5).setDepth(90);
    this.hpFill = this.add.rectangle(20, 31, 112, 6, MAGENTA, 1).setOrigin(0, 0.5).setDepth(91);
    this.hpText = this.add
      .text(76, 47, '100 / 100', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '10px', color: '#ffb2c9' })
      .setOrigin(0.5)
      .setDepth(91);
    this.levelText = this.add
      .text(154, 10, 'LV 1', { fontFamily: 'Arial Black', fontSize: '14px', color: '#dfffff' })
      .setDepth(91);
    this.add.rectangle(154, 35, 104, 8, 0x11243a, 1).setOrigin(0, 0.5).setDepth(90);
    this.xpFill = this.add.rectangle(156, 35, 2, 4, 0x7dffe5, 1).setOrigin(0, 0.5).setDepth(91);
    this.add
      .text(154, 48, 'EXPERIENCE', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '8px', color: '#6fa2ba' })
      .setDepth(91)
      .setLetterSpacing(1);
    this.timeText = this.add
      .text(365, 12, '01:30', {
        fontFamily: 'Arial Black',
        fontSize: '25px',
        color: '#ffffff',
        stroke: '#06384b',
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setDepth(91);
    this.weaponText = this.add
      .text(14, GAME_HEIGHT - 23, 'BOLT 1  •  BLADE 1  •  PULSE 1', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '10px',
        color: '#8ad6e8',
      })
      .setDepth(91)
      .setLetterSpacing(1);
  }

  private configureInput(): void {
    if (this.input.keyboard) {
      this.keys = {
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      };
    }
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isChoosingUpgrade && !this.runEnded) this.touchTarget = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.isChoosingUpgrade && !this.runEnded) this.touchTarget?.set(pointer.x, pointer.y);
    });
    this.input.on('pointerup', () => {
      this.touchTarget = undefined;
    });
  }

  private showOpeningPrompt(): void {
    const title = this.add
      .text(GAME_WIDTH / 2, 122, 'SWARM FORGE', {
        fontFamily: 'Arial Black',
        fontSize: '29px',
        color: '#eaffff',
        stroke: '#00687d',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setLetterSpacing(2);
    const prompt = this.add
      .text(GAME_WIDTH / 2, 158, 'MOVE • SURVIVE • EVOLVE', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '12px',
        color: '#79efff',
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setLetterSpacing(2);
    this.tweens.add({
      targets: [title, prompt],
      alpha: 0,
      y: '-=15',
      delay: 1900,
      duration: 900,
      onComplete: () => {
        title.destroy();
        prompt.destroy();
      },
    });
  }

  update(time: number, delta: number): void {
    if (this.runEnded || this.isChoosingUpgrade) return;
    this.elapsedSeconds += delta / 1000;
    this.updateMovement();
    this.grid.tilePositionX += delta * 0.006;
    this.grid.tilePositionY += delta * 0.009;
    this.enemies.push(...this.spawner.update(time, this.elapsedSeconds));
    const playerPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      enemy.chase(playerPoint);
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < enemy.displayWidth * 0.42 + 15)
        this.hitPlayer(enemy, time);
    });
    this.autoBolt.update(time, delta, this.player, this.enemies, (enemy, damage) => this.damageEnemy(enemy, damage));
    this.orbitBlade.update(time, delta, this.player, this.enemies, (enemy, damage) => this.damageEnemy(enemy, damage));
    this.shockPulse.update(time, this.player, this.enemies, (enemy, damage) => this.damageEnemy(enemy, damage));
    const collectedXp = this.experience.update(this.player, delta);
    if (collectedXp > 0) {
      this.player.xp += collectedXp;
      this.checkLevelUp();
    }
    this.updateHud();
    const outcome = getRunOutcome(this.player.hp, this.elapsedSeconds, SURVIVAL_BALANCE.runSeconds);
    if (outcome !== 'playing') this.endRun(outcome === 'victory');
  }

  private updateMovement(): void {
    let x = 0;
    let y = 0;
    if (this.keys) {
      x = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
      y = Number(this.keys.down.isDown || this.keys.s.isDown) - Number(this.keys.up.isDown || this.keys.w.isDown);
    }
    if (x === 0 && y === 0 && this.touchTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.touchTarget.x,
        this.touchTarget.y,
      );
      if (distance > 12) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.touchTarget.x, this.touchTarget.y);
        x = Math.cos(angle);
        y = Math.sin(angle);
      }
    }
    this.player.move(x, y);
  }

  private hitPlayer(enemy: Enemy, time: number): void {
    if (!this.player.takeDamage(enemy.contactDamage, time, SURVIVAL_BALANCE.player.invulnerabilityMs)) return;
    this.player.setTintFill(0xffffff);
    this.time.delayedCall(90, () => this.player.active && this.player.clearTint());
    this.cameras.main.shake(130, 0.008);
    burst(this, this.player.x, this.player.y, MAGENTA, 10, 45);
    floatText(this, this.player.x, this.player.y - 25, `-${enemy.contactDamage}`, '#ff799d', 17);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    enemy.setVelocity(-Math.cos(angle) * 95, -Math.sin(angle) * 95);
  }

  private damageEnemy(enemy: Enemy, amount: number): void {
    if (!enemy.active) return;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(45, () => enemy.active && enemy.clearTint());
    if (!enemy.damage(amount)) return;
    this.kills += 1;
    this.experience.drop(enemy.x, enemy.y, enemy.xpValue);
    burst(
      this,
      enemy.x,
      enemy.y,
      enemy.enemyType === 'tank' ? 0xff8338 : MAGENTA,
      enemy.enemyType === 'tank' ? 18 : 9,
      enemy.enemyType === 'tank' ? 68 : 38,
    );
    const index = this.enemies.indexOf(enemy);
    if (index >= 0) this.enemies.splice(index, 1);
    enemy.destroy();
  }

  private checkLevelUp(): void {
    const required = xpRequiredForLevel(this.player.level);
    if (this.player.xp < required) return;
    this.player.xp -= required;
    this.player.level += 1;
    this.showUpgradeChoices();
  }

  private showUpgradeChoices(): void {
    if (this.isChoosingUpgrade || this.runEnded) return;
    const choices = selectUpgradeChoices(this.upgradeLevels);
    if (choices.length === 0) return;
    this.isChoosingUpgrade = true;
    this.player.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.setVelocity(0, 0));
    this.physics.pause();
    const overlay = this.add.container(0, 0).setDepth(150);
    overlay.add(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x01040c, 0.9).setInteractive(),
    );
    overlay.add(
      this.add
        .text(GAME_WIDTH / 2, 124, `LEVEL ${this.player.level}`, {
          fontFamily: 'Arial Black',
          fontSize: '28px',
          color: '#baffff',
          stroke: '#05657a',
          strokeThickness: 4,
        })
        .setOrigin(0.5),
    );
    overlay.add(
      this.add
        .text(GAME_WIDTH / 2, 161, 'CHOOSE ONE UPGRADE', {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: '12px',
          color: '#7eddea',
        })
        .setOrigin(0.5)
        .setLetterSpacing(2),
    );
    choices.forEach((choice, index) => overlay.add(this.createUpgradeCard(choice, 262 + index * 145)));
    this.choiceOverlay = overlay;
  }

  private createUpgradeCard(choice: UpgradeChoice, y: number): Phaser.GameObjects.Container {
    const card = this.add.container(GAME_WIDTH / 2, y);
    const body = this.add
      .rectangle(0, 0, 332, 112, 0x081a2c, 0.98)
      .setStrokeStyle(2, CYAN, 0.9)
      .setInteractive({ useHandCursor: true });
    const title = this.add
      .text(-142, -31, choice.title, { fontFamily: 'Arial Black', fontSize: '17px', color: '#ffffff' })
      .setOrigin(0, 0.5);
    const description = this.add
      .text(-142, 5, choice.description, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '13px', color: '#8de8f4' })
      .setOrigin(0, 0.5);
    const level = this.add
      .text(-142, 33, `LEVEL ${this.upgradeLevels[choice.id]} → ${this.upgradeLevels[choice.id] + 1}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#6d91a5',
      })
      .setOrigin(0, 0.5);
    const icon = this.add.circle(134, 0, 22, 0x0da9bd, 0.22).setStrokeStyle(2, 0x73f5ff, 1);
    const plus = this.add
      .text(134, -1, '+', { fontFamily: 'Arial Black', fontSize: '26px', color: '#caffff' })
      .setOrigin(0.5);
    card.add([body, title, description, level, icon, plus]);
    body.on('pointerover', () => body.setFillStyle(0x0c3246, 1));
    body.on('pointerout', () => body.setFillStyle(0x081a2c, 0.98));
    body.once('pointerdown', () => this.selectUpgrade(choice));
    return card;
  }

  private selectUpgrade(choice: UpgradeChoice): void {
    if (!this.isChoosingUpgrade) return;
    this.isChoosingUpgrade = false;
    applySurvivalUpgrade(choice, this.upgradeLevels, this.player, this.weaponStats);
    this.choiceOverlay?.destroy(true);
    this.choiceOverlay = undefined;
    this.physics.resume();
    burst(this, this.player.x, this.player.y, 0x8dffdf, 22, 80);
    floatText(this, this.player.x, this.player.y - 42, choice.title, '#baffee', 16);
    this.updateHud();
  }

  private updateHud(): void {
    this.hpFill.width = (112 * this.player.hp) / this.player.stats.maxHp;
    this.hpText.setText(`${Math.ceil(this.player.hp)} / ${this.player.stats.maxHp}`);
    this.levelText.setText(`LV ${this.player.level}`);
    this.xpFill.width = Math.max(2, 100 * Math.min(1, this.player.xp / xpRequiredForLevel(this.player.level)));
    const remaining = Math.max(0, Math.ceil(SURVIVAL_BALANCE.runSeconds - this.elapsedSeconds));
    this.timeText.setText(
      `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`,
    );
    if (remaining <= 15) this.timeText.setColor('#ff7098');
    this.weaponText.setText(
      `BOLT ${1 + this.upgradeLevels.boltDamage + this.upgradeLevels.boltSpeed + this.upgradeLevels.boltCount}  •  BLADE ${this.weaponStats.bladeCount}  •  PULSE ${1 + this.upgradeLevels.pulseDamage + this.upgradeLevels.pulseRadius}`,
    );
  }

  private endRun(victory: boolean): void {
    if (this.runEnded) return;
    this.runEnded = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();
    const overlay = this.add.container(0, 0).setDepth(180);
    overlay.add(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x01040c, 0.88).setInteractive(),
    );
    const card = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    const color = victory ? CYAN : MAGENTA;
    const panel = this.add.rectangle(0, 0, 330, 370, 0x07111f, 0.98).setStrokeStyle(3, color, 1);
    const title = this.add
      .text(0, -132, victory ? '90 SEC SURVIVED' : 'CORE DESTROYED', {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: victory ? '#baffff' : '#ff9fbb',
        stroke: '#02040b',
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    const result = this.add
      .text(0, -69, victory ? 'VICTORY' : 'GAME OVER', {
        fontFamily: 'Arial Black',
        fontSize: '38px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const stats = this.add
      .text(
        0,
        13,
        `LEVEL  ${this.player.level}\nENEMIES DESTROYED  ${this.kills}\nTIME  ${Math.floor(this.elapsedSeconds)}s`,
        {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: '15px',
          color: '#b8dce6',
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);
    const button = this.add
      .rectangle(0, 122, 250, 62, victory ? 0x0cb7c4 : 0xd12658, 1)
      .setStrokeStyle(2, 0xffffff, 0.7)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add
      .text(0, 122, 'RUN AGAIN', { fontFamily: 'Arial Black', fontSize: '21px', color: '#ffffff' })
      .setOrigin(0.5)
      .setLetterSpacing(2);
    card.add([panel, title, result, stats, button, buttonText]);
    overlay.add(card);
    card.setScale(0.75).setAlpha(0);
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 380, ease: 'Back.Out' });
    button.once('pointerdown', () => this.scene.restart());
  }

  private cleanup(): void {
    this.autoBolt?.destroy();
    this.orbitBlade?.destroy();
    this.experience?.destroy();
    this.enemies.splice(0).forEach((enemy) => enemy.destroy());
  }
}
