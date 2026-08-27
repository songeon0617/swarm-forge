import Phaser from 'phaser';
import { SynthAudio } from '../audio/SynthAudio';
import { BALANCE, GAME_HEIGHT, GAME_WIDTH, PLAYER_Y, TRACK_LEFT, TRACK_RIGHT } from '../config/balance';
import { applyGate } from '../gates/gateLogic';
import { loadBest, saveBest, type BestRun } from '../persistence/bestRun';
import { generateStage } from '../progression/stageGenerator';
import { burst, floatText, tracer } from '../render/NeonEffects';
import { SwarmView } from '../render/SwarmView';
import { createGameTextures } from '../render/TextureFactory';
import { SwarmState } from '../swarm/SwarmState';
import type { CourseEvent, EnemySpec, GateOption, UpgradeOption } from '../types';
import { applyUpgrade } from '../upgrades/upgradeLogic';

interface EnemyRuntime {
  spec: EnemySpec;
  image: Phaser.GameObjects.Image;
  healthBack: Phaser.GameObjects.Rectangle;
  healthFill: Phaser.GameObjects.Rectangle;
  alive: boolean;
  entered: boolean;
}

interface EventRuntime {
  event: Exclude<CourseEvent, { kind: 'enemyWave' | 'boss' }>;
  display: Phaser.GameObjects.Container;
  resolved: boolean;
  hp?: number;
}

interface AttackTarget {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: (amount: number) => void;
}

const cyan = 0x3cefff;
const magenta = 0xff2d76;

export class GameScene extends Phaser.Scene {
  private swarm = new SwarmState();
  private swarmView!: SwarmView;
  private audio = new SynthAudio();
  private worldDistance = 0;
  private runSeed = Date.now() & 0xfffffff;
  private runtimeEvents: EventRuntime[] = [];
  private enemies: EnemyRuntime[] = [];
  private grid!: Phaser.GameObjects.TileSprite;
  private countText!: Phaser.GameObjects.Text;
  private laserText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private audioButton!: Phaser.GameObjects.Text;
  private keys?: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key };
  private lastRifleShot = 0;
  private lastLaserShot = 0;
  private lastEnemyAttack = 0;
  private maxSwarm = 4;
  private kills = 0;
  private score = 0;
  private runEnded = false;
  private boss?: EnemyRuntime;
  private bossBar?: Phaser.GameObjects.Container;
  private best: BestRun = { score: 0, swarm: 0, victories: 0 };

  constructor() { super('game'); }

  create(): void {
    createGameTextures(this);
    this.best = loadBest();
    this.buildBackdrop();
    this.swarm = new SwarmState({ rifle: BALANCE.startRifles, laser: 0 });
    this.swarmView = new SwarmView(this);
    this.swarmView.sync(this.swarm.snapshot());
    this.buildStage();
    this.buildHud();
    this.configureInput();
    this.showOpeningPrompt();
    this.cameras.main.fadeIn(350, 3, 8, 22);
  }

  private buildBackdrop(): void {
    this.grid = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'grid').setDepth(-20);
    this.add.rectangle(18, GAME_HEIGHT / 2, 30, GAME_HEIGHT, 0x020612, 0.92).setDepth(-10);
    this.add.rectangle(GAME_WIDTH - 18, GAME_HEIGHT / 2, 30, GAME_HEIGHT, 0x020612, 0.92).setDepth(-10);
    this.add.rectangle(35, GAME_HEIGHT / 2, 2, GAME_HEIGHT, 0x12bcd0, 0.45).setDepth(-9);
    this.add.rectangle(GAME_WIDTH - 35, GAME_HEIGHT / 2, 2, GAME_HEIGHT, 0x12bcd0, 0.45).setDepth(-9);
    for (let i = 0; i < 12; i += 1) {
      const x = i % 2 === 0 ? 17 : GAME_WIDTH - 17;
      const light = this.add.rectangle(x, i * 82, 5, 30, i % 3 === 0 ? 0xff2d76 : 0x1eeaff, 0.75).setDepth(-8);
      this.tweens.add({ targets: light, alpha: 0.15, duration: 650 + i * 40, yoyo: true, repeat: -1 });
    }
    const vignette = this.add.graphics().setDepth(90).setScrollFactor(0);
    vignette.lineStyle(18, 0x00030c, 0.35).strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private buildStage(): void {
    const stage = generateStage(this.runSeed);
    stage.forEach((event) => {
      if (event.kind === 'enemyWave') {
        event.enemies.forEach((spec) => this.createEnemy(spec));
      } else if (event.kind === 'boss') {
        this.boss = this.createEnemy(event.enemy);
      } else {
        this.runtimeEvents.push(this.createCourseEvent(event));
      }
    });
  }

  private createCourseEvent(event: EventRuntime['event']): EventRuntime {
    const display = this.add.container(0, -200).setDepth(12);
    if (event.kind === 'capsule') {
      const glow = this.add.circle(0, 0, 38, cyan, 0.07);
      const image = this.add.image(0, 0, 'capsule');
      const label = this.add.text(0, -44, `+${event.amount}`, { fontFamily: 'Arial Black', fontSize: '20px', color: '#9cffff', stroke: '#02101a', strokeThickness: 5 }).setOrigin(0.5);
      display.setX(event.x).add([glow, image, label]);
      this.tweens.add({ targets: glow, scale: 1.35, alpha: 0.22, yoyo: true, repeat: -1, duration: 680 });
      return { event, display, resolved: false, hp: event.hp };
    }
    if (event.kind === 'gate') {
      display.setX(0).add([this.makeChoicePanel(104, event.left.label, 'QUANTITY', 0x00d5ff), this.makeChoicePanel(286, event.right.label, 'QUANTITY', 0x00d5ff)]);
    } else if (event.kind === 'upgrade') {
      display.setX(0).add([this.makeChoicePanel(104, event.left.label, event.left.detail, 0xb4ff4d), this.makeChoicePanel(286, event.right.label, event.right.detail, 0xffdf4d)]);
    } else {
      const plate = this.add.rectangle(0, 0, event.width, 72, 0x5d0b20, 0.92).setStrokeStyle(3, 0xff2d62, 1);
      const stripes = this.add.text(0, 0, '⚠  DRAIN  ⚠', { fontFamily: 'Arial Black', fontSize: '16px', color: '#ffb0c4', stroke: '#29000b', strokeThickness: 4 }).setOrigin(0.5);
      display.setX(event.x).add([plate, stripes]);
      this.tweens.add({ targets: plate, alpha: 0.55, duration: 420, yoyo: true, repeat: -1 });
    }
    return { event, display, resolved: false };
  }

  private makeChoicePanel(x: number, label: string, detail: string, color: number): Phaser.GameObjects.Container {
    const panel = this.add.container(x, 0);
    const glow = this.add.rectangle(0, 0, 154, 112, color, 0.08);
    const body = this.add.rectangle(0, 0, 148, 106, 0x081a2c, 0.9).setStrokeStyle(3, color, 0.95);
    const title = this.add.text(0, -11, label, { fontFamily: 'Arial Black', fontSize: label.length > 7 ? '16px' : '32px', color: '#ffffff', stroke: '#03101d', strokeThickness: 5 }).setOrigin(0.5);
    const sub = this.add.text(0, 27, detail, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '11px', color: Phaser.Display.Color.IntegerToColor(color).rgba }).setOrigin(0.5).setLetterSpacing(1);
    panel.add([glow, body, title, sub]);
    this.tweens.add({ targets: glow, scaleX: 1.09, alpha: 0.2, duration: 560, yoyo: true, repeat: -1 });
    return panel;
  }

  private createEnemy(spec: EnemySpec): EnemyRuntime {
    const image = this.add.image(spec.x, -200, spec.type).setDepth(spec.type === 'boss' ? 18 : 16);
    const width = spec.type === 'boss' ? 118 : Math.max(30, spec.radius * 2);
    const healthBack = this.add.rectangle(spec.x, -200, width, 5, 0x260613, 0.9).setDepth(17);
    const healthFill = this.add.rectangle(spec.x - width / 2, -200, width, 5, magenta, 1).setOrigin(0, 0.5).setDepth(18);
    const runtime = { spec: { ...spec }, image, healthBack, healthFill, alive: true, entered: false };
    if (spec.type === 'boss') {
      image.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: image, angle: 360, duration: 8500, repeat: -1 });
    }
    return this.enemies.push(runtime), runtime;
  }

  private buildHud(): void {
    this.add.rectangle(GAME_WIDTH / 2, 42, 354, 58, 0x030816, 0.86).setStrokeStyle(1, 0x1b6b87, 0.8).setDepth(95);
    this.add.image(54, 40, 'drone-rifle').setScale(0.68).setDepth(96);
    this.countText = this.add.text(76, 26, '4', { fontFamily: 'Arial Black', fontSize: '25px', color: '#eaffff' }).setDepth(96);
    this.laserText = this.add.text(77, 52, 'LASER 0', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '10px', color: '#a9ffd9' }).setDepth(96);
    this.add.rectangle(225, 39, 134, 7, 0x14213b, 1).setOrigin(0, 0.5).setDepth(96);
    this.progressFill = this.add.rectangle(225, 39, 2, 7, cyan, 1).setOrigin(0, 0.5).setDepth(97);
    this.add.text(225, 50, 'FORGE ROUTE', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '9px', color: '#6b92ab' }).setDepth(96).setLetterSpacing(1);
    this.audioButton = this.add.text(353, 39, '◖))', { fontFamily: 'Arial Black', fontSize: '16px', color: '#8ff7ff' }).setOrigin(0.5).setDepth(98).setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', () => {
      const enabled = this.audio.toggle();
      this.audioButton.setText(enabled ? '◖))' : 'MUTE').setFontSize(enabled ? 16 : 10).setColor(enabled ? '#8ff7ff' : '#6d7788');
    });
  }

  private configureInput(): void {
    const updatePointer = (pointer: Phaser.Input.Pointer) => {
      if (this.runEnded) return;
      if (pointer.wasTouch && !pointer.isDown) return;
      this.swarmView.setTargetX(Phaser.Math.Clamp(pointer.x, TRACK_LEFT + 20, TRACK_RIGHT - 20));
    };
    this.input.on('pointermove', updatePointer);
    this.input.on('pointerdown', updatePointer);
    if (this.input.keyboard) {
      this.keys = {
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  private showOpeningPrompt(): void {
    const title = this.add.text(GAME_WIDTH / 2, 108, 'SWARM FORGE', { fontFamily: 'Arial Black', fontSize: '30px', color: '#efffff', stroke: '#04788e', strokeThickness: 3 }).setOrigin(0.5).setDepth(100).setLetterSpacing(2);
    const prompt = this.add.text(GAME_WIDTH / 2, 144, 'DRAG TO STEER', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: '#6cefff' }).setOrigin(0.5).setDepth(100).setLetterSpacing(3);
    this.tweens.add({ targets: [title, prompt], alpha: 0, y: '-=18', delay: 1800, duration: 1000, onComplete: () => { title.destroy(); prompt.destroy(); } });
  }

  update(time: number, delta: number): void {
    if (this.runEnded) return;
    this.updateInput(delta);
    this.swarmView.update(time, delta);
    this.advanceWorld(delta);
    this.updateCourseObjects(time);
    this.resolveCourseCollisions();
    this.updateCombat(time);
    this.updateHud();
    if (this.swarm.total <= 0) this.endRun(false, 'SWARM LOST');
  }

  private updateInput(delta: number): void {
    if (!this.keys) return;
    const direction = Number(this.keys.right.isDown || this.keys.d.isDown) - Number(this.keys.left.isDown || this.keys.a.isDown);
    if (direction !== 0) this.swarmView.setTargetX(Phaser.Math.Clamp(this.swarmView.x + direction * delta * 0.28, TRACK_LEFT + 20, TRACK_RIGHT - 20));
  }

  private advanceWorld(delta: number): void {
    const bossLock = this.boss?.alive && this.worldDistance > this.boss.spec.distance - 325;
    if (!bossLock) this.worldDistance += BALANCE.courseSpeed * delta / 1000;
    this.grid.tilePositionY -= BALANCE.courseSpeed * delta / 1000;
  }

  private projectedY(distance: number): number { return PLAYER_Y - (distance - this.worldDistance); }

  private updateCourseObjects(time: number): void {
    this.runtimeEvents.forEach((runtime) => {
      if (runtime.resolved && runtime.display.alpha <= 0.01) return;
      const y = this.projectedY(runtime.event.distance);
      runtime.display.y = y;
      if (runtime.event.kind === 'capsule') runtime.display.rotation = Math.sin(time * 0.003) * 0.08;
    });
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const y = this.projectedY(enemy.spec.distance);
      enemy.image.y = y;
      enemy.healthBack.y = y - enemy.spec.radius - 12;
      enemy.healthFill.y = y - enemy.spec.radius - 12;
      const width = enemy.spec.type === 'boss' ? 118 : Math.max(30, enemy.spec.radius * 2);
      enemy.healthFill.width = width * Math.max(0, enemy.spec.hp / enemy.spec.maxHp);
      enemy.image.x = enemy.spec.x + (enemy.spec.type === 'grunt' ? Math.sin(time * 0.003 + enemy.spec.distance) * 12 : 0);
      enemy.healthBack.x = enemy.image.x;
      enemy.healthFill.x = enemy.image.x - width / 2;
      if (y > -40 && !enemy.entered) {
        enemy.entered = true;
        enemy.image.setScale(0.3);
        this.tweens.add({ targets: enemy.image, scale: 1, duration: 260, ease: 'Back.Out' });
        if (enemy.spec.type === 'boss') this.showBossBar();
      }
    });
  }

  private resolveCourseCollisions(): void {
    this.runtimeEvents.forEach((runtime) => {
      if (runtime.resolved || Math.abs(this.projectedY(runtime.event.distance) - PLAYER_Y) > 18) return;
      const event = runtime.event;
      if (event.kind === 'gate') this.resolveGate(runtime, this.swarmView.x < GAME_WIDTH / 2 ? event.left : event.right);
      else if (event.kind === 'upgrade') this.resolveUpgrade(runtime, this.swarmView.x < GAME_WIDTH / 2 ? event.left : event.right);
      else if (event.kind === 'hazard') this.resolveHazard(runtime);
    });

    this.enemies.forEach((enemy) => {
      if (!enemy.alive || enemy.spec.type === 'boss') return;
      const y = this.projectedY(enemy.spec.distance);
      if (y >= PLAYER_Y - 30) {
        if (Math.abs(enemy.image.x - this.swarmView.x) < enemy.spec.radius + 42) {
          this.damageSwarm(enemy.spec.damage, enemy.image.x, y);
          this.destroyEnemy(enemy, false);
        } else if (y > GAME_HEIGHT + 40) this.destroyEnemy(enemy, false);
      }
    });
  }

  private resolveGate(runtime: EventRuntime, gate: GateOption): void {
    runtime.resolved = true;
    const before = this.swarm.total;
    const result = applyGate(this.swarm.snapshot(), gate);
    this.swarm = new SwarmState(result);
    const gain = this.swarm.total - before;
    this.maxSwarm = Math.max(this.maxSwarm, this.swarm.total);
    this.swarmView.sync(result);
    this.swarmView.pulse(0x7affff);
    this.audio.gate();
    this.cameras.main.shake(110, 0.005);
    burst(this, this.swarmView.x, PLAYER_Y - 25, cyan, 22, 82);
    floatText(this, this.swarmView.x, PLAYER_Y - 80, `${gate.label}  +${gain}`, '#8effff', 28);
    this.tweens.add({ targets: runtime.display, alpha: 0, scale: 1.25, duration: 260 });
  }

  private resolveUpgrade(runtime: EventRuntime, upgrade: UpgradeOption): void {
    runtime.resolved = true;
    const before = this.swarm.snapshot();
    const result = applyUpgrade(before, upgrade);
    this.swarm = new SwarmState(result);
    this.maxSwarm = Math.max(this.maxSwarm, this.swarm.total);
    this.swarmView.sync(result);
    this.swarmView.pulse(upgrade.kind === 'convert' ? 0xdfff68 : 0x66eaff);
    this.audio.upgrade();
    burst(this, this.swarmView.x, PLAYER_Y - 35, upgrade.kind === 'convert' ? 0xcaff55 : cyan, 28, 90);
    floatText(this, this.swarmView.x, PLAYER_Y - 86, upgrade.kind === 'convert' ? `LASERS +${result.laser - before.laser}` : upgrade.label, '#e8ff9b', 24);
    this.tweens.add({ targets: runtime.display, alpha: 0, scale: 1.2, duration: 260 });
  }

  private resolveHazard(runtime: EventRuntime): void {
    runtime.resolved = true;
    const event = runtime.event;
    if (event.kind !== 'hazard') return;
    if (Math.abs(event.x - this.swarmView.x) < event.width / 2 + 28) {
      const lost = this.swarm.lose(Math.max(1, this.swarm.total * event.lossRatio));
      this.swarmView.sync(this.swarm.snapshot());
      this.swarmView.pulse(0xff335e);
      this.audio.hurt();
      this.cameras.main.shake(180, 0.009);
      burst(this, this.swarmView.x, PLAYER_Y, magenta, 18, 70);
      floatText(this, this.swarmView.x, PLAYER_Y - 70, `-${lost}`, '#ff7d9d', 28);
    } else {
      floatText(this, this.swarmView.x, PLAYER_Y - 60, 'EVADED', '#8effff', 16);
    }
    this.tweens.add({ targets: runtime.display, alpha: 0, duration: 180 });
  }

  private updateCombat(time: number): void {
    const target = this.acquireTarget();
    if (target) {
      if (this.swarm.rifle > 0 && time - this.lastRifleShot >= BALANCE.rifleFireMs) {
        this.lastRifleShot = time;
        const damage = this.swarm.rifle * BALANCE.rifleDamage;
        target.damage(damage);
        tracer(this, this.swarmView.x + Phaser.Math.Between(-25, 25), PLAYER_Y - 20, target.x, target.y, cyan, 2);
        this.audio.shoot();
      }
      if (this.swarm.laser > 0 && time - this.lastLaserShot >= BALANCE.laserFireMs) {
        this.lastLaserShot = time;
        const damage = this.swarm.laser * BALANCE.laserDamage;
        target.damage(damage);
        tracer(this, this.swarmView.x, PLAYER_Y - 25, target.x, target.y, 0xc7ff51, 4);
        this.audio.laser();
      }
    }

    if (time - this.lastEnemyAttack > 900) {
      this.lastEnemyAttack = time;
      const threat = this.enemies.find((enemy) => enemy.alive && (enemy.spec.type === 'turret' || enemy.spec.type === 'boss') && this.projectedY(enemy.spec.distance) > 250 && this.projectedY(enemy.spec.distance) < 610);
      if (threat) {
        tracer(this, threat.image.x, threat.image.y, this.swarmView.x, PLAYER_Y, magenta, 3);
        this.damageSwarm(threat.spec.damage, this.swarmView.x, PLAYER_Y);
        if (threat.spec.type === 'boss') this.cameras.main.shake(90, 0.003);
      }
    }
  }

  private acquireTarget(): AttackTarget | undefined {
    const candidates: Array<AttackTarget & { distance: number }> = [];
    this.runtimeEvents.forEach((runtime) => {
      if (runtime.resolved || runtime.event.kind !== 'capsule' || !runtime.hp) return;
      const y = this.projectedY(runtime.event.distance);
      const ahead = PLAYER_Y - y;
      if (ahead > 0 && ahead < BALANCE.attackRange && Math.abs(runtime.event.x - this.swarmView.x) < 105) {
        candidates.push({
          x: runtime.event.x, y, hp: runtime.hp, maxHp: runtime.event.hp, distance: ahead,
          damage: (amount) => this.damageCapsule(runtime, amount),
        });
      }
    });
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const y = this.projectedY(enemy.spec.distance);
      const ahead = PLAYER_Y - y;
      const aimWidth = enemy.spec.type === 'boss' ? 250 : 145;
      if (ahead > 0 && ahead < BALANCE.attackRange && Math.abs(enemy.image.x - this.swarmView.x) < aimWidth) {
        candidates.push({
          x: enemy.image.x, y, hp: enemy.spec.hp, maxHp: enemy.spec.maxHp, distance: ahead,
          damage: (amount) => this.damageEnemy(enemy, amount),
        });
      }
    });
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0];
  }

  private damageCapsule(runtime: EventRuntime, amount: number): void {
    runtime.hp = Math.max(0, (runtime.hp ?? 0) - amount);
    runtime.display.setScale(1.08);
    this.tweens.add({ targets: runtime.display, scale: 1, duration: 80 });
    if ((runtime.hp ?? 0) > 0) return;
    runtime.resolved = true;
    if (runtime.event.kind !== 'capsule') return;
    const amountGained = this.swarm.add('rifle', runtime.event.amount);
    this.maxSwarm = Math.max(this.maxSwarm, this.swarm.total);
    this.swarmView.sync(this.swarm.snapshot());
    this.audio.capsule();
    this.time.delayedCall(100, () => this.audio.gain());
    burst(this, runtime.event.x, runtime.display.y, cyan, 24, 90);
    floatText(this, runtime.event.x, runtime.display.y, `+${amountGained} DRONES`, '#a5ffff', 22);
    this.tweens.add({ targets: runtime.display, alpha: 0, scale: 1.6, angle: 30, duration: 240 });
  }

  private damageEnemy(enemy: EnemyRuntime, amount: number): void {
    if (!enemy.alive) return;
    enemy.spec.hp = Math.max(0, enemy.spec.hp - amount);
    enemy.image.setTintFill(0xffffff);
    this.time.delayedCall(45, () => enemy.image.clearTint());
    if (enemy.spec.type === 'boss') this.updateBossBar();
    if (enemy.spec.hp <= 0) this.destroyEnemy(enemy, true);
  }

  private destroyEnemy(enemy: EnemyRuntime, countKill: boolean): void {
    if (!enemy.alive) return;
    enemy.alive = false;
    if (countKill) {
      this.kills += 1;
      this.score += enemy.spec.type === 'boss' ? 2500 : enemy.spec.maxHp * 10;
      this.audio.destroy();
    }
    burst(this, enemy.image.x, enemy.image.y, enemy.spec.type === 'turret' ? 0xb765ff : magenta, enemy.spec.type === 'boss' ? 55 : 15, enemy.spec.type === 'boss' ? 150 : 65);
    this.tweens.add({ targets: [enemy.image, enemy.healthBack, enemy.healthFill], alpha: 0, scale: enemy.spec.type === 'boss' ? 1.8 : 0.2, angle: enemy.spec.type === 'boss' ? 90 : 20, duration: enemy.spec.type === 'boss' ? 900 : 260, onComplete: () => { enemy.image.destroy(); enemy.healthBack.destroy(); enemy.healthFill.destroy(); } });
    if (enemy.spec.type === 'boss') {
      this.audio.bossDeath();
      this.cameras.main.shake(700, 0.012);
      this.cameras.main.flash(350, 90, 255, 255, false);
      this.bossBar?.destroy();
      this.time.delayedCall(1150, () => this.endRun(true, 'FORGE CONQUERED'));
    }
  }

  private damageSwarm(amount: number, x: number, y: number): void {
    const lost = this.swarm.lose(amount);
    if (lost <= 0) return;
    this.swarmView.sync(this.swarm.snapshot());
    this.audio.hurt();
    burst(this, x, y, magenta, 8, 38);
    floatText(this, x, y - 30, `-${lost}`, '#ff718f', 18);
  }

  private showBossBar(): void {
    if (this.bossBar) return;
    const container = this.add.container(GAME_WIDTH / 2, 101).setDepth(99);
    const label = this.add.text(0, -15, 'THE NULL FOUNDRY', { fontFamily: 'Arial Black', fontSize: '12px', color: '#ff9ebc' }).setOrigin(0.5).setLetterSpacing(2);
    const back = this.add.rectangle(0, 5, 300, 12, 0x300619, 0.95).setStrokeStyle(2, 0xff2d76, 1);
    const fill = this.add.rectangle(-148, 5, 296, 8, magenta, 1).setOrigin(0, 0.5).setName('fill');
    container.add([label, back, fill]);
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 350, ease: 'Back.Out' });
    this.bossBar = container;
  }

  private updateBossBar(): void {
    if (!this.boss || !this.bossBar) return;
    const fill = this.bossBar.getByName('fill') as Phaser.GameObjects.Rectangle;
    fill.width = 296 * Math.max(0, this.boss.spec.hp / this.boss.spec.maxHp);
  }

  private updateHud(): void {
    this.countText.setText(String(this.swarm.total));
    this.laserText.setText(`LASER ${this.swarm.laser}`);
    this.progressFill.width = Math.max(2, 134 * Math.min(1, this.worldDistance / 4680));
  }

  private endRun(victory: boolean, headline: string): void {
    if (this.runEnded) return;
    this.runEnded = true;
    const finalScore = Math.round(this.score + this.maxSwarm * 35 + this.kills * 50 + (victory ? 3000 : this.worldDistance));
    this.best = {
      score: Math.max(this.best.score, finalScore),
      swarm: Math.max(this.best.swarm, this.maxSwarm),
      victories: this.best.victories + Number(victory),
    };
    saveBest(this.best);
    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x01040c, 0).setDepth(150).setInteractive();
    const card = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(151).setScale(0.75).setAlpha(0);
    const panel = this.add.rectangle(0, 0, 330, 390, 0x06101f, 0.97).setStrokeStyle(3, victory ? cyan : magenta, 1);
    const title = this.add.text(0, -145, headline, { fontFamily: 'Arial Black', fontSize: '25px', color: victory ? '#baffff' : '#ff9ab7', stroke: '#02050c', strokeThickness: 6 }).setOrigin(0.5);
    const score = this.add.text(0, -84, finalScore.toLocaleString(), { fontFamily: 'Arial Black', fontSize: '46px', color: '#ffffff' }).setOrigin(0.5);
    const scoreLabel = this.add.text(0, -50, 'FORGE SCORE', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '11px', color: '#6fa2ba' }).setOrigin(0.5).setLetterSpacing(2);
    const stats = this.add.text(0, 20, `MAX SWARM   ${this.maxSwarm}\nLASER DRONES   ${this.swarm.laser}\nENEMIES MELTED   ${this.kills}\nBEST SCORE   ${this.best.score.toLocaleString()}`, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#c6eaf4', align: 'center', lineSpacing: 11 }).setOrigin(0.5);
    const button = this.add.rectangle(0, 135, 248, 62, victory ? 0x0bbcc9 : 0xd32158, 1).setStrokeStyle(2, 0xffffff, 0.7).setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(0, 135, 'RUN AGAIN', { fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setLetterSpacing(2);
    card.add([panel, title, score, scoreLabel, stats, button, buttonText]);
    this.tweens.add({ targets: shade, fillAlpha: 0.86, duration: 260 });
    this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 420, ease: 'Back.Out' });
    const restart = () => { this.audio.confirm(); this.scene.restart(); };
    button.on('pointerdown', restart);
    shade.on('pointerdown', (pointer: Phaser.Input.Pointer) => { if (pointer.y > GAME_HEIGHT / 2 + 95) restart(); });
  }
}
