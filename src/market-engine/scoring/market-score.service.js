import {
  MARKET_WEIGHTS,
} from '../config/scoring.config.js';
import { clamp } from '../utils/clamp.util.js';
import { roundTo } from '../utils/rounding.util.js';

function validateWeights() {
  const total =
    MARKET_WEIGHTS.demand +
    MARKET_WEIGHTS.scarcity +
    MARKET_WEIGHTS.trend;

  if (Math.abs(total - 1) > Number.EPSILON) {
    throw new Error(
      'Market score weights must sum to 1.',
    );
  }
}

export function calculateMarketScore({
  demandScore,
  scarcityScore,
  trendScore,
}) {
  validateWeights();

  if (
    !Number.isFinite(demandScore) ||
    !Number.isFinite(scarcityScore) ||
    !Number.isFinite(trendScore)
  ) {
    return null;
  }

  const score =
    demandScore * MARKET_WEIGHTS.demand +
    scarcityScore * MARKET_WEIGHTS.scarcity +
    trendScore * MARKET_WEIGHTS.trend;

  return roundTo(clamp(score), 2);
}