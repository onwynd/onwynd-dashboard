"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import {
  RefreshCw,
  DollarSign,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface DepartmentHealth {
  name: string;
  status: "green" | "amber" | "red";
  score?: number;
  note?: string;
}

interface RecentAlert {
  id: string | number;
  title: string;
  severity: "high" | "medium" | "low";
  department?: string;
  created_at?: string;
}

interface PresidentOverview {
  total_revenue?: number;
  active_users?: number;
  sessions_this_month?: number;
  okr_health?: number;
  open_alerts?: number;
  employee_count?: number;
  department_health?: DepartmentHealth[];
  recent_alerts?: RecentAlert[];
}

const statusColour = (status: "green" | "amber" | "red") => {
  if (status === "green") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "amber") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-red-50 border-red-200 text-red-700";
};

const statusDot = (status: "green" | "amber" | "red") => {
  if (status === "green") return "bg-emerald-500";
  if (status === "amber") return "bg-amber-500";
  return "bg-red-500";
};

const severityBadge = (severity: string) => {
  if (severity === "high") return "bg-red-50 text-red-700 hover:bg-red-50";
  if (severity === "medium") return "bg-amber-50 text-amber-700 hover:bg-amber-50";
  return "bg-gray-50 text-gray-600 hover:bg-gray-50";
};

export default function PresidentDashboardPage() {
  const [data, setData] = useState<PresidentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    client
      .get("/api/v1/president/overview")
      .then((res) => {
        const body = res.data?.data ?? res.data ?? {};
        setData(body);
      })
      .catch(() => setError("Failed to load president overview data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n?: number) =>
    n !== undefined ? n.toLocaleString() : "—";

  const fmtCurrency = (n?: number) =>
    n !== undefined
      ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`
      : "—";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">President Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Company-wide performance at a glance</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      {loading && !data ? (
        <StatCardsShimmer count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Revenue"
            value={fmtCurrency(data?.total_revenue)}
            icon={DollarSign}
            colour="emerald"
            isLoading={loading}
          />
          <StatCard
            label="Active Users"
            value={fmt(data?.active_users)}
            icon={Users}
            colour="blue"
            isLoading={loading}
          />
          <StatCard
            label="Sessions This Month"
            value={fmt(data?.sessions_this_month)}
            icon={Calendar}
            colour="purple"
            isLoading={loading}
          />
          <StatCard
            label="Company OKR Health"
            value={data?.okr_health !== undefined ? `${data.okr_health}%` : "—"}
            icon={Target}
            colour={(data?.okr_health ?? 0) >= 70 ? "emerald" : (data?.okr_health ?? 0) >= 40 ? "amber" : "red"}
            isLoading={loading}
          />
          <StatCard
            label="Open Alerts"
            value={fmt(data?.open_alerts)}
            icon={AlertTriangle}
            colour={(data?.open_alerts ?? 0) > 5 ? "red" : (data?.open_alerts ?? 0) > 0 ? "amber" : "emerald"}
            isLoading={loading}
          />
          <StatCard
            label="Employee Count"
            value={fmt(data?.employee_count)}
            icon={UserCheck}
            colour="blue"
            isLoading={loading}
          />
        </div>
      )}

      {/* Department Health Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Health</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : !data?.department_health?.length ? (
            <p className="text-sm text-gray-400">No department data available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.department_health.map((dept) => (
                <div
                  key={dept.name}
                  className={`rounded-lg border p-4 ${statusColour(dept.status)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot(dept.status)}`} />
                    <span className="text-sm font-medium">{dept.name}</span>
                  </div>
                  {dept.score !== undefined && (
                    <p className="text-lg font-bold">{dept.score}%</p>
                  )}
                  {dept.note && (
                    <p className="text-xs mt-1 opacity-80">{dept.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : !data?.recent_alerts?.length ? (
            <p className="text-sm text-gray-400">No recent alerts.</p>
          ) : (
            <div className="space-y-2">
              {data.recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                    {alert.department && (
                      <p className="text-xs text-gray-500 mt-0.5">{alert.department}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {alert.created_at && (
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    )}
                    <Badge className={severityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
