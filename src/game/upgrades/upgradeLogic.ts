import type { SwarmSnapshot, UpgradeOption } from '../types';

export function applyUpgrade(snapshot: SwarmSnapshot, upgrade: UpgradeOption): SwarmSnapshot {
  if (upgrade.kind === 'add') return { ...snapshot, rifle: snapshot.rifle + upgrade.amount };
  const converted = Math.min(snapshot.rifle, Math.max(1, Math.round((snapshot.rifle + snapshot.laser) * upgrade.ratio)));
  return { rifle: snapshot.rifle - converted, laser: snapshot.laser + converted };
}

export function makeUpgradePair(current: number, intensity: number): [UpgradeOption, UpgradeOption] {
  const amount = Math.max(7, Math.round(7 + current * (0.15 + intensity * 0.08)));
  const ratio = intensity > 0.62 ? 0.3 : 0.25;
  return [
    { kind: 'add', amount, label: `+${amount} RIFLE`, detail: 'MORE FIRE' },
    { kind: 'convert', ratio, label: `${Math.round(ratio * 100)}% LASER`, detail: 'ARMOR BREAK' },
  ];
}
