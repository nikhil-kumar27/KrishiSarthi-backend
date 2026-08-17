const recommendationData = require('../data/crop_recommendations.json');

function getRecommendations(state, district, season) {
  if (
    typeof state !== 'string' ||
    typeof district !== 'string' ||
    typeof season !== 'string'
  ) {
    return null;
  }

  const normalizedState = state.trim().toLowerCase();
  const normalizedDistrict = district.trim().toLowerCase();
  const normalizedSeason = season.trim().toLowerCase();

  const stateName = Object.keys(recommendationData).find(
    (name) => name.trim().toLowerCase() === normalizedState
  );
  if (!stateName) return null;

  const districtName = Object.keys(recommendationData[stateName]).find(
    (name) => name.trim().toLowerCase() === normalizedDistrict
  );
  if (!districtName) return null;

  const seasonName = Object.keys(recommendationData[stateName][districtName]).find(
    (name) => name.trim().toLowerCase() === normalizedSeason
  );

  return seasonName
    ? recommendationData[stateName][districtName][seasonName]
    : null;
}

module.exports = { getRecommendations };
