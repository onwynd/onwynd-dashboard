
// filepath: lib/auth/roles.ts
import { getDashboardPathForRole as getCanonicalDashboardPathForRole } from "./role-routing";

export function getDashboardPathForRole(roleSlug: string): string {
  return getCanonicalDashboardPathForRole(roleSlug);
}
