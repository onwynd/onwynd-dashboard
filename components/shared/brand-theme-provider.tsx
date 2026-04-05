"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { applyBrandTheme, applyBrandFont, useBrandStore, type BrandTheme, type BrandFont } from "@/store/brand-store";
import { institutionalService } from "@/lib/api/institutional";
import { settingsService } from "@/lib/api/settings";

const ORG_ROLES = new Set([
  "institutional", "institution_admin", "university_admin",
  "ngo_admin", "partner", "center",
]);

function isOrgUser(): boolean {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const role: string = u?.role?.slug ?? u?.role ?? "";
    const allRoles: string[] = u?.all_roles ?? (role ? [role] : []);
    return allRoles.some((r) => ORG_ROLES.has(r));
  } catch {
    return false;
  }
}

/**
 * Branding load priority (highest wins):
 *   1. Cookies — applied instantly to prevent flash
 *   2. Platform default — from GET /api/v1/admin/platform/branding (admin-set, silently skipped for non-admins)
 *   3. Org override — from GET /organizations/{id}/branding (institutional users only)
 */
export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const syncFromApi = useBrandStore((s) => s.syncFromApi);

  useEffect(() => {
    // 1. Apply cookies immediately — no flash
    const theme = (Cookies.get("brand_theme") as BrandTheme) || "default";
    const font = (Cookies.get("brand_font") as BrandFont) || "system";
    applyBrandTheme(theme);
    applyBrandFont(font);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const tryOrgBranding = () => {
      if (!isOrgUser()) return;
      institutionalService.getOrganization()
        .then((org) => {
          const orgId = (org as Record<string, unknown> | null)?.id as string | number | undefined;
          if (orgId) syncFromApi(orgId);
        })
        .catch(() => {});
    };

    // 2. Load platform default — silently fails for non-admin users
    settingsService.getPlatformBranding()
      .then((platformBranding) => {
        applyBrandTheme((platformBranding.theme as BrandTheme) || "default");
        applyBrandFont((platformBranding.font as BrandFont) || "system");
        tryOrgBranding();
      })
      .catch(() => {
        // Not an admin — skip platform branding, still try org override
        tryOrgBranding();
      });
  }, [syncFromApi]);

  return <>{children}</>;
}
