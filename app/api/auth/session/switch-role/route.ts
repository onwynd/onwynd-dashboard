import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseAuthSessionState, serializeAuthSessionState } from "@/lib/auth/session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const authStateRaw = cookieStore.get("auth_state")?.value;
  const authState = parseAuthSessionState(authStateRaw);

  if (!authState) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as { role?: string };
  const selectedRole = typeof body.role === "string" ? body.role.trim() : "";

  if (!selectedRole || !authState.allRoles.includes(selectedRole)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  const nextState = { ...authState, primaryRole: selectedRole };
  const secure = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  const response = NextResponse.json({ success: true, role: selectedRole });

  response.cookies.set("auth_state", serializeAuthSessionState(nextState), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  response.cookies.set("user_role", selectedRole, {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
