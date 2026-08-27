import type { DroneType, SwarmSnapshot } from '../types';

export class SwarmState {
  private counts: SwarmSnapshot;

  constructor(initial: SwarmSnapshot = { rifle: 4, laser: 0 }) {
    this.counts = { rifle: Math.max(0, initial.rifle), laser: Math.max(0, initial.laser) };
  }

  get total(): number {
    return this.counts.rifle + this.counts.laser;
  }

  get rifle(): number { return this.counts.rifle; }
  get laser(): number { return this.counts.laser; }
  snapshot(): SwarmSnapshot { return { ...this.counts }; }

  add(type: DroneType, amount: number): number {
    const safeAmount = Math.max(0, Math.floor(amount));
    this.counts[type] += safeAmount;
    return safeAmount;
  }

  multiply(factor: number): number {
    const before = this.total;
    const safeFactor = Math.max(1, Math.floor(factor));
    this.counts.rifle *= safeFactor;
    this.counts.laser *= safeFactor;
    return this.total - before;
  }

  convertToLaser(ratio: number): number {
    const converted = Math.min(this.counts.rifle, Math.max(1, Math.round(this.total * ratio)));
    this.counts.rifle -= converted;
    this.counts.laser += converted;
    return converted;
  }

  lose(amount: number): number {
    let remaining = Math.min(this.total, Math.max(0, Math.ceil(amount)));
    const removed = remaining;
    const rifleLoss = Math.min(this.counts.rifle, remaining);
    this.counts.rifle -= rifleLoss;
    remaining -= rifleLoss;
    this.counts.laser = Math.max(0, this.counts.laser - remaining);
    return removed;
  }
}
