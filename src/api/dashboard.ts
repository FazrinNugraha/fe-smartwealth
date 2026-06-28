/**
 * Dashboard API - Dashboard metrics endpoints
 * With Promise Deduplication & In-Memory Caching to prevent over-fetching
 */

import { fetchWithCache, clearGlobalCache } from "./client";

export const clearDashboardCache = clearGlobalCache;

// Get net worth
export const getNetWorth = async () => fetchWithCache("net-worth", "/dashboard/net-worth");

// Get allocation
export const getAllocation = async () => fetchWithCache("allocation", "/dashboard/allocation");

// Get performance
export const getPerformance = async () => fetchWithCache("performance", "/dashboard/performance");

// Get summary (all-in-one)
export const getSummary = async () => fetchWithCache("summary", "/dashboard/summary");

// Get wealth history
export const getWealthHistory = async (period: string = "30d") => {
  return fetchWithCache(`wealth-history-${period}`, `/dashboard/wealth-history?period=${period}`);
};

// Get interactive performance analytics
export const getPerformanceAnalytics = async (period: string = "30d") => {
  return fetchWithCache(
    `performance-analytics-${period}`,
    `/dashboard/performance-analytics?period=${period}`
  );
};

