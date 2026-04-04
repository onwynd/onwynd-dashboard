"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/lib/api/admin";
import client from "@/lib/api/client";
import { format, subDays } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import {
  Download, BarChart3, Users, CreditCard, Activity,
  TrendingUp, RefreshCw, DollarSign, Percent, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

const TEAL = "#2A7A6A";
const TEAL_LIGHT = "#e6f4f1";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtNum = (n: number) => (n ?? 0).toLocaleString("en-NG");
const fmtPct = (n: number) => `${(n ?? 0).toFixed(1)}%`;

function formatTooltipCurrency(value: ValueType | undefined) {
  if (value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return fmt(value);
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? fmt(parsedValue) : value;
  }

  if (Array.isArray(value) && value.length > 0) {
    const [firstValue] = value;
    if (typeof firstValue === "number") {
      return fmt(firstValue);
    }
    if (typeof firstValue === "string") {
      const parsedValue = Number(firstValue);
      return Number.isFinite(parsedValue) ? fmt(parsedValue) : firstValue;
    }
  }

  return "";
}

interface FinancialReport {
  total_revenue?: number;
  total_subscriptions?: number;
  active_subscriptions?: number;
  mrr?: number;
  arr?: number;
  currency?: string;
  period?: string;
  total_commission?: number;
  net_therapist_payout?: number;
  total_sessions?: number;
  avg_commission_per_session?: number;
  breakdown?: Array<{ label: string; value: number }>;
  trend?: Array<{ date: string; revenue: number; commission: number }>;
}

interface UserGrowthReport {
  total_users?: number;
  new_users_this_period?: number;
  active_users?: number;
  churn_rate?: number;
  retention_rate?: number;
  growth_rate?: number;
  by_role?: Array<{ role: string; count: number }>;
  trend?: Array<{ date: string; count: number }>;
}

const REPORT_CARDS = [
  {
    id: "financial",
    endpoint: "/api/v1/admin/reports/financial",
    title: "Financial Performance",
    description: "Revenue, commissions, payouts, and transaction history.",
    icon: CreditCard,
    color: "bg-emerald-50 text-emerald-700",
    accent: "border-emerald-200",
  },
  {
    id: "user-growth",
    endpoint: "/api/v1/admin/reports/user-growth",
    title: "User Growth & Retention",
    description: "New signups, active users, churn, and role breakdown.",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
    accent: "border-blue-200",
  },
  {
    id: "sessions",
    endpoint: "/api/v1/admin/reports/sessions",
    title: "Session Analytics",
    description: "Total sessions, completion rates, and feedback scores.",
    icon: Activity,
    color: "bg-purple-50 text-purple-700",
    accent: "border-purple-200",
  },
  {
    id: "clinical",
    endpoint: "/api/v1/admin/reports/clinical",
    title: "Clinical Risk Log",
    description: "Critical escalations, crisis alerts, and flagged sessions.",
    icon: BarChart3,
    color: "bg-red-50 text-red-700",
    accent: "border-red-200",
  },
];

const QUICK_RANGES = [
  { label: "Last 7 days",  days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year",    days: 365 },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [growth, setGrowth] = useState<UserGrowthReport | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const loadInsights = useCallback(async () => {
    setInsightLoading(true);
    try {
      const [fin, gr] = await Promise.all([
        adminService.getFinancialReport({ start_date: dateRange.start, end_date: dateRange.end }),
        adminService.getUserGrowthReport({ start_date: dateRange.start, end_date: dateRange.end }),
      ]);
      setFinancial((fin as any) ?? null);
      setGrowth((gr as any) ?? null);
    } catch {
      // silently ignore — insights are supplementary
    } finally {
      setInsightLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  const applyQuickRange = (days: number) => {
    setDateRange({
      start: format(subDays(new Date(), days), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const downloadReport = async (card: typeof REPORT_CARDS[number]) => {
    setDownloading(card.id);
    try {
      const res = await client.get(card.endpoint, {
        params: { start_date: dateRange.start, end_date: dateRange.end, format: "csv" },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `onwynd_${card.id}_${format(new Date(), "yyyyMMdd")}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Report downloaded", description: `${card.title} exported as CSV.` });
    } catch {
      toast({ title: "Download failed", description: "Could not generate this report.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  // Build revenue trend data
  const revenueTrend: Array<{ date: string; Revenue: number; Commission: number }> =
    (financial?.trend ?? []).map((d) => ({
      date: d.date,
      Revenue: d.revenue ?? 0,
      Commission: d.commission ?? 0,
    }));

  const userTrend: Array<{ date: string; Users: number }> =
    (growth?.trend ?? []).map((d) => ({ date: d.date, Users: d.count ?? 0 }));

  const byRole: Array<{ role: string; count: number }> = growth?.by_role ?? [];

  const totalRevenue = financial?.total_revenue ?? 0;
  const totalCommission = financial?.total_commission ?? 0;
  const netPayout = financial?.net_therapist_payout ?? (totalRevenue - totalCommission);
  const totalSessions = financial?.total_sessions ?? 0;
  const avgCommission = financial?.avg_commission_per_session
    ?? (totalSessions > 0 ? totalCommission / totalSessions : 0);

  const kpiCards = [
    {
      label: "Gross Revenue",
      value: fmt(totalRevenue),
      icon: DollarSign,
      sub: `${dateRange.start} → ${dateRange.end}`,
      up: true,
    },
    {
      label: "Platform Commission",
      value: fmt(totalCommission),
      icon: Percent,
      sub: totalSessions > 0 ? `${fmt(avgCommission)} / session` : "—",
      up: true,
    },
    {
      label: "Net Therapist Payout",
      value: fmt(netPayout),
      icon: CreditCard,
      sub: "After Onwynd commission",
      up: false,
    },
    {
      label: "Total Sessions",
      value: fmtNum(totalSessions),
      icon: Activity,
      sub: financial?.mrr ? `MRR ${fmt(financial.mrr)}` : "Completed & paid",
      up: true,
    },
    {
      label: "Total Users",
      value: fmtNum(growth?.total_users ?? 0),
      icon: Users,
      sub: growth?.new_users_this_period != null
        ? `+${fmtNum(growth.new_users_this_period)} new this period`
        : "All roles",
      up: true,
    },
    {
      label: "Retention Rate",
      value: fmtPct(growth?.retention_rate ?? 0),
      icon: TrendingUp,
      sub: growth?.churn_rate != null ? `Churn: ${fmtPct(growth.churn_rate)}` : "—",
      up: (growth?.retention_rate ?? 0) > 70,
    },
  ];

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Onwynd brand mark */}
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: TEAL }}
          >
            On
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Reports</h1>
            <p className="text-sm text-muted-foreground">Onwynd · Admin Intelligence Centre</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={loadInsights}
          disabled={insightLoading}
        >
          <RefreshCw className={`h-4 w-4 ${insightLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Date Range Controls */}
      <Card className="border" style={{ borderColor: TEAL + "30" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold" style={{ color: TEAL }}>
            Report Period
          </CardTitle>
          <CardDescription>All reports and charts respect this date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start" className="text-xs">From</Label>
              <Input
                type="date"
                id="start"
                value={dateRange.start}
                onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                className="h-9 text-sm w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end" className="text-xs">To</Label>
              <Input
                type="date"
                id="end"
                value={dateRange.end}
                onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                className="h-9 text-sm w-44"
              />
            </div>
            <div className="flex flex-wrap gap-2 pb-0.5">
              {QUICK_RANGES.map((r) => (
                <Button
                  key={r.days}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => applyQuickRange(r.days)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Period Summary
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insightLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : kpiCards.map((k) => (
                <Card key={k.label} className="relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                    style={{ background: TEAL }}
                  />
                  <CardContent className="pt-4 pb-4 pl-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
                        <p className="text-xl font-bold tracking-tight">{k.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
                      </div>
                      <div
                        className="p-2 rounded-lg shrink-0"
                        style={{ background: TEAL_LIGHT }}
                      >
                        <k.icon className="h-4 w-4" style={{ color: TEAL }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue vs Commission chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: TEAL }} />
              Revenue vs Commission
            </CardTitle>
            <CardDescription className="text-xs">Gross revenue and Onwynd commission earned over time</CardDescription>
          </CardHeader>
          <CardContent>
            {insightLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : revenueTrend.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No revenue data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={208}>
                <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="com" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={formatTooltipCurrency}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Revenue" stroke={TEAL} fill="url(#rev)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Commission" stroke="#f59e0b" fill="url(#com)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User growth chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: TEAL }} />
              User Growth
            </CardTitle>
            <CardDescription className="text-xs">New registrations over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {insightLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : userTrend.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No user growth data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={208}>
                <BarChart data={userTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="Users" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role breakdown (if available) */}
      {byRole.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {byRole.map((r) => (
              <div
                key={r.role}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: TEAL + "40", background: TEAL_LIGHT }}
              >
                <span className="capitalize font-medium" style={{ color: TEAL }}>{r.role}</span>
                <Badge variant="secondary" className="font-bold text-xs">{fmtNum(r.count)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Download Report Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Export Reports
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_CARDS.map((report) => (
            <Card
              key={report.id}
              className={`hover:shadow-md transition-shadow border ${report.accent}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
                <div className={`p-2 rounded-full ${report.color}`}>
                  <report.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{report.description}</p>
                <Button
                  className="w-full gap-1.5 text-xs"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(report)}
                  disabled={downloading === report.id}
                >
                  {downloading === report.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  {downloading === report.id ? "Generating…" : "Export CSV"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer brand */}
      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <span>
          Onwynd Platform · Admin Intelligence Centre
        </span>
        <span>
          Period: {dateRange.start} → {dateRange.end}
        </span>
      </div>
    </main>
  );
}
