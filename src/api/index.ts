/**
 * API Index - Export all API functions
 */

export * from "./auth";
export * from "./assets";
export * from "./transactions";
export * from "./dashboard";
export * from "./prices";
export * from "./insights";
export * from "./predictions";
export { default as apiClient } from "./client";

// Re-export types
export type { AssetCreate, AssetUpdate } from "./assets";
export type { TransactionCreate } from "./transactions";
export type { RegisterData, LoginData, TokenResponse } from "./auth";
export type { StockPredictionResponse } from "./predictions";
