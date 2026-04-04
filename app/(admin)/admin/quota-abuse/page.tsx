"use client";

// DB18: Admin Quota Abuse — system-level signals from /admin/quota/overview
//        + per-user manual overrides from /admin/distress-overrides

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ShieldAlert, Info, Search, X } from "lucide-react";
import { adminService } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

interface QuotaOverview {
  global_defaults?: {
    free_ai_messages?: number;
    free_daily_activities?: number;
    abuse_cap_messages?: number;
    distress_extension_messages?: number;
    new_user_ai_messages?: number;
    new_user_days?: number;
  };
  stats?: {
    ai_429_today?: number;
    ai_messages_today?: number;
    activities_today?: number;
  };
  plans?: Array<{ id: number | string; name: string; slug?: string }>;
}

interface StatItem {
  label: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}

interface OverrideUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  has_unlimited_quota: boolean;
  custom_ai_messages: number | null;
  custom_daily_activities: number | null;
  grace_period_days: number | null;
  quota_override_expires_at: string | null;
}

interface PaginatedOverrides {
  data: OverrideUser[];
  total: number;
  current_page: number;
  last_page: number;
}

export default function QuotaAbusePage() {
  const [overview, setOverview] = useState<QuotaOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const [overrides, setOverrides] = useState<PaginatedOverrides | null>(null);
  const [overridesLoading, setOverridesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [revoking, setRevoking] = useState<number | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await adminService.getQuotaOverages({})) as QuotaOverview;
      setOverview(data ?? null);
    } catch {
      toast({ description: "Failed to load quota data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOverrides = useCallback(async (s = search) => {
    setOverridesLoading(true);
    try {
      const data = await adminService.getDistressOverrides({ search: s || undefined, per_page: 20 });
      // Handle both paginated and plain array responses
      if (Array.isArray(data)) {
        setOverrides({ data, total: data.length, current_page: 1, last_page: 1 });
      } else {
        setOverrides(data as PaginatedOverrides);
      }
    } catch {
      toast({ description: "Failed to load user overrides.", variant: "destructive" });
    } finally {
      setOverridesLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchOverrides(""); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRevoke(user: OverrideUser) {
    if (!confirm(`Revoke quota override for ${user.first_name} ${user.last_name}?`)) return;
    setRevoking(user.id);
    try {
      await adminService.revokeDistressOverride(user.id);
      toast({ description: `Override revoked for ${user.first_name}.` });
      fetchOverrides(search);
    } catch {
      toast({ description: "Failed to revoke override.", variant: "destructive" });
    } finally {
      setRevoking(null);
    }
  }

  const stats: StatItem[] = overview?.stats
    ? [
        {
          label: "AI 429s Today",
          value: overview.stats.ai_429_today ?? 0,
          description: "Quota-exceeded responses returned today — high values indicate active abuse or low limits.",
          highlight: (overview.stats.ai_429_today ?? 0) > 50,
        },
        {
          label: "AI Messages Today",
          value: (overview.stats.ai_messages_today ?? 0).toLocaleString(),
          description: "Total AI companion messages processed today across all users.",
        },
        {
          label: "Activities Today",
          value: (overview.stats.activities_today ?? 0).toLocaleString(),
          description: "Total activity logs recorded today (moods, habits, journals, etc.).",
        },
        {
          label: "Abuse Cap Limit",
          value: overview.global_defaults?.abuse_cap_messages ?? "—",
          description: "Max messages allowed for users detected in rapid-fire / spam patterns.",
        },
      ]
    : [];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Quota Abuse Signals
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            System-level quota health and users with active manual quota overrides.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => { fetchOverview(); fetchOverrides(search); }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="flex items-start gap-3 pt-4">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">System signals are aggregate — not per-user.</span>{" "}
            Per-user quota overrides are managed below. To adjust individual limits, visit the{" "}
            <Link href="/admin/users" className="underline font-medium">Users page</Link>{" "}
            or the{" "}
            <Link href="/admin/settings" className="underline font-medium">Quota Settings tab</Link>.
          </div>
        </CardContent>
      </Card>

      {/* Today's quota signals */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className={s.highlight ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${s.highlight ? "text-red-700 dark:text-red-400" : ""}`}>
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${s.highlight ? "text-red-700 dark:text-red-400" : ""}`}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Global defaults */}
          {overview?.global_defaults && (
            <Card>
              <CardHeader>
                <CardTitle>Current Quota Defaults</CardTitle>
                <CardDescription>
                  Global limits enforced by the AI quota middleware. Adjust in{" "}
                  <Link href="/admin/settings" className="underline">Settings → Quotas</Link>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    { key: "free_ai_messages",            label: "Free AI messages/day" },
                    { key: "free_daily_activities",       label: "Free activities/day" },
                    { key: "abuse_cap_messages",          label: "Abuse cap (messages)" },
                    { key: "distress_extension_messages", label: "Distress extension" },
                    { key: "new_user_ai_messages",        label: "New user messages" },
                    { key: "new_user_days",               label: "New user grace (days)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <span className="font-semibold">
                        {String((overview.global_defaults as Record<string, unknown>)?.[key] ?? "—")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Per-user overrides table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Users with Active Quota Overrides</CardTitle>
              <CardDescription>
                Users who have been granted unlimited quota, custom limits, or grace period extensions.
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 w-56"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchOverrides(search)}
                />
                {search && (
                  <button className="absolute right-2.5 top-2.5" onClick={() => { setSearch(""); fetchOverrides(""); }}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchOverrides(search)}>Search</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {overridesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !overrides || overrides.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users with active quota overrides.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">AI Limit</th>
                    <th className="pb-3 pr-4 font-medium">Activity Limit</th>
                    <th className="pb-3 pr-4 font-medium">Grace Days</th>
                    <th className="pb-3 pr-4 font-medium">Expires</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overrides.data.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{u.first_name} {u.last_name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                        {u.has_unlimited_quota && (
                          <Badge variant="destructive" className="mt-1 text-xs">Unlimited</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {u.custom_ai_messages != null ? u.custom_ai_messages : <span className="text-muted-foreground">default</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {u.custom_daily_activities != null ? u.custom_daily_activities : <span className="text-muted-foreground">default</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {u.grace_period_days != null ? u.grace_period_days : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {u.quota_override_expires_at
                          ? new Date(u.quota_override_expires_at).toLocaleDateString()
                          : <span className="text-muted-foreground">Never</span>}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={revoking === u.id}
                          onClick={() => handleRevoke(u)}
                        >
                          {revoking === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revoke"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overrides.last_page > 1 && (
                <p className="text-xs text-muted-foreground mt-3 text-right">
                  Page {overrides.current_page} of {overrides.last_page} — {overrides.total} total
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
