import axios, { type AxiosRequestConfig } from "axios";
import { v4 as uuid } from "uuid";
import { endpoints } from "@/lib/api/endpoints";
import { getAccessToken, clearSession } from "@/features/auth/session";

export const apiClient = axios.create({
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 500000),
  withCredentials: true,
});

const authPaths = [
  endpoints.auth.login,
  endpoints.auth.authuser,
] as const;

apiClient.interceptors.request.use((config) => {
  config.headers["request-id"] = uuid();

  const url = config.url ?? "";
  const isAuthPath = authPaths.some((path) => url.includes(path));

  if (!isAuthPath) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    if (
      status === 401 &&
      !url.includes(endpoints.auth.login) &&
      !error.response?.data?.includes?.("otp")
    ) {
      clearSession();
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

    return Promise.reject(error);
  },
);

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function downloadFile(
  url: string,
  filename: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  const { saveAs } = await import("file-saver");
  const response = await apiClient.get<ArrayBuffer>(url, {
    ...config,
    responseType: "arraybuffer",
  });
  const contentType =
    (response.headers["content-type"] as string) || "application/octet-stream";
  const blob = new Blob([response.data], { type: contentType });
  saveAs(blob, filename);
}
