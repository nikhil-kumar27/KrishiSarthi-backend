/**
 * area-converter.js
 *
 * Single Responsibility: Convert farm area between supported units.
 * All cultivation cost data is stored per-acre, so every consumer
 * that needs an acre value should go through this module instead of
 * duplicating conversion factors.
 */

const SUPPORTED_UNITS = Object.freeze(['acre', 'hectare', 'bigha']);

// Conversion factors to acres.
// 1 hectare = 2.47105 acres
// 1 bigha (standard/pucca bigha, commonly used in North India / UP) = 0.625 acre
const TO_ACRE_FACTORS = Object.freeze({
  acre: 1,
  hectare: 2.47105,
  bigha: 0.625,
});

function isSupportedUnit(unit) {
  return typeof unit === 'string' && SUPPORTED_UNITS.includes(unit.toLowerCase());
}

/**
 * Convert a farm size value expressed in `unit` into acres.
 * @param {number} value
 * @param {string} unit
 * @returns {number} area in acres
 */
function toAcres(value, unit) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('Area value must be a valid number');
  }
  const normalizedUnit = String(unit).toLowerCase();
  if (!isSupportedUnit(normalizedUnit)) {
    throw new Error(`Unsupported area unit: ${unit}`);
  }
  const factor = TO_ACRE_FACTORS[normalizedUnit];
  return value * factor;
}

module.exports = {
  SUPPORTED_UNITS,
  isSupportedUnit,
  toAcres,
};
