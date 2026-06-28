/**
 * Predictions API - IDX stock forecast endpoints
 */

import { apiClient, fetchWithCache } from "./client";

export type StockPredictionDirection = "naik" | "turun" | "sideways";

export type PredictionRange = {
  lower: number;
  median: number;
  upper: number;
};

export type StockPredictionResponse = {
  ticker: string;
  last_close: number;
  last_close_date: string;
  horizon_days: number;
  prediction_date: string;
  direction: StockPredictionDirection;
  predicted_price: PredictionRange;
  change_percent: PredictionRange;
  generated_at: string;
  disclaimer: string;
  cached: boolean;
};

export const getStockPrediction = async (
  ticker: string,
  horizon: number = 1,
): Promise<StockPredictionResponse> => {
  const cacheKey = `prediction-${ticker}-${horizon}`;
  return fetchWithCache(cacheKey, `/predictions/${ticker}`, {
    params: { horizon },
    timeout: 60000,
  });
};
