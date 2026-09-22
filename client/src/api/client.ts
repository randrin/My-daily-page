import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_SERVER ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (requestConfig) => {
  if (typeof window === "undefined") return requestConfig;
  const session = await getSession();
  if (session?.accessToken) {
    requestConfig.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      original &&
      !original._retry
    ) {
      original._retry = true;
      const session = await getSession();
      if (session?.accessToken && session.error !== "RefreshAccessTokenError") {
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(original);
      }
      await signOut({ callbackUrl: "/auth/signin" });
    }
    return Promise.reject(error);
  },
);
