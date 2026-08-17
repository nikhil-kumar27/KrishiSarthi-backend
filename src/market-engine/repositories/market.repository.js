import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateMarketData,
  validateObservation,
} from '../validators/market-data.validator.js';
import { DataNotFoundError } from '../errors/data-not-found.error.js';
import { sortByDateAscending } from '../utils/date.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(
  __dirname,
  '../../data/market-data.json',
);

let cachedData = null;

async function loadMarketData() {
  if (cachedData) {
    return cachedData;
  }

  const file = await fs.readFile(DATA_PATH, 'utf-8');
  const parsedData = JSON.parse(file);

  const marketData = validateMarketData(parsedData);

  cachedData = marketData;

  return marketData;
}

export async function findMarketData(state, crop) {
  const marketData = await loadMarketData();

  const stateRecord = marketData.find(
    (record) =>
      record.state.toLowerCase() === state.toLowerCase(),
  );

  if (!stateRecord) {
    throw new DataNotFoundError(
      `No market data available for state: ${state}`,
    );
  }

  const cropRecord = stateRecord.crops.find(
    (record) =>
      record.crop.toLowerCase() === crop.toLowerCase(),
  );

  if (!cropRecord) {
    throw new DataNotFoundError(
      `Market data unavailable for ${crop} in ${state}`,
    );
  }

  const validObservations = cropRecord.observations.filter(
    validateObservation,
  );

  return {
    state,
    crop,
    observations: sortByDateAscending(validObservations),
  };
}