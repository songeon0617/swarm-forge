export type SurvivalEnemyType = 'grunt' | 'runner' | 'tank';
export type WeaponId = 'autoBolt' | 'orbitBlade' | 'shockPulse';

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
}
