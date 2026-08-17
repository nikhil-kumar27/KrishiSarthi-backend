const { isSupportedUnit } = require('./area-converter');

const VALID_SEASONS = ['Kharif', 'Rabi', 'Zaid'];

function makeResult(errors) {
  return { valid: errors.length === 0, errors };
}

function validateRecommendationRequest(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return makeResult(['Request body must be a JSON object']);
  }

  const { farmSize, unit, state, district, village, season, budget } = body;

  if (typeof farmSize !== 'number' || !Number.isFinite(farmSize) || farmSize <= 0) {
    errors.push('farmSize must be a number greater than zero');
  }

  if (typeof unit !== 'string' || !isSupportedUnit(unit)) {
    errors.push('unit must be one of: acre, hectare, bigha');
  }

  for (const [field, value] of [['state', state], ['district', district], ['village', village]]) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} is required`);
    }
  }

  if (typeof season !== 'string' || !VALID_SEASONS.some((item) => item.toLowerCase() === season.trim().toLowerCase())) {
    errors.push(`season must be one of: ${VALID_SEASONS.join(', ')}`);
  }

  if (typeof budget !== 'number' || !Number.isFinite(budget) || budget <= 0) {
    errors.push('budget must be a number greater than zero');
  }

  return makeResult(errors);
}

module.exports = {
  VALID_SEASONS,
  validateRecommendationRequest,
};
