import { findMarketData } from '../repositories/market.repository.js';

import { calculateDemandScore } from './demand.service.js';

import { calculateScarcityScore } from './scarcity.service.js';

import { calculateTrendScore } from './trend.service.js';

import { calculateMarketScore } from '../scoring/market-score.service.js';

import { MARKET_RULES } from '../config/scoring.config.js';


export async function analyzeMarkets({
  state,
  crops,
}) {

  const marketAnalysis = [];


  for (const crop of crops) {

    try {

      // ----------------------------------------------
      // Get market data
      // ----------------------------------------------

      const marketData =
        await findMarketData(
          state,
          crop
        );


      const {
        observations,
      } = marketData;


      // ----------------------------------------------
      // Check historical data
      // ----------------------------------------------

      if (
        observations.length <
        MARKET_RULES.minimumHistoricalObservations
      ) {

        marketAnalysis.push({

          crop,

          status:
            'INSUFFICIENT_DATA',

          message:
            `At least ${MARKET_RULES.minimumHistoricalObservations} historical observations are required for ${crop} in ${state}.`,

        });

        continue;
      }


      // ----------------------------------------------
      // Latest observation
      // ----------------------------------------------

      const currentObservation =
        observations[
          observations.length - 1
        ];


      // ----------------------------------------------
      // Demand
      // ----------------------------------------------

      const demandScore =
        calculateDemandScore(
          currentObservation
        );


      // ----------------------------------------------
      // Scarcity
      // ----------------------------------------------

      const scarcityScore =
        calculateScarcityScore(
          observations
        );


      // ----------------------------------------------
      // Trend
      // ----------------------------------------------

      const trendScore =
        calculateTrendScore(
          observations
        );


      // ----------------------------------------------
      // Validate component scores
      // ----------------------------------------------

      if (
        demandScore === null ||
        scarcityScore === null ||
        trendScore === null
      ) {

        marketAnalysis.push({

          crop,

          status:
            'INSUFFICIENT_DATA',

          message:
            `Unable to calculate complete market analysis for ${crop} in ${state}.`,

        });

        continue;
      }


      // ----------------------------------------------
      // Final market score
      // ----------------------------------------------

      const marketScore =
        calculateMarketScore({

          demandScore,

          scarcityScore,

          trendScore,

        });


      // ----------------------------------------------
      // Store result
      // ----------------------------------------------

      marketAnalysis.push({

        crop,

        status:
          'SUCCESS',

        demandScore,

        scarcityScore,

        trendScore,

        marketScore,

      });

    } catch (error) {

      // ----------------------------------------------
      // Missing market data
      // ----------------------------------------------

      if (
        error.code ===
        'DATA_NOT_FOUND'
      ) {

        marketAnalysis.push({

          crop,

          status:
            'INSUFFICIENT_DATA',

          message:
            error.message,

        });

        continue;
      }


      // ----------------------------------------------
      // Unexpected error
      // ----------------------------------------------

      throw error;
    }
  }


  return {

    success: true,

    state,

    marketAnalysis,

  };
}