import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { buildLoginRedirectPath, isPublicAuthPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

declare module "axios" {
  interface AxiosRequestConfig<D = any> {
    skipAuthRedirect?: boolean;
  }

  interface InternalAxiosRequestConfig<D = any> {
    skipAuthRedirect?: boolean;
  }
}

function buildApiBaseUrl() {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!configuredOrigin) {
    return "/api/v1";
  }

  // `/api` と絶対 URL のどちらを渡しても `/api/v1` に正規化する。
  if (configuredOrigin.endsWith("/api")) {
    return `${configuredOrigin}/v1`;
  }

  return `${configuredOrigin}/api/v1`;
}

const API_BASE_URL = buildApiBaseUrl();
let isRedirectingForUnauthorized = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// リクエストインターセプター（JWT トークンをヘッダーに付加）
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// レスポンスインターセプター（401 時にログインページへリダイレクト）
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !config?.skipAuthRedirect
    ) {
      useAuthStore.getState().clearSession();

      if (!isPublicAuthPath(window.location.pathname) && !isRedirectingForUnauthorized) {
        isRedirectingForUnauthorized = true;
        window.location.assign(
          buildLoginRedirectPath(window.location.pathname, window.location.search)
        );
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = "保存に失敗しました") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.error === "string") {
      return data.error;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(", ");
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default api;
