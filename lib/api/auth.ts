
// filepath: lib/api/auth.ts
import client from "./client";
import Cookies from "js-cookie";
import { safeApiCall } from "./safeApiCall";
import { clearServerSession, syncServerSession } from "@/lib/auth/session-client";
import { buildAuthSessionState } from "@/lib/auth/session";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name?: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
  role_slug?: string;
  invite_token?: string;
  license_number?: string;
  license_state?: string;
  specializations?: string[];
  years_experience?: string | number;
  education_degree?: string;
  education_institution?: string;
  bio?: string;
  session_rate?: string | number;
  languages?: string[];
  organization_name?: string;
  organization_type?: "university" | "corporate" | "faith_ngo";
  industry?: string;
  size?: string;
  admin_position?: string;
}

function buildRegisterPayload(data: RegisterData) {
  const firstName = data.first_name ?? data.name?.trim().split(/\s+/)[0] ?? "";
  const lastName = data.last_name ?? data.name?.trim().split(/\s+/).slice(1).join(" ") ?? "";

  const payload = {
    first_name: firstName,
    last_name: lastName || firstName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    password_confirmation: data.password_confirmation,
    role_slug: data.role_slug ?? data.user_type ?? "patient",
    ...(data.invite_token ? { invite_token: data.invite_token } : {}),
    ...(data.license_number ? { license_number: data.license_number } : {}),
    ...(data.license_state ? { license_state: data.license_state } : {}),
    ...(data.specializations && data.specializations.length > 0 ? { specializations: data.specializations } : {}),
    ...(data.years_experience !== undefined && data.years_experience !== "" ? { years_experience: data.years_experience } : {}),
    ...(data.education_degree ? { education_degree: data.education_degree } : {}),
    ...(data.education_institution ? { education_institution: data.education_institution } : {}),
    ...(data.bio ? { bio: data.bio } : {}),
    ...(data.session_rate !== undefined && data.session_rate !== "" ? { session_rate: data.session_rate } : {}),
    ...(data.languages && data.languages.length > 0 ? { languages: data.languages } : {}),
    ...(data.organization_name ? { organization_name: data.organization_name } : {}),
    ...(data.organization_type ? { organization_type: data.organization_type } : {}),
    ...(data.industry ? { industry: data.industry } : {}),
    ...(data.size ? { size: data.size } : {}),
    ...(data.admin_position ? { admin_position: data.admin_position } : {}),
  };

  return payload;
}

function persistClientState(user: any) {
  if (typeof window === "undefined") return;

  const secure = window.location.protocol === "https:";
  const userJson = JSON.stringify(user);

  // Store user object in a cookie for server-side rendering and the useAuth hook
  Cookies.set("user", userJson, { expires: 7, secure, sameSite: "strict" });

  // Deprecated: Remove sensitive data from localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("auth_token");

  const state = buildAuthSessionState(user ?? null);
  Cookies.set("user_role", state.primaryRole, { expires: 7, secure, sameSite: "strict" });
  Cookies.set("user_all_roles", JSON.stringify(state.allRoles), { expires: 7, secure, sameSite: "strict" });
}

export const authService = {
  async getCsrfCookie() {
    return await client.get("/sanctum/csrf-cookie");
  },

  async login(credentials: LoginCredentials) {
    const response = await safeApiCall(() => client.post("/api/v1/auth/login", credentials));

    if (response.data?.token) {
      persistClientState(response.data.user ?? {});
      await syncServerSession(response.data.token, response.data.user ?? null);
    }
    return response;
  },

  async register(data: RegisterData) {
    const response = await safeApiCall(() =>
      client.post("/api/v1/auth/register", buildRegisterPayload(data))
    );

    if (response.data?.token) {
      persistClientState(response.data.user ?? {});
      await syncServerSession(response.data.token, response.data.user ?? null);
    }
    return response;
  },

  async logout() {
    try {
      await safeApiCall(() => client.post("/api/v1/auth/logout"), true);
    } finally {
      if (typeof window !== "undefined") {
        await clearServerSession();
        Cookies.remove("user");
        Cookies.remove("user_role");
        Cookies.remove("user_all_roles");
        // The redirect is now handled by the component calling logout.
      }
    }
  },

  async getUser() {
    const response = await safeApiCall(() => client.get("/api/v1/auth/me"));

    if (response.data) {
      persistClientState(response.data);
    }
    return response;
  },
};
