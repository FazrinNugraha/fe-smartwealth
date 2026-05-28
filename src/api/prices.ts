/**
 * Prices API - Price fetching endpoints
 */

import apiClient from "./client";

// Get price for a symbol
export const getPrice = async (symbol: string, assetType: string) => {
  const response = await apiClient.get(`/prices/${symbol}`, {
    params: { asset_type: assetType },
  });
  return response.data;
};

// Search crypto symbols
export const searchCrypto = async (query: string, limit: number = 10) => {
  const response = await apiClient.get("/prices/search/crypto", {
    params: { q: query, limit },
  });
  return response.data;
};
