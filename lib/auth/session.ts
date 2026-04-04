export interface AuthSessionState {
  primaryRole: string;
  allRoles: string[];
  userId: number | string | null;
  email: string | null;
}

interface RoleObjectLike {
  slug?: string | null;
}

interface AuthUserLike {
  id?: number | string | null;
  email?: string | null;
  role?: RoleObjectLike | string | null;
  all_roles?: unknown;
}

function sanitizeRole(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function resolvePrimaryRole(user: AuthUserLike | null | undefined, fallbackRole = "patient"): string {
  const relationRole = typeof user?.role === "object" && user?.role !== null
    ? sanitizeRole((user.role as RoleObjectLike).slug)
    : null;
  const directRole = sanitizeRole(typeof user?.role === "string" ? user.role : null);

  return relationRole ?? directRole ?? fallbackRole;
}

export function resolveAllRoles(user: AuthUserLike | null | undefined, fallbackRole = "patient"): string[] {
  const fallback = resolvePrimaryRole(user, fallbackRole);

  if (!Array.isArray(user?.all_roles)) {
    return [fallback];
  }

  const roles = user.all_roles
    .map((role) => sanitizeRole(role))
    .filter((role): role is string => Boolean(role));

  return roles.length > 0 ? Array.from(new Set(roles)) : [fallback];
}

export function buildAuthSessionState(user: AuthUserLike | null | undefined, fallbackRole = "patient"): AuthSessionState {
  const primaryRole = resolvePrimaryRole(user, fallbackRole);
  const allRoles = resolveAllRoles(user, primaryRole);

  return {
    primaryRole,
    allRoles,
    userId: user?.id ?? null,
    email: typeof user?.email === "string" ? user.email : null,
  };
}

export function serializeAuthSessionState(state: AuthSessionState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export function parseAuthSessionState(value: string | undefined | null): AuthSessionState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AuthSessionState>;
    const primaryRole = sanitizeRole(parsed.primaryRole);
    const allRoles = Array.isArray(parsed.allRoles)
      ? parsed.allRoles.map((role) => sanitizeRole(role)).filter((role): role is string => Boolean(role))
      : [];

    if (!primaryRole) {
      return null;
    }

    return {
      primaryRole,
      allRoles: allRoles.length > 0 ? Array.from(new Set(allRoles)) : [primaryRole],
      userId: typeof parsed.userId === "number" || typeof parsed.userId === "string" ? parsed.userId : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
    };
  } catch {
    return null;
  }
}
