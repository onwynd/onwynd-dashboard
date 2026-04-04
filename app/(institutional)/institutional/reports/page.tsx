"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { institutionalService } from "@/lib/api/institutional";
import { downloadCSV } from "@/lib/export-utils";

type Period = "7d" | "30d" | "90d";

type EngagementData = {
  organization?: string;
  period?: string;
  active_users?: number;
  sessions_completed?: number;
  ai_messages?: number;
  assessments_completed?: number;
  member_count?: number;
};

type MonthlyData = {
  organization?: string;
  month?: string;
  new_members?: number;
  sessions_completed?: number;
  ai_messages?: number;
  assessments_completed?: number;
};

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(true);

  // Monthly detail
  const currentYM = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(currentYM);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Fetch engagement on period change
  useEffect(() => {
    setEngagementLoading(true);
    institutionalService
      .getEngagement(period)
      .then((data) => setEngagement(data as EngagementData))
      .catch(() => setEngagement(null))
      .finally(() => setEngagementLoading(false));
  }, [period]);

  // Fetch monthly detail
  function fetchMonthly(month: string) {
    setMonthlyLoading(true);
    institutionalService
      .getMonthlyReport({ month })
      .then((data) => setMonthly(data as MonthlyData))
      .catch(() => setMonthly(null))
      .finally(() => setMonthlyLoading(false));
  }

  useEffect(() => {
    fetchMonthly(selectedMonth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const barData = useMemo(() => {
    if (!engagement) return [];
    return [
      { name: "Active Users", value: engagement.active_users ?? 0 },
      { name: "Sessions", value: engagement.sessions_completed ?? 0 },
      { name: "AI Chats", value: engagement.ai_messages ?? 0 },
      { name: "Assessments", value: engagement.assessments_completed ?? 0 },
    ];
  }, [engagement]);

  const monthlyBarData = useMemo(() => {
    if (!monthly) return [];
    return [
      { name: "New Members", value: monthly.new_members ?? 0 },
      { name: "Sessions", value: monthly.sessions_completed ?? 0 },
      { name: "AI Chats", value: monthly.ai_messages ?? 0 },
      { name: "Assessments", value: monthly.assessments_completed ?? 0 },
    ];
  }, [monthly]);

  function handleExportEngagement() {
    if (!engagement) return;
    downloadCSV("engagement-report.csv", ["Metric", "Value"], [
      { Metric: "Active Users", Value: engagement.active_users ?? 0 },
      { Metric: "Sessions Completed", Value: engagement.sessions_completed ?? 0 },
      { Metric: "AI Messages", Value: engagement.ai_messages ?? 0 },
      { Metric: "Assessments Completed", Value: engagement.assessments_completed ?? 0 },
      { Metric: "Total Members", Value: engagement.member_count ?? 0 },
    ]);
  }

  function handleExportMonthly() {
    if (!monthly) return;
    downloadCSV(`monthly-report-${selectedMonth}.csv`, ["Metric", "Value"], [
      { Metric: "New Members", Value: monthly.new_members ?? 0 },
      { Metric: "Sessions Completed", Value: monthly.sessions_completed ?? 0 },
      { Metric: "AI Messages", Value: monthly.ai_messages ?? 0 },
      { Metric: "Assessments Completed", Value: monthly.assessments_completed ?? 0 },
    ]);
  }

  return (
    <div className="p-6 space-y-8">
      {/* Engagement Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Engagement Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {engagement?.organization ?? "Your organisation"} · {PERIOD_LABELS[period]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={handleExportEngagement} disabled={!engagement}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Users", key: "active_users" as const, color: "text-blue-600" },
            { label: "Sessions", key: "sessions_completed" as const, color: "text-emerald-600" },
            { label: "AI Chats", key: "ai_messages" as const, color: "text-purple-600" },
            { label: "Assessments", key: "assessments_completed" as const, color: "text-amber-600" },
          ].map(({ label, key, color }) => (
            <Card key={key}>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{label}</p>
                {engagementLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className={`text-3xl font-bold mt-1 ${color}`}>
                    {(engagement?.[key] ?? 0).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown — {PERIOD_LABELS[period]}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {engagementLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Detail */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Monthly Detail</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Drill into a specific calendar month.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              max={currentYM}
              onChange={(e) => setSelectedMonth(e.target.value)}
              onBlur={() => fetchMonthly(selectedMonth)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button variant="outline" onClick={() => fetchMonthly(selectedMonth)}>
              Load
            </Button>
            <Button variant="secondary" onClick={handleExportMonthly} disabled={!monthly}>
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {monthly?.organization ?? "Organisation"} · {selectedMonth}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {monthlyLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !monthly ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                Select a month and click Load.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
