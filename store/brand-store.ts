"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { institutionalService } from "@/lib/api/institutional";

export type BrandTheme = "default" | "onwynd";
export type BrandFont = "system" | "calibri";

interface BrandState {
  theme: BrandTheme;
  font: BrandFont;
  orgId: string | number | null;
  setOrgId: (id: string | number | null) => void;
  setTheme: (theme: BrandTheme) => void;
  setFont: (font: BrandFont) => void;
  syncFromApi: (orgId: string | number) => Promise<void>;
}

const COOKIE_OPTS = { expires: 365, path: "/" };

export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      theme: (Cookies.get("brand_theme") as BrandTheme) || "default",
      font: (Cookies.get("brand_font") as BrandFont) || "system",
      orgId: null,
      setOrgId: (id) => set({ orgId: id }),
      setTheme: (theme) => {
        Cookies.set("brand_theme", theme, COOKIE_OPTS);
        set({ theme });
        applyBrandTheme(theme);
        const { orgId } = get();
        if (orgId) {
          institutionalService.updateBranding(orgId, { theme }).catch(() => {});
        }
      },
      setFont: (font) => {
        Cookies.set("brand_font", font, COOKIE_OPTS);
        set({ font });
        applyBrandFont(font);
        const { orgId } = get();
        if (orgId) {
          institutionalService.updateBranding(orgId, { font }).catch(() => {});
        }
      },
      syncFromApi: async (orgId) => {
        try {
          const branding = await institutionalService.getBranding(orgId);
          const theme = (branding?.theme as BrandTheme) || "default";
          const font = (branding?.font as BrandFont) || "system";
          Cookies.set("brand_theme", theme, COOKIE_OPTS);
          Cookies.set("brand_font", font, COOKIE_OPTS);
          set({ theme, font, orgId });
          applyBrandTheme(theme);
          applyBrandFont(font);
        } catch {
          // Fall back to whatever is already in cookies/store
          set({ orgId });
        }
      },
    }),
    { name: "onwynd-brand" }
  )
);

/** Apply brand color tokens to the document root */
export function applyBrandTheme(theme: BrandTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "onwynd") {
    root.style.setProperty("--primary", "#0D7D6B");
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--ring", "#0D7D6B");
    root.style.setProperty("--sidebar-primary", "#0D7D6B");
    root.style.setProperty("--sidebar-primary-foreground", "#ffffff");
    root.style.setProperty("--sidebar-accent", "#E6F5F3");
    root.style.setProperty("--sidebar-accent-foreground", "#0D7D6B");
  } else {
    // Remove inline overrides — fall back to CSS file defaults
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--sidebar-primary");
    root.style.removeProperty("--sidebar-primary-foreground");
    root.style.removeProperty("--sidebar-accent");
    root.style.removeProperty("--sidebar-accent-foreground");
  }
}

/** Apply brand font to the document root */
export function applyBrandFont(font: BrandFont) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (font === "calibri") {
    root.style.setProperty("--font-sans", "'Calibri', 'Calibri Light', system-ui, sans-serif");
    root.style.setProperty("--font-geist-sans", "'Calibri', 'Calibri Light', system-ui, sans-serif");
  } else {
    root.style.removeProperty("--font-sans");
    root.style.removeProperty("--font-geist-sans");
  }
}
