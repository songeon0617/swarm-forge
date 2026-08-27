export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const SURVIVAL_LAYOUT = {
  playfield: { left: 12, top: 78, right: 12, bottom: 12 },
  spawnPadding: 30,
  packOffset: 24,
} as const;

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
  },
  autoBolt: { damage: 12, cooldownMs: 520, speed: 520, projectileCount: 1 },
  orbitBlade: { damage: 9, count: 1, rotationSpeed: 2.1, radius: 58, hitCooldownMs: 380 },
  shockPulse: { damage: 18, cooldownMs: 3600, radius: 105 },
  spawn: { startIntervalMs: 920, endIntervalMs: 210, maxEnemies: 125 },
  difficulty: {
    hpGrowth: 1.5,
    hpExponent: 1.35,
    speedGrowth: 0.22,
    runnerRollThreshold: 0.48,
    tankRollThreshold: 0.76,
    packTwoAt: 48,
    packThreeAt: 75,
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
  },
} as const;

export const SURVIVAL_ENEMIES = {
  grunt: { hp: 18, speed: 52, damage: 10, xp: 5, radius: 14, unlockAt: 0 },
  runner: { hp: 14, speed: 102, damage: 8, xp: 7, radius: 11, unlockAt: 28 },
  tank: { hp: 78, speed: 36, damage: 18, xp: 18, radius: 23, unlockAt: 58 },
} as const;
