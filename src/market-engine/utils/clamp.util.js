export function clamp(value, minimum = 0, maximum = 100) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.min(Math.max(value, minimum), maximum);
}