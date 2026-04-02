import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "/api/v1";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;

  try {
    const parsed = JSON.parse(authStorage) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// リクエストインターセプター（JWT トークンをヘッダーに付加）
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// レスポンスインターセプター（401 時にログインページへリダイレクト）
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = "保存に失敗しました") {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}

export default api;
