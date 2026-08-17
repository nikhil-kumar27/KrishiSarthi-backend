export function calculatePriceChange(
  previousAveragePrice,
  recentAveragePrice,
) {
  if (
    !Number.isFinite(previousAveragePrice) ||
    !Number.isFinite(recentAveragePrice) ||
    previousAveragePrice <= 0
  ) {
    return null;
  }

  return (
    (recentAveragePrice - previousAveragePrice) /
    previousAveragePrice
  );
}