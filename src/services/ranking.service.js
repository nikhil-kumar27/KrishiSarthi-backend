/**
 * ranking.service.js
 *
 * Single Responsibility: Order a list of scored crop recommendations
 * using the mandatory two-group ranking rule:
 *
 *   Group 1: Within-Budget crops, sorted by finalScore DESC
 *   Group 2: Over-Budget crops,   sorted by finalScore DESC
 *   Final list = Group 1 followed by Group 2
 *
 * Over-budget crops are NEVER removed - they simply always sort after
 * every within-budget crop, regardless of their score. This service
 * also assigns the 1-based `rank` field on the final ordered list.
 */

const { BUDGET_STATUS } = require('../config/scoring.config');

class RankingService {
  /**
   * @param {object[]} scoredCrops - each item must have `affordable`
   *   (boolean) and `finalScore` (number)
   * @returns {object[]} new array, sorted and with `rank` assigned
   */
  rank(scoredCrops) {
    if (!Array.isArray(scoredCrops)) {
      throw new Error('scoredCrops must be an array');
    }

    const withinBudget = scoredCrops
      .filter((c) => c.status === BUDGET_STATUS.WITHIN_BUDGET)
      .sort((a, b) => b.finalScore - a.finalScore);

    const overBudget = scoredCrops
      .filter((c) => c.status === BUDGET_STATUS.OVER_BUDGET)
      .sort((a, b) => b.finalScore - a.finalScore);

    const ordered = [...withinBudget, ...overBudget];

    return ordered.map((crop, index) => ({
      rank: index + 1,
      ...crop,
    }));
  }
}

module.exports = RankingService;
