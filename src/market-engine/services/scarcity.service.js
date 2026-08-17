import { calculateAverage } from '../calculators/historical-average.calculator.js';
import { calculateSupplyDeviation } from '../calculators/supply-deviation.calculator.js';
import {
  MARKET_RULES,
} from '../config/scoring.config.js';
import { clamp } from '../utils/clamp.util.js';
import { roundTo } from '../utils/rounding.util.js';

export function calculateScarcityScore(observations) {
  if (!Array.isArray(observations) || observations.length < 4) {
    return null;
  }

  const historicalObservations = observations.slice(0, -1);
  const currentObservation = observations[observations.length - 1];

  const historicalAverage = calculateAverage(
    historicalObservations.map(
      (observation) => observation.arrivalQuantity,
    ),
  );

  if (historicalAverage === null) {
    return null;
  }

  const supplyDeviation = calculateSupplyDeviation(
    currentObservation.arrivalQuantity,
    historicalAverage,
  );

  if (supplyDeviation === null) {
    return null;
  }

  const score =
    50 -
    supplyDeviation * MARKET_RULES.scarcityMultiplier;

  return roundTo(clamp(score), 2);
}