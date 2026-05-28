/**
 * Auth API - Authentication endpoints
 */

import apiClient from "./client";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Register
export const register = async (data: RegisterData): Promise<TokenResponse> => {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
};

// Login
export const login = async (data: LoginData): Promise<TokenResponse> => {
  const response = await apiClient.post("/auth/login/json", data);
  return response.data;
};

// Google OAuth
export const googleAuth = async (code: string): Promise<TokenResponse> => {
  const response = await apiClient.post("/auth/google", { code });
  return response.data;
};

// Refresh token
export const refreshToken = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  const response = await apiClient.post("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return response.data;
};

// Logout
export const logout = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/auth/logout", {
    refresh_token: refreshToken,
  });
};

// Get current user
export const getCurrentUser = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};
