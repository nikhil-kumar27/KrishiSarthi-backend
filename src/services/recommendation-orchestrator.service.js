/**
 * recommendation-orchestrator.service.js
 *
 * Responsibility:
 * Coordinate the complete recommendation workflow.
 *
 * Production:
 *   Member 1&2 -> direct function call
 *   Member 3   -> direct function call
 *
 */

const { AppError } = require("../middleware/error-handler");

const { normalizeCropName } = require("../utils/crop-normalizer");

const {
  getRecommendations: getMember12Recommendations,
} = require("./crop-recommendation.service");

// Member 3 remains an ES module, so CommonJS loads it with dynamic import().

async function loadMember3MarketScoreFunction() {
  const module =
    await import("../market-engine/services/market-score.integration.service.js");

  return module.getMarketScore;
}

// ==========================================================
// Recommendation Orchestrator
// ==========================================================

function createRecommendationOrchestrator({
  cultivationCostService,
  budgetService,
  scoringService,
  rankingService,
}) {
  async function getRecommendations(request) {
    const {
      farmSize,

      unit,

      state,

      district,

      village,

      budget,

      season,
    } = request;

    // ==================================================
    // STEP 1
    // Member 1 & Member 2
    //
    // Production:
    // direct function call
    // ==================================================

    const member12Response = await getMember12Recommendations(
      state,
      district,
      season,
    );

    // ==================================================
    // Validate Member 1 & 2 result
    // ==================================================

    if (member12Response === null || member12Response === undefined) {
      throw new AppError(
        "Member 1&2 found no recommendations for the given state, district, and season",

        404,

        {
          upstream: "member12",

          state,

          district,

          season,
        },
      );
    }

    // Member 12 production service returns an array.
    //
    // Unit tests may return:
    //
    // {
    //   recommendedCrops: [...]
    // }

    let rawRecommendedCrops;

    if (Array.isArray(member12Response)) {
      rawRecommendedCrops = member12Response;
    } else if (Array.isArray(member12Response.recommendedCrops)) {
      rawRecommendedCrops = member12Response.recommendedCrops;
    } else {
      throw new AppError(
        "Member 1&2 returned an unexpected response format",

        502,

        {
          upstream: "member12",

          expected: "crop array or { recommendedCrops: [] }",
        },
      );
    }

    if (rawRecommendedCrops.length === 0) {
      throw new AppError(
        "Member 1&2 returned no recommended crops",

        502,

        {
          upstream: "member12",
        },
      );
    }

    // ==================================================
    // STEP 2
    // Normalize crop list
    // ==================================================

    const recommendedCrops = rawRecommendedCrops

      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const incomingCrop = item.commonName || item.crop;

        if (
          typeof incomingCrop !== "string" ||
          incomingCrop.trim().length === 0
        ) {
          return null;
        }

        const crop = normalizeCropName(incomingCrop) || incomingCrop.trim();

        const suitabilityScore =
          item.score !== undefined ? item.score : item.suitabilityScore;

        return {
          crop,

          suitabilityScore:
            suitabilityScore === null || suitabilityScore === undefined
              ? null
              : suitabilityScore,
        };
      })

      .filter(Boolean);

    if (recommendedCrops.length === 0) {
      throw new AppError(
        "Member 1&2 returned no valid crop names",

        502,

        {
          upstream: "member12",
        },
      );
    }

    // ==================================================
    // Remove duplicate crops
    // ==================================================

    const uniqueRecommendedCrops = [];

    const seenCrops = new Set();

    for (const item of recommendedCrops) {
      const key = item.crop.trim().toLowerCase();

      if (seenCrops.has(key)) {
        continue;
      }

      seenCrops.add(key);

      uniqueRecommendedCrops.push(item);
    }

    // ==================================================
    // STEP 3
    // Member 3
    //
    // Direct function call.
    //
    // No HTTP.
    // No localhost.
    //
    // Member 3 receives:
    //   state
    //   district
    //   crops
    //
    // Member 3 internally uses only:
    //   state
    //   crops
    // ==================================================

    const cropNames = uniqueRecommendedCrops.map((item) => item.crop);

    function normalizeStateForMember3(state) {
      if (typeof state !== "string") {
        return state;
      }

      return state
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ");
    }

    const getMarketScore = await loadMember3MarketScoreFunction();

    const normalizedStateForMember3 = normalizeStateForMember3(state);

    const member3Response = await getMarketScore({
      state: normalizedStateForMember3,
      district,
      crops: cropNames,
    });

    // ==================================================
    // Validate Member 3 response
    // ==================================================

    if (!member3Response || member3Response.success === false) {
      throw new AppError(
        "Member 3 returned no valid response",

        502,

        {
          upstream: "member3",
        },
      );
    }

    if (!Array.isArray(member3Response.marketScores)) {
      throw new AppError(
        "Member 3 returned an unexpected response format",

        502,

        {
          upstream: "member3",

          expected: "{ success, state, marketScores: [] }",
        },
      );
    }

    // ==================================================
    // STEP 4
    // Store market scores
    // ==================================================

    const marketScores = new Map();

    for (const item of member3Response.marketScores) {
      if (
        !item ||
        typeof item.crop !== "string" ||
        !Number.isFinite(item.marketScore)
      ) {
        continue;
      }

      const cropName = normalizeCropName(item.crop) || item.crop.trim();

      marketScores.set(
        cropName.toLowerCase(),

        item.marketScore,
      );
    }

    // ==================================================
    // STEP 5
    // Cost + Budget + Final Score
    // ==================================================

    const scoredCrops = [];

    const skippedCrops = [];

    for (const item of uniqueRecommendedCrops) {
      const crop = item.crop;

      const cropKey = crop.toLowerCase();

      // ----------------------------------------------
      // Market score
      // ----------------------------------------------

      const marketScore = marketScores.get(cropKey);

      // Never invent marketScore = 0.
      //
      // If Member 3 does not have market data for a
      // crop/state combination, report it as skipped.

      if (marketScore === undefined) {
        skippedCrops.push({
          crop,

          reason: "Market score unavailable for this state/crop combination",
        });

        continue;
      }

      // ----------------------------------------------
      // Cultivation cost
      // ----------------------------------------------

      const costResult = cultivationCostService.calculateCostForCrop({
        crop,

        state,

        farmSize,

        unit,
      });

      // ----------------------------------------------
      // Budget score
      // ----------------------------------------------

      const budgetResult = budgetService.evaluate(
        budget,

        costResult.total,
      );

      // ----------------------------------------------
      // Final score
      // ----------------------------------------------

      const scoreResult = scoringService.calculateFinalScore(
        item.suitabilityScore,

        marketScore,

        budgetResult.budgetScore,
      );

      // ----------------------------------------------
      // Result
      // ----------------------------------------------

      const cropResult = {
        crop,

        marketScore,

        budgetScore: budgetResult.budgetScore,

        finalScore: scoreResult.finalScore,

        scoringCase: scoreResult.scoringCase,

        affordable: budgetResult.affordable,

        status: budgetResult.status,

        cultivationCost: {
          ...costResult.costBreakdown,

          total: costResult.total,
        },

        budgetDetails: budgetResult.budgetDetails,

        dataSource: costResult.dataSource,

        dataLevel: costResult.dataLevel,
      };

      // Only include suitability score when
      // Member 1&2 actually provided it.

      if (
        item.suitabilityScore !== null &&
        item.suitabilityScore !== undefined
      ) {
        cropResult.suitabilityScore = item.suitabilityScore;
      }

      cropResult.reason = buildReason(
        crop,

        item.suitabilityScore,

        marketScore,

        budgetResult.budgetScore,

        budgetResult.affordable,

        scoreResult.scoringCase,
      );

      scoredCrops.push(cropResult);
    }

    // ==================================================
    // STEP 6
    // Ensure at least one crop can be scored
    // ==================================================

    if (scoredCrops.length === 0) {
      throw new AppError(
        "No recommended crop has sufficient market data to produce a final recommendation",

        422,

        {
          upstream: "member3",

          state,

          crops: cropNames,

          skippedCrops,
        },
      );
    }

    // ==================================================
    // STEP 7
    // Rank
    // ==================================================

    const rankedCrops = rankingService.rank(scoredCrops);

    // ==================================================
    // STEP 8
    // Final response
    // ==================================================

    return {
      success: true,

      input: {
        farmSize,

        unit,

        state,

        district,

        village: village || null,

        budget,

        season,
      },

      budget,

      recommendations: rankedCrops,

      skippedCrops,
    };
  }

  return {
    getRecommendations,
  };
}

// ==========================================================
// Explanation generator
// ==========================================================

function buildReason(
  crop,

  suitabilityScore,

  marketScore,

  budgetScore,

  affordable,

  scoringCase,
) {
  const budgetMessage = affordable
    ? "fits within the available budget"
    : "exceeds the available budget";

  if (scoringCase === 1) {
    return (
      `${crop} scores ${suitabilityScore} on suitability, ` +
      `${marketScore} on market outlook, ` +
      `and ${budgetMessage} ` +
      `(budget score ${budgetScore}).`
    );
  }

  return (
    `${crop} scores ${marketScore} on market outlook ` +
    `and ${budgetMessage} ` +
    `(budget score ${budgetScore}). ` +
    `No suitability score was provided by Member 1&2.`
  );
}

module.exports = createRecommendationOrchestrator;
