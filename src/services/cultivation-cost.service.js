const cultivationCosts = require('../data/cultivation-costs.json');
const { toAcres } = require('../utils/area-converter');
const { AppError } = require('../middleware/error-handler');

class CultivationCostService {

  calculateCostForCrops(crops, context) {
    const results = [];

    for (const cropEntry of crops) {
      const result = this.calculateCostForCrop({
        crop: cropEntry.crop,
        state: context.state,
        farmSize: context.farmSize,
        unit: context.unit,
      });

      results.push(result);
    }

    return results;
  }

  calculateCostForCrop({
    crop,
    state,
    farmSize,
    unit,
  }) {

    const farmAreaInAcres = toAcres(farmSize, unit);

    const cropData = this.findCrop(state, crop);

    if (!cropData) {
      throw new AppError(
        `No cultivation cost data available for "${crop}" in ${state}`,
        422,
        {
          crop,
          state,
          reason: 'COST_DATA_NOT_FOUND',
        }
      );
    }

    const costPerAcre = {
      seed: Number(cropData.Seed),
      fertilizer: Number(cropData.Fertilizer),
      cropProtection: Number(cropData.Crop_Protection),
      irrigation: Number(cropData.Irrigation),
      labour: Number(cropData.Labour),
      machinery: Number(cropData.Machinery),
      miscellaneous: Number(cropData.Miscellaneous),
    };

    this.validateCostData(costPerAcre, crop);

    const totalPerAcre = Number(cropData.Total);

    if (!Number.isFinite(totalPerAcre)) {
      throw new AppError(
        `Invalid total cultivation cost for "${crop}"`,
        500,
        {
          crop,
          state,
        }
      );
    }

    const costBreakdown = {
      seed: Math.round(costPerAcre.seed * farmAreaInAcres),
      fertilizer: Math.round(
        costPerAcre.fertilizer * farmAreaInAcres
      ),
      cropProtection: Math.round(
        costPerAcre.cropProtection * farmAreaInAcres
      ),
      irrigation: Math.round(
        costPerAcre.irrigation * farmAreaInAcres
      ),
      labour: Math.round(
        costPerAcre.labour * farmAreaInAcres
      ),
      machinery: Math.round(
        costPerAcre.machinery * farmAreaInAcres
      ),
      miscellaneous: Math.round(
        costPerAcre.miscellaneous * farmAreaInAcres
      ),
    };

    const total = Math.round(
      totalPerAcre * farmAreaInAcres
    );

    return {
      crop,
      farmArea: farmSize,
      areaUnit: unit,
      farmAreaInAcres:
        Math.round(farmAreaInAcres * 100) / 100,

      costPerAcre,

      costBreakdown,

      total,

      dataSource: 'cultivation-costs.json',
      dataLevel: 'state',
    };
  }

  findCrop(state, crop) {

    const stateKey = Object.keys(cultivationCosts).find(
      key =>
        key.trim().toLowerCase() ===
        state.trim().toLowerCase()
    );

    if (!stateKey) {
      return null;
    }

    const stateCrops = cultivationCosts[stateKey];

    if (!Array.isArray(stateCrops)) {
      return null;
    }

    const cropData = stateCrops.find(item => {

      if (!item || !item.Crop) {
        return false;
      }

      return (
        item.Crop.trim().toLowerCase() ===
        crop.trim().toLowerCase()
      );
    });

    return cropData || null;
  }

  validateCostData(costPerAcre, crop) {

    for (const [component, value] of Object.entries(costPerAcre)) {

      if (!Number.isFinite(value)) {
        throw new AppError(
          `Invalid ${component} cost for "${crop}"`,
          500,
          {
            crop,
            component,
          }
        );
      }
    }
  }
}

module.exports = CultivationCostService;