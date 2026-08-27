export class SynthAudio {
  private context?: AudioContext;
  private enabled = true;

  get isEnabled(): boolean { return this.enabled; }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  private tone(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine', slide = 0): void {
    if (!this.enabled) return;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  shoot(): void { this.tone(520, 0.035, 0.025, 'square', -170); }
  laser(): void { this.tone(880, 0.09, 0.035, 'sawtooth', -540); }
  capsule(): void { this.tone(180, 0.15, 0.07, 'triangle', 500); }
  gain(): void { this.tone(620, 0.16, 0.06, 'sine', 420); }
  gate(): void { this.tone(340, 0.22, 0.075, 'square', 650); }
  upgrade(): void { this.tone(420, 0.34, 0.08, 'sawtooth', 920); }
  destroy(): void { this.tone(140, 0.12, 0.055, 'square', -65); }
  hurt(): void { this.tone(110, 0.13, 0.065, 'sawtooth', -45); }
  bossDeath(): void { [0, 110, 230].forEach((delay, i) => setTimeout(() => this.tone(180 + i * 150, 0.4, 0.08, 'sawtooth', 600), delay)); }
  confirm(): void { this.tone(700, 0.08, 0.05, 'sine', 200); }
}
