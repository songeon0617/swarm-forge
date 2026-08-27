export type DroneType = 'rifle' | 'laser';
export type EnemyType = 'grunt' | 'heavy' | 'turret' | 'boss';

export interface SwarmSnapshot {
  rifle: number;
  laser: number;
}

export interface GateOption {
  operation: 'add' | 'multiply';
  value: number;
  label: string;
}

export type UpgradeOption =
  | { kind: 'add'; amount: number; label: string; detail: string }
  | { kind: 'convert'; ratio: number; label: string; detail: string };

export interface EnemySpec {
  id: string;
  type: EnemyType;
  x: number;
  distance: number;
  hp: number;
  maxHp: number;
  damage: number;
  radius: number;
}

export type CourseEvent =
  | { id: string; kind: 'capsule'; x: number; distance: number; amount: number; hp: number }
  | { id: string; kind: 'gate'; distance: number; left: GateOption; right: GateOption }
  | { id: string; kind: 'upgrade'; distance: number; left: UpgradeOption; right: UpgradeOption }
  | { id: string; kind: 'hazard'; x: number; distance: number; width: number; lossRatio: number }
  | { id: string; kind: 'enemyWave'; distance: number; enemies: EnemySpec[] }
  | { id: string; kind: 'boss'; distance: number; enemy: EnemySpec };
