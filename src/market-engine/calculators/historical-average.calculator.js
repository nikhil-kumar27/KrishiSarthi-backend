export function calculateAverage(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const validValues = values.filter(Number.isFinite);

  if (validValues.length === 0) {
    return null;
  }

  const sum = validValues.reduce((total, value) => total + value, 0);

  return sum / validValues.length;
}