import { BALANCE } from '../config/balance';

export interface FormationPoint { x: number; y: number; scale: number }

export function calculateFormation(count: number): FormationPoint[] {
  const visible = Math.min(Math.max(0, count), BALANCE.renderedDroneCap);
  if (visible === 0) return [];
  const columns = Math.min(BALANCE.maxColumns, Math.max(3, Math.ceil(Math.sqrt(visible * 1.7))));
  const rows = Math.ceil(visible / columns);
  const points: FormationPoint[] = [];
  for (let row = 0; row < rows; row += 1) {
    const rowCount = Math.min(columns, visible - row * columns);
    const offset = (rowCount - 1) * BALANCE.formationSpacingX * 0.5;
    for (let col = 0; col < rowCount; col += 1) {
      points.push({
        x: col * BALANCE.formationSpacingX - offset,
        y: row * BALANCE.formationSpacingY,
        scale: count > BALANCE.renderedDroneCap ? 0.9 : 1,
      });
    }
  }
  return points;
}
