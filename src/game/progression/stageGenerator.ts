import { ENEMY_STATS } from '../config/balance';
import { makeMeaningfulGatePair } from '../gates/gateLogic';
import type { CourseEvent, EnemySpec, EnemyType } from '../types';
import { makeUpgradePair } from '../upgrades/upgradeLogic';
import { createSeededRandom } from './seededRandom';

const lanes = [86, 151, 239, 304];

function enemy(id: string, type: EnemyType, x: number, distance: number, hpScale = 1): EnemySpec {
  const stats = ENEMY_STATS[type];
  const hp = Math.round(stats.hp * hpScale);
  return { id, type, x, distance, hp, maxHp: hp, damage: stats.damage, radius: stats.radius };
}

export function generateStage(seed: number): CourseEvent[] {
  const random = createSeededRandom(seed);
  const events: CourseEvent[] = [];
  let estimatedCount = 4;
  let id = 0;
  const addWave = (distance: number, types: EnemyType[], scale: number) => {
    const start = Math.floor(random() * lanes.length);
    events.push({
      id: `wave-${id++}`,
      kind: 'enemyWave',
      distance,
      enemies: types.map((type, index) => enemy(`enemy-${id++}`, type, lanes[(start + index) % lanes.length], distance + index * 26, scale)),
    });
  };
  const addGate = (distance: number, intensity: number) => {
    const [left, right] = makeMeaningfulGatePair(estimatedCount, intensity, random());
    events.push({ id: `gate-${id++}`, kind: 'gate', distance, left, right });
    const leftGain = left.operation === 'add' ? left.value : estimatedCount * (left.value - 1);
    const rightGain = right.operation === 'add' ? right.value : estimatedCount * (right.value - 1);
    estimatedCount += Math.round((leftGain + rightGain) / 2);
  };

  events.push({ id: `capsule-${id++}`, kind: 'capsule', x: 195, distance: 155, amount: 5, hp: 8 });
  estimatedCount += 5;
  addGate(390, 0.12);
  addWave(650, ['grunt', 'grunt', 'grunt'], 0.8);
  events.push({ id: `capsule-${id++}`, kind: 'capsule', x: random() < 0.5 ? 105 : 285, distance: 930, amount: 7, hp: 12 });
  estimatedCount += 7;
  events.push({ id: `hazard-${id++}`, kind: 'hazard', x: random() < 0.5 ? 94 : 296, distance: 1120, width: 112, lossRatio: 0.23 });
  addGate(1360, 0.34);
  addWave(1630, ['grunt', 'heavy', 'grunt', 'turret'], 0.9);
  const upgrades = makeUpgradePair(estimatedCount, 0.5);
  events.push({ id: `upgrade-${id++}`, kind: 'upgrade', distance: 1960, left: upgrades[0], right: upgrades[1] });
  estimatedCount += upgrades[0].kind === 'add' ? Math.round(upgrades[0].amount / 2) : 0;
  events.push({ id: `capsule-${id++}`, kind: 'capsule', x: random() < 0.5 ? 115 : 275, distance: 2240, amount: 10, hp: 15 });
  estimatedCount += 10;
  addGate(2500, 0.64);
  addWave(2800, ['heavy', 'grunt', 'turret', 'grunt', 'heavy'], 1.05);
  events.push({ id: `hazard-${id++}`, kind: 'hazard', x: random() < 0.5 ? 118 : 272, distance: 3120, width: 126, lossRatio: 0.28 });
  addGate(3370, 0.82);
  addWave(3660, ['heavy', 'turret', 'heavy', 'grunt', 'grunt', 'turret'], 1.18);
  events.push({ id: `capsule-${id++}`, kind: 'capsule', x: 195, distance: 3990, amount: 12, hp: 20 });
  estimatedCount += 12;
  const finalUpgrades = makeUpgradePair(estimatedCount, 0.9);
  events.push({ id: `upgrade-${id++}`, kind: 'upgrade', distance: 4240, left: finalUpgrades[0], right: finalUpgrades[1] });
  events.push({ id: `boss-${id++}`, kind: 'boss', distance: 4680, enemy: enemy(`enemy-${id++}`, 'boss', 195, 4680, 1) });
  return events.sort((a, b) => a.distance - b.distance);
}
