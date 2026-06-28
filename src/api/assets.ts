

import { apiClient, fetchWithCache } from "./client";
import { clearDashboardCache } from "./dashboard";

export interface AssetCreate {
  symbol: string;
  asset_name: string;
  asset_type: string;
  quantity: string;
  avg_buy_price: string;
  notes?: string;
}

export interface AssetUpdate {
  notes?: string;
  quantity?: string;
  avg_buy_price?: string;
}

// Get all assets
export const getAssets = async () => {
  return fetchWithCache("assets", "/assets");
};

// Get asset by ID
export const getAsset = async (id: string) => {
  return fetchWithCache(`asset-${id}`, `/assets/${id}`);
};

// Create asset
export const createAsset = async (data: AssetCreate) => {
  const response = await apiClient.post("/assets", data);
  clearDashboardCache();
  return response.data;
};

// Update asset
export const updateAsset = async (id: string, data: AssetUpdate) => {
  const response = await apiClient.put(`/assets/${id}`, data);
  clearDashboardCache();
  return response.data;
};

// Delete asset
export const deleteAsset = async (id: string) => {
  await apiClient.delete(`/assets/${id}`);
  clearDashboardCache();
};
