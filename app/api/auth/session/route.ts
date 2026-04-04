import { NextRequest, NextResponse } from "next/server";
import { AppConfig } from "@/lib/config";
import { buildAuthSessionState, serializeAuthSessionState } from "@/lib/auth/session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function isSecureRequest(req: NextRequest): boolean {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  return forwardedProto === "https" || req.nextUrl.protocol === "https:";
}

export async function POST(req: NextRequest) {
  let token: string | null = null;

  try {
    const body = await req.json() as { token?: unknown };
    token = typeof body.token === "string" && body.token.trim().length > 0 ? body.token.trim() : null;
  } catch {
    token = null;
  }

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const meResponse = await fetch(AppConfig.getApiUrl("/api/v1/auth/me"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!meResponse.ok) {
    return NextResponse.json({ message: "Unable to validate session" }, { status: meResponse.status });
  }

  const payload = await meResponse.json() as { data?: unknown };
  const user = payload?.data ?? payload;
  const sessionState = buildAuthSessionState(user as {
    id?: number | string | null;
    email?: string | null;
    role?: { slug?: string | null } | string | null;
    all_roles?: unknown;
  });

  const response = NextResponse.json({ success: true, data: sessionState });
  const secure = isSecureRequest(req);

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  response.cookies.set("auth_state", serializeAuthSessionState(sessionState), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // user_role and user_all_roles are readable by client JS (dashboard prefix detection, etc.)
  // Set them here so SSO/token-exchange flows (which bypass authService.login) also get them.
  response.cookies.set("user_role", sessionState.primaryRole, {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  response.cookies.set("user_all_roles", JSON.stringify(sessionState.allRoles), {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  const secure = isSecureRequest(req);

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("auth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("user_role", "", {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("user_all_roles", "", {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  return response;
}
