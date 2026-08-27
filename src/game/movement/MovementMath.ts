export function approach(current: number, target: number, maxChange: number): number {
  if (current < target) return Math.min(current + maxChange, target);
  if (current > target) return Math.max(current - maxChange, target);
  return target;
}

export function smoothResponse(current: number, target: number, responsePerSecond: number, deltaMs: number): number {
  const blend = 1 - Math.exp((-responsePerSecond * deltaMs) / 1000);
  return current + (target - current) * blend;
}
