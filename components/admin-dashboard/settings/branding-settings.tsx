"use client";

import { useState, useEffect } from "react";
import { useBrandStore, type BrandTheme, type BrandFont } from "@/store/brand-store";
import { settingsService } from "@/lib/api/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Palette, Type, RotateCcw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const THEME_OPTIONS: { value: BrandTheme; label: string; description: string }[] = [
  {
    value: "default",
    label: "Default (Shadcn)",
    description: "Standard dark/light system palette. Neutral grays and blacks.",
  },
  {
    value: "onwynd",
    label: "Onwynd Brand",
    description: "Teal primary (#0D7D6B), navy structural (#0A1628), amber accents (#C8922A).",
  },
];

const FONT_OPTIONS: { value: BrandFont; label: string; description: string }[] = [
  {
    value: "system",
    label: "System / Geist",
    description: "Default Geist Sans — clean and modern.",
  },
  {
    value: "calibri",
    label: "Calibri",
    description: "Microsoft Calibri — warmer, more approachable feel.",
  },
];

type WebColorKey = "forest" | "healing" | "breath" | "pale" | "clay" | "warm_clay" | "bone" | "ink";
type WebColors = Record<WebColorKey, string>;

const OW_DEFAULTS: WebColors = {
  forest:    "#122420",
  healing:   "#2A7A6A",
  breath:    "#3AA090",
  pale:      "#8EC4BA",
  clay:      "#C4561A",
  warm_clay: "#E07A45",
  bone:      "#F5F0E6",
  ink:       "#0A0E0C",
};

const WEB_COLOR_META: { key: WebColorKey; label: string; role: string }[] = [
  { key: "forest",    label: "Forest Teal",  role: "Primary background · Brand anchor" },
  { key: "healing",   label: "Healing Teal", role: "Accent · Borders · Active states" },
  { key: "breath",    label: "Breath Teal",  role: "Interactive · Links · Highlights" },
  { key: "pale",      label: "Pale Teal",    role: "Body text on dark · Subtle UI" },
  { key: "clay",      label: "Clay",         role: "CTA · Primary action · Lotus core" },
  { key: "warm_clay", label: "Warm Clay",    role: "Secondary action · Hover states" },
  { key: "bone",      label: "Bone Cream",   role: "Primary text on dark · Light bg" },
  { key: "ink",       label: "Ink",          role: "Deep background · Max contrast" },
];

interface Props {
  /** 'admin' saves to global platform Settings; 'org' saves to the org via brand store (default) */
  mode?: "admin" | "org";
}

export function BrandingSettings({ mode = "org" }: Props) {
  // Org mode — use brand store (already wired to org API)
  const brandStore = useBrandStore();

  // Admin mode — local state, reads/writes global settings
  const [adminTheme, setAdminTheme] = useState<BrandTheme>("default");
  const [adminFont, setAdminFont] = useState<BrandFont>("system");
  const [webColors, setWebColors] = useState<WebColors>({ ...OW_DEFAULTS });
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

  useEffect(() => {
    if (mode !== "admin") return;
    settingsService.getSettings().then((s: any) => {
      if (s?.branding?.theme) setAdminTheme(s.branding.theme as BrandTheme);
      if (s?.branding?.font) setAdminFont(s.branding.font as BrandFont);
      if (s?.branding?.web_colors) {
        setWebColors({ ...OW_DEFAULTS, ...s.branding.web_colors });
      }
    }).catch(() => {});
  }, [mode]);

  const theme = mode === "admin" ? adminTheme : brandStore.theme;
  const font  = mode === "admin" ? adminFont  : brandStore.font;

  const handleTheme = async (value: BrandTheme) => {
    if (mode === "admin") {
      setAdminTheme(value);
      setSavingTheme(true);
      try {
        await settingsService.updateSettings("branding", { theme: value, font: adminFont });
        toast.success("Platform branding saved.");
      } catch {
        toast.error("Failed to save branding.");
      } finally {
        setSavingTheme(false);
      }
    } else {
      brandStore.setTheme(value);
    }
  };

  const handleFont = async (value: BrandFont) => {
    if (mode === "admin") {
      setAdminFont(value);
      setSavingTheme(true);
      try {
        await settingsService.updateSettings("branding", { theme: adminTheme, font: value });
        toast.success("Platform branding saved.");
      } catch {
        toast.error("Failed to save branding.");
      } finally {
        setSavingTheme(false);
      }
    } else {
      brandStore.setFont(value);
    }
  };

  const handleReset = () => {
    handleTheme("default");
    handleFont("system");
  };

  const updateColor = (key: WebColorKey, value: string) => {
    setWebColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleUseDefaults = async () => {
    setWebColors({ ...OW_DEFAULTS });
    setSavingColors(true);
    try {
      await settingsService.updateSettings("branding", {
        theme: adminTheme,
        font: adminFont,
        web_colors: OW_DEFAULTS,
      });
      toast.success("Onwynd defaults applied to web.");
    } catch {
      toast.error("Failed to save web colours.");
    } finally {
      setSavingColors(false);
    }
  };

  const handleSaveWebColors = async () => {
    setSavingColors(true);
    try {
      await settingsService.updateSettings("branding", {
        theme: adminTheme,
        font: adminFont,
        web_colors: webColors,
      });
      toast.success("Web colours saved.");
    } catch {
      toast.error("Failed to save web colours.");
    } finally {
      setSavingColors(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Color Scheme ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-teal" />
            <CardTitle>Color Scheme</CardTitle>
          </div>
          <CardDescription>
            {mode === "admin"
              ? "Set the platform-wide default color scheme. Organizations can override this for their members."
              : "Choose your organization's color scheme. Overrides the platform default for your members."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {THEME_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer"
              onClick={() => handleTheme(opt.value)}
            >
              <div className="space-y-0.5">
                <Label className="text-base cursor-pointer flex items-center gap-2">
                  {opt.label}
                  {theme === opt.value && (
                    <Badge className="bg-teal/10 text-teal border-none text-[10px]">Active</Badge>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
                {opt.value === "onwynd" && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block w-5 h-5 rounded-full bg-[#0D7D6B]" title="Teal" />
                    <span className="inline-block w-5 h-5 rounded-full bg-[#0A1628]" title="Navy" />
                    <span className="inline-block w-5 h-5 rounded-full bg-[#C8922A]" title="Amber" />
                  </div>
                )}
              </div>
              <Switch
                checked={theme === opt.value}
                disabled={savingTheme}
                onCheckedChange={(checked) => { if (checked) handleTheme(opt.value); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Font Family ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-teal" />
            <CardTitle>Font Family</CardTitle>
          </div>
          <CardDescription>
            {mode === "admin"
              ? "Set the platform-wide default font. Organizations can override this for their members."
              : "Choose your organization's typeface. Applied immediately for all your members."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FONT_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer"
              onClick={() => handleFont(opt.value)}
            >
              <div className="space-y-0.5">
                <Label
                  className="text-base cursor-pointer flex items-center gap-2"
                  style={opt.value === "calibri" ? { fontFamily: "'Calibri', 'Calibri Light', system-ui, sans-serif" } : {}}
                >
                  {opt.label}
                  {font === opt.value && (
                    <Badge className="bg-teal/10 text-teal border-none text-[10px]">Active</Badge>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
              <Switch
                checked={font === opt.value}
                disabled={savingTheme}
                onCheckedChange={(checked) => { if (checked) handleFont(opt.value); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Reset dashboard theme ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={savingTheme}
          onClick={handleReset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Defaults
        </Button>
        <p className="text-xs text-muted-foreground">
          Resets both color scheme and font to system defaults.
        </p>
      </div>

      {/* ── Web Colours (admin only) ── */}
      {mode === "admin" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal" />
                <CardTitle>Web Colours</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Use Onwynd Defaults</span>
                <Switch
                  checked={JSON.stringify(webColors) === JSON.stringify(OW_DEFAULTS)}
                  disabled={savingColors}
                  onCheckedChange={(checked) => { if (checked) handleUseDefaults(); }}
                />
              </div>
            </div>
            <CardDescription>
              Control the colour palette of the public website (<code>/web</code>). Changes apply on next page load. Each colour maps to a CSS variable injected at runtime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {WEB_COLOR_META.map(({ key, label, role }) => (
              <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
                {/* Live swatch */}
                <div
                  className="w-8 h-8 rounded-md border flex-shrink-0"
                  style={{ backgroundColor: webColors[key] }}
                />
                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
                </div>
                {/* Native colour picker */}
                <input
                  type="color"
                  value={webColors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title={`Pick ${label}`}
                />
                {/* Hex input */}
                <Input
                  value={webColors[key]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) updateColor(key, val);
                  }}
                  className="w-28 font-mono text-sm"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                disabled={savingColors}
                onClick={handleSaveWebColors}
              >
                Save Web Colours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={savingColors}
                onClick={handleUseDefaults}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Onwynd Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
