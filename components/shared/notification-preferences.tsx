"use client";

import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { userService, ROLE_EXTRA_CATEGORIES, type NotificationPreferences } from "@/lib/api/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Bell, MessageSquare, Smartphone, ShieldAlert, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// ── Channel + Category config ─────────────────────────────────────────────

interface ChannelConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface CategoryConfig {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  channels: ChannelConfig[];
  /** If true, renders a severity threshold selector in addition to channel toggles */
  hasSeveritySelector?: boolean;
  /** Badge shown next to the title */
  badge?: { label: string; variant: 'destructive' | 'secondary' | 'outline' };
  /** Tooltip note below channels */
  note?: string;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email:    <Mail className="size-3.5" />,
  push:     <Smartphone className="size-3.5" />,
  whatsapp: <MessageSquare className="size-3.5" />,
  in_app:   <Bell className="size-3.5" />,
};

// Base categories every role sees
const BASE_CATEGORIES: CategoryConfig[] = [
  {
    key: "session_reminders",
    label: "Session reminders",
    description: "Upcoming session alerts, join links, 24h and 1h reminders.",
    channels: [
      { key: "email",    label: "Email",    icon: CHANNEL_ICONS.email },
      { key: "push",     label: "Push",     icon: CHANNEL_ICONS.push },
      { key: "whatsapp", label: "WhatsApp", icon: CHANNEL_ICONS.whatsapp },
      { key: "in_app",   label: "In-app",   icon: CHANNEL_ICONS.in_app },
    ],
  },
  {
    key: "wellbeing_checkins",
    label: "Wellbeing check-ins",
    description: "Post-session follow-ups and inactivity nudges.",
    channels: [
      { key: "push",   label: "Push",   icon: CHANNEL_ICONS.push },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
  },
  {
    key: "new_messages",
    label: "New messages",
    description: "Chat messages and in-app communications.",
    channels: [
      { key: "push",   label: "Push",   icon: CHANNEL_ICONS.push },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
  },
  {
    key: "payment_receipts",
    label: "Payments & receipts",
    description: "Booking confirmations, refunds, and payment alerts.",
    channels: [
      { key: "email",  label: "Email",  icon: CHANNEL_ICONS.email },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
  },
  {
    key: "platform_updates",
    label: "Platform updates",
    description: "New features, maintenance notices, and policy changes.",
    channels: [
      { key: "email",  label: "Email",  icon: CHANNEL_ICONS.email },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
  },
  {
    key: "promotional",
    label: "Promotions & offers",
    description: "Discounts, referral rewards, and special campaigns.",
    channels: [
      { key: "email", label: "Email", icon: CHANNEL_ICONS.email },
    ],
  },
];

// Role-specific extra categories
const ROLE_SPECIFIC_CATEGORIES: Record<keyof NotificationPreferences, CategoryConfig> = {
  // Clinical / admin: Doctor Onwynd AI distress flags
  distress_alerts: {
    key: "distress_alerts",
    label: "Distress alerts",
    description: "Alerts raised by Doctor Onwynd when a user's conversation signals emotional risk. You control which channels notify you and the minimum severity that triggers an alert.",
    badge: { label: "Clinical", variant: "destructive" },
    hasSeveritySelector: true,
    channels: [
      { key: "email",  label: "Email",  icon: CHANNEL_ICONS.email },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
    note: "Critical-severity alerts are always delivered via in-app regardless of this setting.",
  },
  // Institutional roles: distress alerts about their own members/employees
  member_distress: {
    key: "member_distress",
    label: "Member distress alerts",
    description: "Anonymised alerts when a member of your organisation is flagged as at-risk. No personally identifiable information is included in the notification body.",
    badge: { label: "Org", variant: "secondary" },
    hasSeveritySelector: true,
    channels: [
      { key: "email",  label: "Email",  icon: CHANNEL_ICONS.email },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
    note: "The full flag details are only visible inside the platform to authorised administrators.",
  },
  // Institutional roles: credit warnings
  org_credits: {
    key: "org_credits",
    label: "Organisation credit alerts",
    description: "Notifications when your organisation's session credits run low or are exhausted.",
    channels: [
      { key: "email",  label: "Email",  icon: CHANNEL_ICONS.email },
      { key: "in_app", label: "In-app", icon: CHANNEL_ICONS.in_app },
    ],
  },
  // Stubs so the type is exhaustive — never rendered directly
  session_reminders: BASE_CATEGORIES[0],
  wellbeing_checkins: BASE_CATEGORIES[1],
  new_messages: BASE_CATEGORIES[2],
  payment_receipts: BASE_CATEGORIES[3],
  platform_updates: BASE_CATEGORIES[4],
  promotional: BASE_CATEGORIES[5],
};

const SEVERITY_OPTIONS = [
  { value: "any",      label: "Any severity" },
  { value: "medium",   label: "Medium and above" },
  { value: "high",     label: "High and above" },
  { value: "critical", label: "Critical only" },
];

// ── Component ────────────────────────────────────────────────────────────────

export function NotificationPreferencesPanel() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [roleCategories, setRoleCategories] = useState<CategoryConfig[]>([]);

  // Determine role-specific extra categories from cookie
  useEffect(() => {
    const allRolesRaw = Cookies.get('user_all_roles');
    const primaryRole = Cookies.get('user_role') ?? '';
    let roles: string[] = [primaryRole];
    try {
      if (allRolesRaw) roles = JSON.parse(allRolesRaw);
    } catch { /* ignore */ }

    // Collect unique extra category keys across all user roles
    const extraKeys = new Set<keyof NotificationPreferences>();
    roles.forEach((role) => {
      (ROLE_EXTRA_CATEGORIES[role] ?? []).forEach((k) => extraKeys.add(k));
    });

    setRoleCategories(
      Array.from(extraKeys).map((k) => ROLE_SPECIFIC_CATEGORIES[k]).filter(Boolean)
    );
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await userService.getNotificationPreferences();
      setPrefs(data);
    } catch {
      toast({ title: "Could not load notification preferences", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (category: keyof NotificationPreferences, channel: string, value: boolean) => {
    setPrefs((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...(prev[category] as Record<string, unknown>),
          [channel]: value,
        },
      };
    });
    setDirty(true);
  };

  const setSeverity = (category: keyof NotificationPreferences, value: string) => {
    setPrefs((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...(prev[category] as Record<string, unknown>),
          severity_threshold: value,
        },
      };
    });
    setDirty(true);
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await userService.updateNotificationPreferences(prefs);
      setPrefs(updated);
      setDirty(false);
      toast({ title: "Preferences saved" });
    } catch {
      toast({ title: "Failed to save preferences", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prefs) return null;

  const allCategories = [...BASE_CATEGORIES, ...roleCategories];

  return (
    <div className="space-y-4">
      {allCategories.map((cat) => {
        const catPrefs = (prefs[cat.key] ?? {}) as Record<string, unknown>;
        const severityValue = (catPrefs.severity_threshold as string | undefined) ?? 'any';

        return (
          <Card key={cat.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {cat.badge?.variant === 'destructive' && (
                  <ShieldAlert className="size-4 text-destructive" />
                )}
                <CardTitle className="text-sm font-semibold">{cat.label}</CardTitle>
                {cat.badge && (
                  <Badge variant={cat.badge.variant} className="text-[10px] px-1.5 py-0">
                    {cat.badge.label}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">{cat.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {cat.channels.map((ch) => {
                  const enabled = (catPrefs[ch.key] as boolean | undefined) ?? false;
                  const id = `${cat.key}-${ch.key}`;
                  return (
                    <div key={ch.key} className="flex items-center gap-2">
                      <Switch
                        id={id}
                        checked={enabled}
                        onCheckedChange={(val) => toggle(cat.key, ch.key, val)}
                      />
                      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        {ch.icon}
                        {ch.label}
                      </Label>
                    </div>
                  );
                })}
              </div>

              {cat.hasSeveritySelector && (
                <div className="flex items-center gap-3 pt-1">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">
                    Minimum severity
                  </Label>
                  <Select value={severityValue} onValueChange={(v) => v !== null && setSeverity(cat.key, v)}>
                    <SelectTrigger className="h-8 text-xs w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {cat.note && (
                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="size-3 mt-0.5 shrink-0" />
                  {cat.note}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={!dirty || saving} size="sm">
          {saving && <Loader2 className="size-3.5 mr-2 animate-spin" />}
          Save preferences
        </Button>
      </div>
    </div>
  );
}
