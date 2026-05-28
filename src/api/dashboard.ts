/**
 * Dashboard API - Dashboard metrics endpoints
 */

import apiClient from "./client";

// Get net worth
export const getNetWorth = async () => {
  const response = await apiClient.get("/dashboard/net-worth");
  return response.data;
};

// Get allocation
export const getAllocation = async () => {
  const response = await apiClient.get("/dashboard/allocation");
  return response.data;
};

// Get performance
export const getPerformance = async () => {
  const response = await apiClient.get("/dashboard/performance");
  return response.data;
};

// Get summary (all-in-one)
export const getSummary = async () => {
  const response = await apiClient.get("/dashboard/summary");
  return response.data;
};

// Get wealth history
export const getWealthHistory = async (period: string = "30d") => {
  const response = await apiClient.get(
    `/dashboard/wealth-history?period=${period}`,
  );
  return response.data;
};

// Get interactive performance analytics
export const getPerformanceAnalytics = async (period: string = "30d") => {
  const response = await apiClient.get(
    `/dashboard/performance-analytics?period=${period}`,
  );
  return response.data;
};
