import client from "./client";
import Cookies from "js-cookie";
import { clearServerSession, syncServerSession } from "@/lib/auth/session-client";

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
  user_type?:
    | "patient"
    | "therapist"
    | "admin"
    | "manager"
    | "finance"
    | "hr"
    | "support"
    | "tech"
    | "marketing"
    | "sales"
    | "product_manager"
    | "clinical_advisor"
    | "legal_advisor"
    | "ambassador"
    | "secretary"
    | "health_personnel";
  first_name?: string;
  last_name?: string;
  role_slug?: string;
}

function buildRegisterPayload(data: RegisterData) {
  const firstName =
    data.first_name ??
    data.name?.trim().split(/\s+/)[0] ??
    "";
  const lastName =
    data.last_name ??
    data.name?.trim().split(/\s+/).slice(1).join(" ") ??
    "";

  return {
    first_name: firstName,
    last_name: lastName || firstName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    password_confirmation: data.password_confirmation,
    role_slug: data.role_slug ?? data.user_type ?? "patient",
  };
}

function persistClientRoleState(user: {
  role?: { slug?: string | null } | string | null;
  all_roles?: unknown;
}) {
  const secure = window.location.protocol === "https:";
  const roleSlug = user?.role && typeof user.role === "object"
    ? user.role.slug ?? "patient"
    : typeof user?.role === "string"
      ? user.role
      : "patient";

  Cookies.set("user_role", roleSlug, { expires: 7, secure, sameSite: "strict" });

  const allRoles = Array.isArray(user?.all_roles) && user.all_roles.length > 0
    ? user.all_roles.filter((role): role is string => typeof role === "string" && role.length > 0)
    : [roleSlug];

  Cookies.set("user_all_roles", JSON.stringify(allRoles), { expires: 7, secure, sameSite: "strict" });
}

export const authService = {
  async getCsrfCookie() {
    await client.get("/sanctum/csrf-cookie");
  },

  async login(credentials: LoginCredentials) {
    const response = await client.post("/api/v1/auth/login", credentials);
    const payload = response.data.data;

    if (payload?.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      persistClientRoleState(payload.user ?? {});
      await syncServerSession(payload.token);
    }

    return response.data;
  },

  async register(data: RegisterData) {
    const response = await client.post(
      "/api/v1/auth/register",
      buildRegisterPayload(data),
    );
    const payload = response.data.data;

    if (payload?.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      persistClientRoleState(payload.user ?? {});
      await syncServerSession(payload.token);
    }

    return response.data;
  },

  async logout() {
    try {
      await client.post("/api/v1/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        await clearServerSession();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        Cookies.remove("user_role");
        Cookies.remove("user_all_roles");
        window.location.href = "/login";
      }
    }
  },

  async getUser() {
    const response = await client.get("/api/v1/auth/me");
    const user = response.data.data ?? response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      persistClientRoleState(user ?? {});

      const token = localStorage.getItem("auth_token");
      if (token) {
        await syncServerSession(token);
      }
    }

    return user;
  },
};
