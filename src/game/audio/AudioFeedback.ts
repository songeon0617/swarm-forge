import Phaser from 'phaser';

type Tone = 'shoot' | 'turret' | 'hit' | 'explosion' | 'levelUp' | 'death' | 'victory';

export class AudioFeedback {
  private context?: AudioContext;
  private lastPlayedAt: Partial<Record<Tone, number>> = {};

  private readonly unlock = (): void => {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
  };

  constructor(private readonly scene: Phaser.Scene) {
    scene.input.on('pointerdown', this.unlock);
    window.addEventListener('keydown', this.unlock, { passive: true });
  }

  shoot(): void {
    if (!this.canPlay('shoot', 70)) return;
    this.tone(680, 250, 0.045, 0.025, 'triangle');
  }

  turret(): void {
    if (!this.canPlay('turret', 90)) return;
    this.tone(420, 170, 0.055, 0.022, 'square');
  }

  hit(): void {
    if (!this.canPlay('hit', 55)) return;
    this.tone(150, 70, 0.04, 0.018, 'sine');
  }

  explosion(): void {
    if (!this.canPlay('explosion', 100)) return;
    this.tone(115, 38, 0.16, 0.045, 'sawtooth');
  }

  levelUp(): void {
    this.tone(420, 620, 0.1, 0.035, 'triangle');
    this.tone(620, 940, 0.13, 0.03, 'triangle', 0.08);
  }

  death(): void {
    this.tone(220, 55, 0.48, 0.055, 'sawtooth');
  }

  victory(): void {
    this.tone(390, 580, 0.14, 0.035, 'triangle');
    this.tone(580, 780, 0.16, 0.035, 'triangle', 0.12);
    this.tone(780, 1040, 0.24, 0.03, 'triangle', 0.25);
  }

  private canPlay(tone: Tone, minimumGapMs: number): boolean {
    if (!this.context || this.context.state !== 'running') return false;
    const now = performance.now();
    if (now - (this.lastPlayedAt[tone] ?? -Infinity) < minimumGapMs) return false;
    this.lastPlayedAt[tone] = now;
    return true;
  }

  private tone(
    startFrequency: number,
    endFrequency: number,
    durationSeconds: number,
    volume: number,
    type: OscillatorType,
    delaySeconds = 0,
  ): void {
    if (!this.context || this.context.state !== 'running') return;
    const startAt = this.context.currentTime + delaySeconds;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + durationSeconds);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSeconds);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + durationSeconds);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.unlock);
    window.removeEventListener('keydown', this.unlock);
    if (this.context) void this.context.close();
    this.context = undefined;
  }
}
