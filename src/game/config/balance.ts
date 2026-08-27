export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const SURVIVAL_LAYOUT = {
  playfield: { left: 12, top: 78, right: 12, bottom: 48 },
  spawnPadding: 14,
  packOffset: 18,
} as const;

export const SURVIVAL_WAVE_PHASES = [
  { startsAt: 0, spawnIntervalMs: 820, packMin: 1, packMax: 2, runnerChance: 0, tankChance: 0 },
  { startsAt: 20, spawnIntervalMs: 650, packMin: 2, packMax: 3, runnerChance: 0.34, tankChance: 0 },
  { startsAt: 45, spawnIntervalMs: 510, packMin: 3, packMax: 4, runnerChance: 0.3, tankChance: 0.14 },
  { startsAt: 70, spawnIntervalMs: 390, packMin: 4, packMax: 6, runnerChance: 0.38, tankChance: 0.2 },
] as const;

export const SURVIVAL_BALANCE = {
  runSeconds: 90,
  player: {
    maxHp: 100,
    speed: 220,
    acceleration: 2600,
    deceleration: 3400,
    turnSpeed: 12,
    invulnerabilityMs: 550,
    pickupRadius: 58,
    touchDeadZone: 12,
  },
  movement: { maxDeltaMs: 50, enemyTurnResponse: 9 },
  feedback: {
    spawnDurationMs: 180,
    spawnStartAlpha: 0.35,
    spawnStartScale: 0.82,
    enemyHitFlashMs: 55,
    enemyHitKnockbackSpeed: 72,
    enemyHitKnockbackMs: 80,
    enemyDeathDurationMs: 190,
  },
  autoBolt: { damage: 12, cooldownMs: 520, speed: 520, projectileCount: 1 },
  orbitBlade: { damage: 9, count: 1, rotationSpeed: 2.1, radius: 58, hitCooldownMs: 380 },
  shockPulse: { damage: 18, cooldownMs: 3600, radius: 105 },
  autoTurret: { damage: 10, cooldownMs: 620, projectileSpeed: 460, followDistance: 42 },
  mine: { damage: 34, cooldownMs: 4800, radius: 72, triggerRadius: 25, maxActive: 3 },
  spawn: { maxEnemies: 110 },
  difficulty: {
    hpGrowth: 1.35,
    hpExponent: 1.35,
    speedGrowth: 0.18,
  },
  experience: {
    attractionRadiusMultiplier: 2.4,
    innerPullPerMs: 0.022,
    outerPullPerMs: 0.009,
    collectDistance: 18,
  },
  upgrades: {
    defaultMaxLevel: 5,
    boltCountMaxLevel: 3,
    boltDamageMultiplier: 1.25,
    boltCooldownMultiplier: 0.8,
    bladeSpeedMultiplier: 1.15,
    pulseRadiusMultiplier: 1.2,
    pulseDamageMultiplier: 1.3,
    moveSpeedMultiplier: 1.1,
    maxHpRatio: 0.2,
    pickupRadiusMultiplier: 1.25,
    turretDamageMultiplier: 1.3,
    turretCooldownMultiplier: 0.8,
    mineDamageMultiplier: 1.35,
    mineCooldownMultiplier: 0.8,
  },
} as const;

export const SURVIVAL_ENEMIES = {
  grunt: { hp: 18, speed: 64, damage: 10, xp: 5, radius: 14, unlockAt: 0 },
  runner: { hp: 14, speed: 108, damage: 8, xp: 7, radius: 11, unlockAt: 20 },
  tank: { hp: 72, speed: 40, damage: 18, xp: 18, radius: 23, unlockAt: 45 },
} as const;
