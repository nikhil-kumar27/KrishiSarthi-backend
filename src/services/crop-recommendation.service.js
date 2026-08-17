const recommendationData = require('../data/crop_recommendations.json');

/**
 * Normalize text so that:
 * "Uttar-Pradesh"
 * "uttar pradesh"
 * "UTTAR_PRADESH"
 * " uttar   pradesh "
 *
 * are treated consistently.
 */
function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Normalize season names.
 */
function normalizeSeason(value) {
  const normalized = normalizeText(value);

  const seasonAliases = {
    kharif: 'kharif',
    'kharif season': 'kharif',

    rabi: 'rabi',
    'rabi season': 'rabi',

    zaid: 'zaid',
    'zaid season': 'zaid',

    summer: 'zaid',
    monsoon: 'kharif',
    winter: 'rabi'
  };

  return seasonAliases[normalized] || normalized;
}

/**
 * Find an object key using normalized comparison.
 */
function findMatchingKey(object, requestedValue) {
  if (!object || typeof object !== 'object') {
    return null;
  }

  const normalizedRequested = normalizeText(requestedValue);

  return Object.keys(object).find((key) => {
    return normalizeText(key) === normalizedRequested;
  }) || null;
}

/**
 * Get crop recommendations based on:
 * state + district + season
 */
function getRecommendations(state, district, season) {
  if (
    typeof state !== 'string' ||
    typeof district !== 'string' ||
    typeof season !== 'string'
  ) {
    return null;
  }

  const normalizedState = normalizeText(state);
  const normalizedDistrict = normalizeText(district);
  const normalizedSeason = normalizeSeason(season);

  // ----------------------------------------------------
  // 1. Find state
  // ----------------------------------------------------

  const stateName = findMatchingKey(
    recommendationData,
    normalizedState
  );

  if (!stateName) {
    return null;
  }

  // ----------------------------------------------------
  // 2. Find district
  // ----------------------------------------------------

  const stateData = recommendationData[stateName];

  const districtName = findMatchingKey(
    stateData,
    normalizedDistrict
  );

  if (!districtName) {
    return null;
  }

  // ----------------------------------------------------
  // 3. Find season
  // ----------------------------------------------------

  const districtData = stateData[districtName];

  const seasonName = Object.keys(districtData).find((key) => {
    const normalizedKey = normalizeSeason(key);

    return normalizedKey === normalizedSeason;
  });

  if (!seasonName) {
    return null;
  }

  // ----------------------------------------------------
  // 4. Return recommendations
  // ----------------------------------------------------

  return districtData[seasonName];
}

module.exports = {
  getRecommendations
};