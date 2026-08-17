/**
 * market-score.integration.service.js
 *
 * PUBLIC INTEGRATION BOUNDARY FOR MEMBER 4
 *
 * Member 4 calls:
 *
 * getMarketScore({
 *   state,
 *   district,
 *   crops
 * });
 *
 * Member 3 uses:
 *   state
 *   crops
 *
 * district is accepted only for interface compatibility
 * and is intentionally ignored.
 *
 * This is a direct in-process function call.
 * No HTTP request is made.
 */

import {
  analyzeMarkets,
} from './market-analysis.service.js';

import {
  normalizeStateName,
} from '../normalizers/state.normalizer.js';

import {
  normalizeCropName,
} from '../normalizers/crop.normalizer.js';


export async function getMarketScore({

  state,

  district, // intentionally unused

  crops,

}) {


  // ==================================================
  // 1. Normalize state
  // ==================================================

  const normalizedState =
    normalizeStateName(state);


  if (!normalizedState) {

    throw new Error(

      `Member 3: unsupported state "${state}".`

    );
  }


  // ==================================================
  // 2. Validate crops
  // ==================================================

  if (
    !Array.isArray(crops)
  ) {

    throw new Error(

      'Member 3: crops must be an array.'

    );
  }


  if (
    crops.length === 0
  ) {

    throw new Error(

      'Member 3: crops array cannot be empty.'

    );
  }


  // ==================================================
  // 3. Normalize crop names
  // ==================================================

  const requestedCrops = [];

  const normalizedCrops = [];

  const seen =
    new Set();


  for (
    const crop
    of crops
  ) {

    if (
      typeof crop !== 'string' ||
      crop.trim().length === 0
    ) {

      throw new Error(

        'Member 3: every crop must be a non-empty string.'

      );
    }


    const normalizedCrop =
      normalizeCropName(crop);


    if (!normalizedCrop) {

      requestedCrops.push({

        originalCrop:
          crop.trim(),

        normalizedCrop:
          null,

      });

      continue;
    }


    const key =
      normalizedCrop.toLowerCase();


    if (
      seen.has(key)
    ) {

      continue;
    }


    seen.add(key);


    requestedCrops.push({

      originalCrop:
        crop.trim(),

      normalizedCrop,

    });


    normalizedCrops.push(
      normalizedCrop
    );
  }


  // ==================================================
  // No supported crops
  // ==================================================

  if (
    normalizedCrops.length === 0
  ) {

    return {

      success: true,

      state:
        normalizedState,

      marketScores: [],

      unavailableCrops:

        requestedCrops.map(
          item => ({

            crop:
              item.originalCrop,

            reason:
              'Unsupported crop for Member 3 market analysis',

          })
        ),

    };
  }


  // ==================================================
  // 4. Run Member 3 market-analysis engine
  // ==================================================

  const analysis =
    await analyzeMarkets({

      state:
        normalizedState,

      crops:
        normalizedCrops,

    });


  // ==================================================
  // 5. Convert internal results into the public
  //    Member 4 integration response
  // ==================================================

  const successfulResults =
    new Map();


  const unavailableResults =
    new Map();


  for (
    const result
    of analysis.marketAnalysis
  ) {

    const key =
      result.crop.toLowerCase();


    if (
      result.status === 'SUCCESS' &&
      Number.isFinite(
        result.marketScore
      )
    ) {

      successfulResults.set(

        key,

        result.marketScore

      );

    } else {

      unavailableResults.set(

        key,

        result.message ||
          'Insufficient market data'

      );
    }
  }


  // ==================================================
  // 6. Build final response
  // ==================================================

  const marketScores = [];

  const unavailableCrops = [];


  for (
    const item
    of requestedCrops
  ) {

    const originalCrop =
      item.originalCrop;


    if (
      !item.normalizedCrop
    ) {

      unavailableCrops.push({

        crop:
          originalCrop,

        reason:
          'Unsupported crop for Member 3 market analysis',

      });

      continue;
    }


    const key =
      item.normalizedCrop.toLowerCase();


    if (
      successfulResults.has(key)
    ) {

      marketScores.push({

        crop:
          originalCrop,

        marketScore:
          successfulResults.get(key),

      });

    } else {

      unavailableCrops.push({

        crop:
          originalCrop,

        reason:
          unavailableResults.get(key) ||
          'Market score unavailable',

      });
    }
  }


  return {

    success: true,

    state:
      normalizedState,

    marketScores,

    unavailableCrops,

  };
}