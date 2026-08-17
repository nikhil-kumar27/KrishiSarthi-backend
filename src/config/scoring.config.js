/**
 * scoring.config.js
 *
 * Single Responsibility: Centralize every constant related to scoring.
 *
 * Scoring cases:
 *   CASE 1 — Member 1&2 provided a suitabilityScore:
 *     finalScore = (suitabilityScore + marketScore + budgetScore) / 3
 *
 *   CASE 2 — Member 1&2 did NOT provide a suitabilityScore:
 *     finalScore = (marketScore + budgetScore) / 2
 *     (see scoring.service.js for the explicit implementation)
 */

const BUDGET_STATUS = Object.freeze({
  WITHIN_BUDGET: 'Within Budget',
  OVER_BUDGET: 'Over Budget',
});

const SCORE_BOUNDS = Object.freeze({
  MIN: 0,
  MAX: 100,
});

module.exports = {
  BUDGET_STATUS,
  SCORE_BOUNDS,
};
