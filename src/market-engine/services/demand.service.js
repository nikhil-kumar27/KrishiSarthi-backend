import { calculateSaleRatio } from '../calculators/sale-ratio.calculator.js';
import { clamp } from '../utils/clamp.util.js';
import { roundTo } from '../utils/rounding.util.js';

export function calculateDemandScore(currentObservation) {
  const saleRatio = calculateSaleRatio(
    currentObservation.arrivalQuantity,
    currentObservation.soldQuantity,
  );

  if (saleRatio === null) {
    return null;
  }

  const score = saleRatio * 100;

  return roundTo(clamp(score), 2);
}