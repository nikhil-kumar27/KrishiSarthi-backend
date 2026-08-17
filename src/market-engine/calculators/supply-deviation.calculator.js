export function calculateSupplyDeviation(
  currentArrival,
  historicalAverageArrival,
) {
  if (
    !Number.isFinite(currentArrival) ||
    !Number.isFinite(historicalAverageArrival) ||
    historicalAverageArrival <= 0
  ) {
    return null;
  }

  return (
    (currentArrival - historicalAverageArrival) /
    historicalAverageArrival
  );
}