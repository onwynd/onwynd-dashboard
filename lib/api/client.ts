import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { handleAxiosError } from "@/lib/error-handler";
import { useTherapistStore } from "@/store/therapist-store";
import { clearServerSession } from "@/lib/auth/session-client";
import Cookies from "js-cookie";
import { parseAuthSessionState } from "@/lib/auth/session";
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

const sessionProbeClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _auth401Count?: number;
  suppressErrorToast?: boolean;
}

function isNonRecoverableAuthEndpoint(url: string): boolean {
  return [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/logout",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
  ].some((authPath) => url.includes(authPath));
}

function getSafeFrom(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return `${window.location.pathname}${window.location.search}`;
}

async function canRecoverSession(): Promise<boolean> {
  const authState = parseAuthSessionState(Cookies.get("auth_state"));
  if (!authState?.primaryRole) {
    return false;
  }

  try {
    await sessionProbeClient.get("/api/v1/auth/me");
    return true;
  } catch {
    return false;
  }
}

// TODO: [AUTH REFACTOR] The Authorization header is no longer needed.
// The browser now sends the secure, HTTP-only cookie automatically with each request
// thanks to `withCredentials: true`.
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    // if (token) {
    //   config.headers.set("Authorization", `Bearer ${token}`);
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // TODO: [AUTH REFACTOR] The token refresh logic has been removed.
    // It was based on localStorage tokens, which are now deprecated.
    // The backend needs to handle token expiration with HTTP-only cookies, potentially
    // by returning a 401 which will trigger a redirect to login.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const requestUrl = originalRequest?.url ?? "";
      const nonRecoverableAuthRequest = isNonRecoverableAuthEndpoint(requestUrl);
      const attemptCount = (originalRequest?._auth401Count ?? 0) + 1;

      if (originalRequest) {
        originalRequest._auth401Count = attemptCount;
      }

      if (!nonRecoverableAuthRequest && originalRequest && attemptCount < 2 && !originalRequest._retry) {
        originalRequest._retry = true;
        const recovered = await canRecoverSession();
        if (recovered) {
          return client(originalRequest);
        }
      }

      await clearServerSession();
      const from = encodeURIComponent(getSafeFrom());
      window.location.href = `/login?from=${from}`;
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
          if (originalRequest) {
            originalRequest.suppressErrorToast = true;
          }
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
