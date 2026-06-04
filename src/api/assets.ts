

import apiClient from "./client";

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
  const response = await apiClient.get("/assets");
  return response.data;
};

// Get asset by ID
export const getAsset = async (id: string) => {
  const response = await apiClient.get(`/assets/${id}`);
  return response.data;
};

// Create asset
export const createAsset = async (data: AssetCreate) => {
  const response = await apiClient.post("/assets", data);
  return response.data;
};

// Update asset
export const updateAsset = async (id: string, data: AssetUpdate) => {
  const response = await apiClient.put(`/assets/${id}`, data);
  return response.data;
};

// Delete asset
export const deleteAsset = async (id: string) => {
  await apiClient.delete(`/assets/${id}`);
};
