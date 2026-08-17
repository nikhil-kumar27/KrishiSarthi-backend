export function roundTo(value, decimalPlaces = 2) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** decimalPlaces;

  return Math.round((value + Number.EPSILON) * factor) / factor;
}