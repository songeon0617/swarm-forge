export type SurvivalEnemyType = 'grunt' | 'runner' | 'tank';

export interface PlayerStats {
  maxHp: number;
  moveSpeed: number;
  pickupRadius: number;
}

export interface WeaponStats {
  boltDamage: number;
  boltCooldownMs: number;
  boltSpeed: number;
  boltCount: number;
  bladeDamage: number;
  bladeCount: number;
  bladeSpeed: number;
  bladeRadius: number;
  pulseDamage: number;
  pulseCooldownMs: number;
  pulseRadius: number;
  turretUnlocked: boolean;
  turretDamage: number;
  turretCooldownMs: number;
  turretProjectileSpeed: number;
  mineUnlocked: boolean;
  mineDamage: number;
  mineCooldownMs: number;
  mineRadius: number;
}

export interface UpgradeLevels {
  boltDamage: number;
  boltSpeed: number;
  boltCount: number;
  bladeCount: number;
  bladeSpeed: number;
  pulseRadius: number;
  pulseDamage: number;
  moveSpeed: number;
  maxHp: number;
  pickupRadius: number;
  turretUnlock: number;
  turretDamage: number;
  turretSpeed: number;
  mineUnlock: number;
  mineDamage: number;
  mineCooldown: number;
}
