import type { Player } from '../entities/Player';
import { SURVIVAL_BALANCE } from '../config/balance';
import type { UpgradeLevels, WeaponStats } from '../survivalTypes';

export interface UpgradeChoice {
  id: keyof UpgradeLevels;
  title: string;
  description: string;
  maxLevel: number;
}

export const UPGRADE_POOL: UpgradeChoice[] = [
  {
    id: 'boltDamage',
    title: 'BOLT OVERCHARGE',
    description: 'Auto Bolt damage +25%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'boltSpeed',
    title: 'RAPID CAPACITOR',
    description: 'Auto Bolt attack speed +20%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'boltCount',
    title: 'TWIN LINK',
    description: 'Auto Bolt projectile +1',
    maxLevel: SURVIVAL_BALANCE.upgrades.boltCountMaxLevel,
  },
  {
    id: 'bladeCount',
    title: 'EXTRA BLADE',
    description: 'Orbit Blade count +1',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'bladeSpeed',
    title: 'ORBIT DRIVE',
    description: 'Blade rotation speed +15%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'pulseRadius',
    title: 'WIDE SHOCK',
    description: 'Shock Pulse radius +20%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'pulseDamage',
    title: 'PULSE AMPLIFIER',
    description: 'Shock Pulse damage +30%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'moveSpeed',
    title: 'VECTOR THRUST',
    description: 'Movement speed +10%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'maxHp',
    title: 'REINFORCED CORE',
    description: 'Max HP +20% and heal',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'pickupRadius',
    title: 'MAGNETIC FIELD',
    description: 'XP pickup radius +25%',
    maxLevel: SURVIVAL_BALANCE.upgrades.defaultMaxLevel,
  },
  {
    id: 'turretUnlock',
    title: 'AUTO TURRET',
    description: 'Deploy a companion auto turret',
    maxLevel: 1,
  },
  {
    id: 'turretDamage',
    title: 'TURRET CALIBER',
    description: 'Turret damage +30%',
    maxLevel: 3,
  },
  {
    id: 'turretSpeed',
    title: 'TURRET CYCLER',
    description: 'Turret attack speed +20%',
    maxLevel: 3,
  },
  {
    id: 'mineUnlock',
    title: 'BLAST MINE',
    description: 'Auto-deploy contact mines',
    maxLevel: 1,
  },
  {
    id: 'mineDamage',
    title: 'HEAVY CHARGE',
    description: 'Mine damage +35%',
    maxLevel: 3,
  },
  {
    id: 'mineCooldown',
    title: 'MINE PRINTER',
    description: 'Mine deploy speed +20%',
    maxLevel: 3,
  },
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
    turretUnlock: 0,
    turretDamage: 0,
    turretSpeed: 0,
    mineUnlock: 0,
    mineDamage: 0,
    mineCooldown: 0,
  };
}

function isUpgradeAvailable(upgrade: UpgradeChoice, levels: UpgradeLevels): boolean {
  if (levels[upgrade.id] >= upgrade.maxLevel) return false;
  if ((upgrade.id === 'turretDamage' || upgrade.id === 'turretSpeed') && levels.turretUnlock === 0) return false;
  if ((upgrade.id === 'mineDamage' || upgrade.id === 'mineCooldown') && levels.mineUnlock === 0) return false;
  return true;
}

export function selectUpgradeChoices(
  levels: UpgradeLevels,
  random: () => number = Math.random,
  count = 3,
): UpgradeChoice[] {
  const candidates = UPGRADE_POOL.filter((upgrade) => isUpgradeAvailable(upgrade, levels));
  const result: UpgradeChoice[] = [];
  const remaining = [...candidates];
  const lockedDefenseChoices = remaining.filter(
    (upgrade) =>
      (upgrade.id === 'turretUnlock' && levels.turretUnlock === 0) ||
      (upgrade.id === 'mineUnlock' && levels.mineUnlock === 0),
  );
  if (count > 0 && lockedDefenseChoices.length > 0) {
    const defenseIndex = Math.min(lockedDefenseChoices.length - 1, Math.floor(random() * lockedDefenseChoices.length));
    const defense = lockedDefenseChoices[defenseIndex];
    result.push(defense);
    remaining.splice(remaining.indexOf(defense), 1);
  }
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
      weapons.boltDamage *= SURVIVAL_BALANCE.upgrades.boltDamageMultiplier;
      break;
    case 'boltSpeed':
      weapons.boltCooldownMs *= SURVIVAL_BALANCE.upgrades.boltCooldownMultiplier;
      break;
    case 'boltCount':
      weapons.boltCount += 1;
      break;
    case 'bladeCount':
      weapons.bladeCount += 1;
      break;
    case 'bladeSpeed':
      weapons.bladeSpeed *= SURVIVAL_BALANCE.upgrades.bladeSpeedMultiplier;
      break;
    case 'pulseRadius':
      weapons.pulseRadius *= SURVIVAL_BALANCE.upgrades.pulseRadiusMultiplier;
      break;
    case 'pulseDamage':
      weapons.pulseDamage *= SURVIVAL_BALANCE.upgrades.pulseDamageMultiplier;
      break;
    case 'moveSpeed':
      player.stats.moveSpeed *= SURVIVAL_BALANCE.upgrades.moveSpeedMultiplier;
      break;
    case 'maxHp':
      player.increaseMaxHp(SURVIVAL_BALANCE.upgrades.maxHpRatio);
      break;
    case 'pickupRadius':
      player.stats.pickupRadius *= SURVIVAL_BALANCE.upgrades.pickupRadiusMultiplier;
      break;
    case 'turretUnlock':
      weapons.turretUnlocked = true;
      break;
    case 'turretDamage':
      weapons.turretDamage *= SURVIVAL_BALANCE.upgrades.turretDamageMultiplier;
      break;
    case 'turretSpeed':
      weapons.turretCooldownMs *= SURVIVAL_BALANCE.upgrades.turretCooldownMultiplier;
      break;
    case 'mineUnlock':
      weapons.mineUnlocked = true;
      break;
    case 'mineDamage':
      weapons.mineDamage *= SURVIVAL_BALANCE.upgrades.mineDamageMultiplier;
      break;
    case 'mineCooldown':
      weapons.mineCooldownMs *= SURVIVAL_BALANCE.upgrades.mineCooldownMultiplier;
      break;
  }
}
