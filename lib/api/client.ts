import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { handleAxiosError } from "@/lib/error-handler";
import { useTherapistStore } from "@/store/therapist-store";
import { clearServerSession, syncServerSession } from "@/lib/auth/session-client";
import { parseApiResponse } from "./utils";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  timeout: 15_000, // 15 s — prevents requests hanging until browser TCP timeout (~2 min)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
const failedQueue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

function enqueue(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; suppressErrorToast?: boolean };

    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return enqueue().then(() => client(originalRequest));
        }

        isRefreshing = true;

        try {
          const currentToken = localStorage.getItem("auth_token");
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/refresh`,
            {},
            {
              headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
              withCredentials: true,
            }
          );

          const responseData = parseApiResponse(refreshResponse);
          const data = responseData as { token?: string; access_token?: string };
          const newToken = data?.token || data?.access_token;

          if (newToken) {
            localStorage.setItem("auth_token", newToken);
            await syncServerSession(newToken);

            if (originalRequest.headers instanceof AxiosHeaders) {
              originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            } else {
              const existing = originalRequest.headers as Record<string, string> | undefined;
              originalRequest.headers = new AxiosHeaders({ ...(existing || {}), Authorization: `Bearer ${newToken}` });
            }

            isRefreshing = false;
            const queued = failedQueue.splice(0, failedQueue.length);
            queued.forEach((item) => item.resolve());
            return client(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          const queued = failedQueue.splice(0, failedQueue.length);
          queued.forEach((item) => item.reject(refreshError));
          await clearServerSession();
          localStorage.removeItem("auth_token");
          const from = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?from=${from}`;
          return Promise.reject(refreshError);
        }
      } else {
        await clearServerSession();
        localStorage.removeItem("auth_token");
        const from = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?from=${from}`;
      }
    }

    if (error.response?.status !== 401 && !originalRequest?.suppressErrorToast) {
      if (error.response?.status === 403) {
        const responseData = parseApiResponse(error.response);
        const data = responseData as { message?: string; error?: string };
        const serverMessage = data?.message || data?.error;
        const message = typeof serverMessage === "string" ? serverMessage : "Access denied";
        const isConsentMessage =
          message.toLowerCase().includes("patient has not granted progress access") ||
          message.toLowerCase().includes("permission to view this patient details");

        if (isConsentMessage) {
          useTherapistStore.getState().setConsentRequired(
            true,
            'Consent required: Patient has not granted progress access. Ask them to enable "Share Progress with Therapist" in Settings.'
          );
          originalRequest.suppressErrorToast = true;
        }
      }

      if (!originalRequest?.suppressErrorToast) {
        handleAxiosError(error);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
