import { isValidDate } from '../utils/date.util.js';

export function validateObservation(observation) {
  if (!observation || typeof observation !== 'object') {
    return false;
  }

  const {
    date,
    arrivalQuantity,
    soldQuantity,
    modalPrice,
  } = observation;

  if (!isValidDate(date)) {
    return false;
  }

  if (!Number.isFinite(arrivalQuantity) || arrivalQuantity < 0) {
    return false;
  }

  if (!Number.isFinite(soldQuantity) || soldQuantity < 0) {
    return false;
  }

  if (soldQuantity > arrivalQuantity) {
    return false;
  }

  if (!Number.isFinite(modalPrice) || modalPrice <= 0) {
    return false;
  }

  return true;
}

export function validateMarketData(data) {
  if (!data || !Array.isArray(data.marketData)) {
    throw new Error('Invalid market dataset structure.');
  }

  return data.marketData;
}