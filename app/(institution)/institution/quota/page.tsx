"use client";

// F3  B2B Per-Seat Quota Usage Dashboard for HR / Institution Admins.

import { useEffect, useState } from "react";
import { institutionalService } from "@/lib/api/institutional";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";

interface SeatActivity {
  seat_number: number;
  last_active_at: string | null;
  sessions_count: number;
  ai_conversations_count: number;
  is_at_risk: boolean;
  risk_reason?: string;
}

interface QuotaUsageData {
  total_seats: number;
  used_seats: number;
  active_seats: number;
  at_risk_seats: number;
  utilization_rate: number;
  plan_name: string;
  renewal_date?: string;
  seat_activity: SeatActivity[];
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function QuotaUsagePage() {
  const [data, setData] = useState<QuotaUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "at_risk" | "active">("all");

  useEffect(() => {
    institutionalService.getQuotaUsage()
      .then((res: any) => setData(res as QuotaUsageData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const seats = data?.seat_activity ?? [];
  const filtered = seats.filter((s) => {
    if (filter === "at_risk") return s.is_at_risk;
    if (filter === "active") return !s.is_at_risk && s.sessions_count > 0;
    return true;
  });

  const utilizationPct = data ? Math.round(data.utilization_rate * 100) : 0;
  const utilizationColor = utilizationPct >= 80 ? "text-emerald-600" : utilizationPct >= 50 ? "text-amber-600" : "text-red-600";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Seat Quota Usage</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor employee engagement and identify at-risk members. All data is anonymized.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Seats</p>
              <p className="text-2xl font-bold">{data?.total_seats ?? ""}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{data?.plan_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Seats</p>
              <p className="text-2xl font-bold">{data?.active_seats ?? ""}</p>
              <p className={`text-xs font-semibold mt-0.5 ${utilizationColor}`}>{utilizationPct}% utilization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">At-Risk Seats</p>
              <p className="text-2xl font-bold">{data?.at_risk_seats ?? ""}</p>
              <p className="text-xs text-muted-foreground mt-0.5">No activity &gt;14d</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Used Seats</p>
              <p className="text-2xl font-bold">{data?.used_seats ?? ""}</p>
              {data?.renewal_date && (
                <p className="text-xs text-muted-foreground mt-0.5">Renews {formatDate(data.renewal_date)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization bar */}
      {data && (
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Seat Utilization</span>
            <span className={`text-sm font-bold ${utilizationColor}`}>{data.active_seats} / {data.total_seats} active</span>
          </div>
          <div className="h-3 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${utilizationPct >= 80 ? "bg-emerald-500" : utilizationPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.at_risk_seats > 0
              ? `${data.at_risk_seats} seat(s) are at risk of churn  consider sending a wellness nudge.`
              : "All active seats show healthy engagement."}
          </p>
        </div>
      )}

      {/* Seat activity table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Anonymized Seat Activity</CardTitle>
          <div className="flex gap-2">
            {(["all", "at_risk", "active"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f === "all" ? "All" : f === "at_risk" ? "At Risk" : "Active"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No seats match this filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat #</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">AI Conversations</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((seat) => (
                  <TableRow key={seat.seat_number}>
                    <TableCell className="font-mono text-sm">#{String(seat.seat_number).padStart(3, "0")}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(seat.last_active_at)}</TableCell>
                    <TableCell className="text-right">{seat.sessions_count}</TableCell>
                    <TableCell className="text-right">{seat.ai_conversations_count}</TableCell>
                    <TableCell>
                      {seat.is_at_risk ? (
                        <Badge variant="destructive" className="text-xs">
                          At Risk{seat.risk_reason ? `  ${seat.risk_reason}` : ""}
                        </Badge>
                      ) : seat.sessions_count > 0 ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Unused</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        All seat data is fully anonymized. No personally identifiable information is displayed.
      </p>
    </div>
  );
}
