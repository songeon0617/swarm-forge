import { describe, expect, it } from 'vitest';
import { SwarmState } from './SwarmState';

describe('SwarmState', () => {
  it('tracks growth, composition, and proportional multiplication', () => {
    const swarm = new SwarmState({ rifle: 4, laser: 0 });
    swarm.add('rifle', 6);
    swarm.convertToLaser(0.3);
    swarm.multiply(2);
    expect(swarm.snapshot()).toEqual({ rifle: 14, laser: 6 });
  });

  it('removes rifles before laser drones and never goes negative', () => {
    const swarm = new SwarmState({ rifle: 3, laser: 2 });
    expect(swarm.lose(4)).toBe(4);
    expect(swarm.snapshot()).toEqual({ rifle: 0, laser: 1 });
    expect(swarm.lose(99)).toBe(1);
    expect(swarm.total).toBe(0);
  });
});
