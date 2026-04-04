"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { applyBrandTheme, applyBrandFont, useBrandStore, type BrandTheme, type BrandFont } from "@/store/brand-store";
import { institutionalService } from "@/lib/api/institutional";
import { settingsService } from "@/lib/api/settings";

/**
 * Branding load priority (highest wins):
 *   1. Cookies — applied instantly to prevent flash
 *   2. Platform default — from GET /api/v1/platform/branding (admin-set)
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

    // 2. Load platform default for all authenticated users
    settingsService.getPlatformBranding()
      .then((platformBranding) => {
        applyBrandTheme((platformBranding.theme as BrandTheme) || "default");
        applyBrandFont((platformBranding.font as BrandFont) || "system");

        // 3. Org users override platform branding with their own
        return institutionalService.getOrganization()
          .then((org) => {
            const orgId = (org as Record<string, unknown> | null)?.id as string | number | undefined;
            if (orgId) syncFromApi(orgId);
          })
          .catch(() => {});
      })
      .catch(() => {
        // Platform branding unavailable — still try org branding
        institutionalService.getOrganization()
          .then((org) => {
            const orgId = (org as Record<string, unknown> | null)?.id as string | number | undefined;
            if (orgId) syncFromApi(orgId);
          })
          .catch(() => {});
      });
  }, [syncFromApi]);

  return <>{children}</>;
}
