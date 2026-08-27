import type { Player } from '../entities/Player';
import type { UpgradeLevels, WeaponStats } from '../survivalTypes';

export interface UpgradeChoice {
  id: keyof UpgradeLevels;
  title: string;
  description: string;
  maxLevel: number;
}

export const UPGRADE_POOL: UpgradeChoice[] = [
  { id: 'boltDamage', title: 'BOLT OVERCHARGE', description: 'Auto Bolt damage +25%', maxLevel: 5 },
  { id: 'boltSpeed', title: 'RAPID CAPACITOR', description: 'Auto Bolt attack speed +20%', maxLevel: 5 },
  { id: 'boltCount', title: 'TWIN LINK', description: 'Auto Bolt projectile +1', maxLevel: 3 },
  { id: 'bladeCount', title: 'EXTRA BLADE', description: 'Orbit Blade count +1', maxLevel: 5 },
  { id: 'bladeSpeed', title: 'ORBIT DRIVE', description: 'Blade rotation speed +15%', maxLevel: 5 },
  { id: 'pulseRadius', title: 'WIDE SHOCK', description: 'Shock Pulse radius +20%', maxLevel: 5 },
  { id: 'pulseDamage', title: 'PULSE AMPLIFIER', description: 'Shock Pulse damage +30%', maxLevel: 5 },
  { id: 'moveSpeed', title: 'VECTOR THRUST', description: 'Movement speed +10%', maxLevel: 5 },
  { id: 'maxHp', title: 'REINFORCED CORE', description: 'Max HP +20% and heal', maxLevel: 5 },
  { id: 'pickupRadius', title: 'MAGNETIC FIELD', description: 'XP pickup radius +25%', maxLevel: 5 },
];

export function createUpgradeLevels(): UpgradeLevels {
  return {
    boltDamage: 0,
    boltSpeed: 0,
    boltCount: 0,
    bladeCount: 0,
    bladeSpeed: 0,
    pulseRadius: 0,
    pulseDamage: 0,
    moveSpeed: 0,
    maxHp: 0,
    pickupRadius: 0,
  };
}

export function selectUpgradeChoices(
  levels: UpgradeLevels,
  random: () => number = Math.random,
  count = 3,
): UpgradeChoice[] {
  const candidates = UPGRADE_POOL.filter((upgrade) => levels[upgrade.id] < upgrade.maxLevel);
  const result: UpgradeChoice[] = [];
  const remaining = [...candidates];
  while (result.length < count && remaining.length > 0) {
    const index = Math.min(remaining.length - 1, Math.floor(random() * remaining.length));
    result.push(remaining.splice(index, 1)[0]);
  }
  return result;
}

export function applySurvivalUpgrade(
  choice: UpgradeChoice,
  levels: UpgradeLevels,
  player: Player,
  weapons: WeaponStats,
): void {
  if (levels[choice.id] >= choice.maxLevel) return;
  levels[choice.id] += 1;
  switch (choice.id) {
    case 'boltDamage':
      weapons.boltDamage *= 1.25;
      break;
    case 'boltSpeed':
      weapons.boltCooldownMs *= 0.8;
      break;
    case 'boltCount':
      weapons.boltCount += 1;
      break;
    case 'bladeCount':
      weapons.bladeCount += 1;
      break;
    case 'bladeSpeed':
      weapons.bladeSpeed *= 1.15;
      break;
    case 'pulseRadius':
      weapons.pulseRadius *= 1.2;
      break;
    case 'pulseDamage':
      weapons.pulseDamage *= 1.3;
      break;
    case 'moveSpeed':
      player.stats.moveSpeed *= 1.1;
      break;
    case 'maxHp':
      player.increaseMaxHp(0.2);
      break;
    case 'pickupRadius':
      player.stats.pickupRadius *= 1.25;
      break;
  }
}
