/**
 * Insights API - Portfolio insights endpoints
 */

import { apiClient, fetchWithCache } from "./client";

// Get rule-based insights
export const getRuleBasedInsights = async () => {
  return fetchWithCache("insights-rule-based", "/insights");
};

// Get AI insights (Gemini)
export const getAIInsights = async () => {
  return fetchWithCache("insights-ai", "/insights/ai");
};

// Refresh AI insights (force regenerate)
export const refreshAIInsights = async () => {
  const response = await apiClient.post("/insights/ai/refresh");
  return response.data;
};
