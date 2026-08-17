/**
 * budget.service.js
 *
 * Single Responsibility: Given a farmer's budget and a crop's total
 * cultivation cost, compute:
 *   - budgetScore   (0-100)
 *   - affordability (boolean)
 *   - status        ("Within Budget" | "Over Budget")
 *   - budgetDetails (available / remaining / utilizationPercentage)
 *
 * Rules (fixed, not configurable per-request):
 *   - If cultivationCost <= budget:
 *       budgetScore = 100 * (budget - cultivationCost) / budget, clamped [0, 100]
 *   - If cultivationCost > budget:
 *       budgetScore = 0
 *   - Crops are NEVER excluded for being over budget.
 */

const { BUDGET_STATUS, SCORE_BOUNDS } = require('../config/scoring.config');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

class BudgetService {
  /**
   * @param {number} budget - farmer's available budget (must be > 0)
   * @param {number} cultivationCost - total cultivation cost for a crop
   * @returns {object} { budgetScore, affordable, status, budgetDetails }
   */
  evaluate(budget, cultivationCost) {
    if (typeof budget !== 'number' || budget <= 0) {
      throw new Error('budget must be a positive number');
    }
    if (typeof cultivationCost !== 'number' || cultivationCost < 0) {
      throw new Error('cultivationCost must be a non-negative number');
    }

    const affordable = cultivationCost <= budget;

    let budgetScore;
    if (affordable) {
      const rawScore = (100 * (budget - cultivationCost)) / budget;
      budgetScore = clamp(rawScore, SCORE_BOUNDS.MIN, SCORE_BOUNDS.MAX);
    } else {
      budgetScore = 0;
    }

    const remaining = Math.round(budget - cultivationCost);
    const utilizationPercentage = clamp(
      Math.round((cultivationCost / budget) * 100),
      0,
      Number.MAX_SAFE_INTEGER
    );

    return {
      budgetScore: Math.round(budgetScore * 100) / 100,
      affordable,
      status: affordable ? BUDGET_STATUS.WITHIN_BUDGET : BUDGET_STATUS.OVER_BUDGET,
      budgetDetails: {
        available: budget,
        remaining,
        utilizationPercentage,
      },
    };
  }
}

module.exports = BudgetService;
