import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseAuthSessionState } from "@/lib/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const authStateRaw = cookieStore.get("auth_state")?.value;
  const authState = parseAuthSessionState(authStateRaw);

  if (!authState) {
    return NextResponse.json(
      { isAuthenticated: false, user: null, role: null, allRoles: [] },
      { status: 401 },
    );
  }

  const user = {
    id: authState.userId ?? 0,
    uuid: "",
    first_name: "",
    last_name: "",
    email: authState.email ?? "",
    phone: null,
    email_verified_at: null,
    profile_photo: null,
    role: { slug: authState.primaryRole, name: authState.primaryRole },
    all_roles: authState.allRoles,
    onboarding_steps_completed: [],
    terms_accepted_at: null,
  };

  return NextResponse.json({
    isAuthenticated: true,
    user,
    role: authState.primaryRole,
    allRoles: authState.allRoles,
  });
}
