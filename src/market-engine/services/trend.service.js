import { calculateAverage } from '../calculators/historical-average.calculator.js';
import { calculatePriceChange } from '../calculators/price-change.calculator.js';
import {
  MARKET_RULES,
} from '../config/scoring.config.js';
import { clamp } from '../utils/clamp.util.js';
import { roundTo } from '../utils/rounding.util.js';

export function calculateTrendScore(observations) {
  if (!Array.isArray(observations) || observations.length < 4) {
    return null;
  }

  const midpoint = Math.floor(observations.length / 2);

  const previousPeriod = observations.slice(0, midpoint);
  const recentPeriod = observations.slice(midpoint);

  const previousAverage = calculateAverage(
    previousPeriod.map((observation) => observation.modalPrice),
  );

  const recentAverage = calculateAverage(
    recentPeriod.map((observation) => observation.modalPrice),
  );

  if (previousAverage === null || recentAverage === null) {
    return null;
  }

  const priceChange = calculatePriceChange(
    previousAverage,
    recentAverage,
  );

  if (priceChange === null) {
    return null;
  }

  const score =
    50 +
    priceChange * MARKET_RULES.trendMultiplier;

  return roundTo(clamp(score), 2);
}