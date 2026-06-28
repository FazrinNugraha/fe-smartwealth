/**
 * API Client - Axios instance untuk connect ke backend
 *
 * Base URL: configured via VITE_API_BASE_URL
 * Auth: Bearer token di header
 */

import axios from "axios";

const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
}/api/v1`;

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Menghapus header no-cache agar browser bisa melakukan caching HTTP standar
  },
});

// --- SMART CACHE SYSTEM ---
// Caching data di RAM (Client-Side) selama 1 menit (60 detik)
const CACHE_TTL_MS = 60 * 1000;
const promiseCache = new Map<string, Promise<any>>();
const dataCache = new Map<string, { timestamp: number; data: any }>();

export const clearGlobalCache = () => {
  promiseCache.clear();
  dataCache.clear();
};

export const fetchWithCache = <T = any>(key: string, url: string, config?: any): Promise<T> => {
  // 1. Cek apakah ada data di cache dan belum kadaluarsa
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }

  // 2. Cek apakah API dengan key yang sama sedang di-fetch (Deduplikasi)
  if (promiseCache.has(key)) {
    return promiseCache.get(key) as Promise<T>;
  }

  // 3. Tarik data asli dari server
  const promise = apiClient
    .get(url, config)
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

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } =
            response.data;

          // Save new tokens
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
