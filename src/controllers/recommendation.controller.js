const {
  validateRecommendationRequest,
} = require('../utils/validators');

const {
  AppError,
} = require('../middleware/error-handler');

const createRecommendationOrchestrator =
  require('../services/recommendation-orchestrator.service');

const CultivationCostService =
  require('../services/cultivation-cost.service');

const BudgetService =
  require('../services/budget.service');

const ScoringService =
  require('../services/scoring.service');

const RankingService =
  require('../services/ranking.service');


async function postRecommend(req, res, next) {

  try {

    // ==================================================
    // 1. Validate frontend request
    // ==================================================

    const validation =
      validateRecommendationRequest(req.body);


    if (!validation.valid) {

      throw new AppError(
        'Invalid recommendation request',
        400,
        {
          errors: validation.errors,
        }
      );
    }


    // ==================================================
    // 2. Create service instances
    //
    // These are classes, therefore "new" is required.
    // ==================================================

    const cultivationCostService =
      new CultivationCostService();


    const budgetService =
      new BudgetService();


    const scoringService =
      new ScoringService();


    const rankingService =
      new RankingService();


    // ==================================================
    // 3. Create recommendation orchestrator
    //
    // This is a factory function, NOT a class.
    // Therefore "new" is NOT used here.
    // ==================================================

    const orchestrator =
      createRecommendationOrchestrator({

        cultivationCostService,

        budgetService,

        scoringService,

        rankingService,

      });


    // ==================================================
    // 4. Run recommendation workflow
    // ==================================================

    const result =
      await orchestrator.getRecommendations(
        req.body
      );


    // ==================================================
    // 5. Send response
    // ==================================================

    res
      .status(200)
      .json(result);

  } catch (error) {

    next(error);

  }
}


module.exports = {
  postRecommend,
};