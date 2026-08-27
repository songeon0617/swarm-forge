export function xpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(14 + safeLevel * 9 + Math.pow(safeLevel, 1.38) * 3.2);
}
