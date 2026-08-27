import type { GateOption, SwarmSnapshot } from '../types';

export function applyGate(snapshot: SwarmSnapshot, gate: GateOption): SwarmSnapshot {
  if (gate.operation === 'add') return { ...snapshot, rifle: snapshot.rifle + gate.value };
  return { rifle: snapshot.rifle * gate.value, laser: snapshot.laser * gate.value };
}

export function gateGain(current: number, gate: GateOption): number {
  return gate.operation === 'add' ? gate.value : current * (gate.value - 1);
}

export function makeMeaningfulGatePair(current: number, intensity: number, roll: number): [GateOption, GateOption] {
  const factor = current < 9 || intensity < 0.55 ? 2 : roll > 0.82 ? 3 : 2;
  const multiplyGain = Math.max(1, current * (factor - 1));
  const tension = 0.82 + (roll % 0.18);
  const add = Math.max(4, Math.round(multiplyGain * tension));
  const addGate: GateOption = { operation: 'add', value: add, label: `+${add}` };
  const multiplyGate: GateOption = { operation: 'multiply', value: factor, label: `×${factor}` };
  return roll < 0.5 ? [addGate, multiplyGate] : [multiplyGate, addGate];
}
