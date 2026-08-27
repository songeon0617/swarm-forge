export function xpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(10 + safeLevel * 7 + Math.pow(safeLevel, 1.34) * 3);
}
