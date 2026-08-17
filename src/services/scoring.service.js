/**
 * scoring.service.js
 *
 * Single Responsibility: Compute the final recommendation score for a
 * crop from its inputs.
 *
 * CASE 1 — suitabilityScore IS present (Member 1&2 provided it):
 *   finalScore = (suitabilityScore + marketScore + budgetScore) / 3
 *
 * CASE 2 — suitabilityScore is NOT present (Member 1&2 gave us crops
 *   without a numeric suitability score):
 *   finalScore = (marketScore + budgetScore) / 2
 *
 * The choice is made explicitly in this service. We NEVER silently
 * assign suitabilityScore = 0 or suitabilityScore = 100.
 *
 * CHANGES FROM ORIGINAL:
 *   - calculateFinalScore() now accepts an optional suitabilityScore.
 *     If suitabilityScore is null/undefined, Case 2 is used.
 */

class ScoringService {
  /**
   * Calculate the final crop score.
   *
   * @param {number|null|undefined} suitabilityScore - from Member 1&2 (may be null)
   * @param {number} marketScore - from Member 3
   * @param {number} budgetScore - computed by BudgetService
   * @returns {object} { finalScore, scoringCase }
   *   scoringCase is 1 or 2 — tells callers which formula was used.
   */
  calculateFinalScore(suitabilityScore, marketScore, budgetScore) {
    // Validate market and budget scores — always required
    [marketScore, budgetScore].forEach((score, idx) => {
      if (typeof score !== 'number' || Number.isNaN(score)) {
        throw new Error(`Score at position ${idx} must be a valid number`);
      }
    });

    const hasSuitability =
      suitabilityScore !== null &&
      suitabilityScore !== undefined &&
      typeof suitabilityScore === 'number' &&
      !Number.isNaN(suitabilityScore);

    let finalScore;
    let scoringCase;

    if (hasSuitability) {
      // CASE 1: all three scores available → equal-weight average
      finalScore = (suitabilityScore + marketScore + budgetScore) / 3;
      scoringCase = 1;
    } else {
      // CASE 2: suitabilityScore absent → two-component average
      finalScore = (marketScore + budgetScore) / 2;
      scoringCase = 2;
    }

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      scoringCase,
    };
  }
}

module.exports = ScoringService;
