/**
 * Dashboard API - Dashboard metrics endpoints
 * With Promise Deduplication & In-Memory Caching to prevent over-fetching
 */

import apiClient from "./client";

const CACHE_TTL_MS = 60 * 1000; // 1 minute
const promiseCache = new Map<string, Promise<any>>();
const dataCache = new Map<string, { timestamp: number; data: any }>();

export const clearDashboardCache = () => {
  promiseCache.clear();
  dataCache.clear();
};

const fetchWithCache = <T = any>(key: string, url: string): Promise<T> => {
  // 1. Check data cache (TTL based)
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }

  // 2. Check if already fetching (Promise deduplication)
  if (promiseCache.has(key)) {
    return promiseCache.get(key) as Promise<T>;
  }

  // 3. Fetch fresh data
  const promise = apiClient
    .get(url)
    .then((response) => {
      dataCache.set(key, { timestamp: Date.now(), data: response.data });
      promiseCache.delete(key);
      return response.data;
    })
    .catch((err) => {
      promiseCache.delete(key);
      throw err;
    });

  promiseCache.set(key, promise);
  return promise;
};

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

