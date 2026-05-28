/**
 * Insights API - Portfolio insights endpoints
 */

import apiClient from "./client";

// Get rule-based insights
export const getRuleBasedInsights = async () => {
  const response = await apiClient.get("/insights");
  return response.data;
};

// Get AI insights (Gemini)
export const getAIInsights = async () => {
  const response = await apiClient.get("/insights/ai");
  return response.data;
};

// Refresh AI insights (force regenerate)
export const refreshAIInsights = async () => {
  const response = await apiClient.post("/insights/ai/refresh");
  return response.data;
};
