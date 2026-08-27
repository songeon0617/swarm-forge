export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;
export const PLAYER_Y = 675;
export const TRACK_LEFT = 35;
export const TRACK_RIGHT = 355;

export const BALANCE = {
  startRifles: 4,
  courseSpeed: 64,
  renderedDroneCap: 48,
  targetRunSeconds: 72,
  attackRange: 330,
  rifleDamage: 1.15,
  laserDamage: 4.8,
  rifleFireMs: 315,
  laserFireMs: 760,
  enemyContactDps: 0.32,
  formationSpacingX: 22,
  formationSpacingY: 19,
  maxColumns: 9,
} as const;

export const ENEMY_STATS = {
  grunt: { hp: 10, damage: 1, radius: 13 },
  heavy: { hp: 32, damage: 3, radius: 20 },
  turret: { hp: 22, damage: 2, radius: 17 },
  boss: { hp: 1600, damage: 5, radius: 55 },
} as const;
