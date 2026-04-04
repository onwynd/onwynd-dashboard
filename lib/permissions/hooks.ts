"use client";

import { useMemo } from "react";
import Cookies from "js-cookie";
import { hasPermission, type Permission, type Resource } from "./config";

/**
 * usePermission
 * ─────────────
 * Returns a `can(resource, permission)` function scoped to the current user's role.
 *
 * Reads role from the `user_role` cookie (set by auth.ts on login).
 *
 * Usage:
 *   const { can, role } = usePermission();
 *   can('finance', 'write')    // → boolean
 *   can('users', 'delete')     // → boolean
 *
 * Multi-role: if user has multiple roles (user_all_roles cookie), returns true
 * if ANY of their roles grants the permission.
 */
export function usePermission() {
  const role  = Cookies.get("user_role") ?? "";
  const allRolesRaw = Cookies.get("user_all_roles");

  const allRoles = useMemo<string[]>(() => {
    try {
      return allRolesRaw ? JSON.parse(allRolesRaw) : (role ? [role] : []);
    } catch {
      return role ? [role] : [];
    }
  }, [role, allRolesRaw]);

  const can = useMemo(
    () =>
      (resource: Resource, permission: Permission): boolean =>
        allRoles.some((r) => hasPermission(r, resource, permission)),
    [allRoles],
  );

  return { can, role, allRoles };
}
