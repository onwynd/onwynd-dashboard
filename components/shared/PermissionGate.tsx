"use client";

import { usePermission } from "@/lib/permissions/hooks";
import type { Permission, Resource } from "@/lib/permissions/config";

interface PermissionGateProps {
  resource: Resource;
  permission: Permission;
  /** Rendered when permission granted */
  children: React.ReactNode;
  /** Optional fallback when permission denied (default: null) */
  fallback?: React.ReactNode;
}

/**
 * PermissionGate
 * ──────────────
 * Conditionally renders children based on the current user's role permissions.
 *
 * Example — hide Delete button from non-admins:
 *   <PermissionGate resource="users" permission="delete">
 *     <Button variant="destructive">Delete User</Button>
 *   </PermissionGate>
 *
 * Example — show read-only notice to viewers:
 *   <PermissionGate resource="finance" permission="write"
 *     fallback={<p>Read-only access</p>}>
 *     <InvoiceForm />
 *   </PermissionGate>
 */
export function PermissionGate({
  resource,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermission();
  return can(resource, permission) ? <>{children}</> : <>{fallback}</>;
}
