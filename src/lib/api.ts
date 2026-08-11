import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/auth-cookies";
import { useAuth } from "@/store/useAuth";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
      return;
    }

    if (token) {
      item.resolve(token);
    }
  });

  failedQueue = [];
}

function clearSessionAndRedirect() {
  clearAuthTokens();
  useAuth.getState().logout();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

function shouldSkipRefresh(url?: string) {
  if (!url) {
    return false;
  }

  return (
    url.includes("/admin/auth/login") ||
    url.includes("/admin/auth/refresh-token") ||
    url.includes("/admin/auth/forgot-password") ||
    url.includes("/admin/auth/reset-password")
  );
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setAuthTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
