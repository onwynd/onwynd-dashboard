"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import { RefreshCw, ShieldCheck, AlertTriangle, Users, Lock, FileText, Activity } from "lucide-react";

interface AuditOverview {
  events_today?: number;
  flagged_events?: number;
  compliance_score?: number;
  active_violations?: number;
  users_audited?: number;
  security_events?: number;
  recent_events?: {
    id: number | string;
    timestamp: string;
    user_name?: string;
    action: string;
    ip_address?: string;
    severity: "low" | "medium" | "high" | "critical";
    resource?: string;
  }[];
  compliance_checks?: { label: string; status: "pass" | "fail" | "warn"; description?: string }[];
  risk_level?: "low" | "medium" | "high";
}

const SEVERITY_COLORS: Record<string, string> = {
  low:      "bg-gray-100 text-gray-700",
  medium:   "bg-yellow-50 text-yellow-700",
  high:     "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const RISK_COLORS: Record<string, string> = {
  low:    "text-emerald-600 bg-emerald-50",
  medium: "text-yellow-700 bg-yellow-50",
  high:   "text-red-600 bg-red-50",
};

export default function AuditDashboardPage() {
  const [data, setData] = useState<AuditOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/audit/overview");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load audit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const events = data?.recent_events ?? [];
  const checks = data?.compliance_checks ?? [];
  const riskLevel = data?.risk_level ?? "low";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Read-only view — all changes require authorization</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data ? (
        <StatCardsShimmer count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Events Today"       value={data?.events_today}      icon={Activity}    colour="blue"   isLoading={loading} />
          <StatCard label="Flagged Events"      value={data?.flagged_events}    icon={AlertTriangle} colour={(data?.flagged_events ?? 0) > 0 ? "red" : "emerald"} isLoading={loading} />
          <StatCard label="Compliance Score"    value={data?.compliance_score !== undefined ? `${data.compliance_score}%` : "—"} icon={ShieldCheck} colour={((data?.compliance_score ?? 0) >= 90) ? "emerald" : ((data?.compliance_score ?? 0) >= 70) ? "amber" : "red"} isLoading={loading} />
          <StatCard label="Active Violations"   value={data?.active_violations} icon={AlertTriangle} colour={(data?.active_violations ?? 0) > 0 ? "red" : "emerald"} isLoading={loading} />
          <StatCard label="Users Audited"       value={data?.users_audited}     icon={Users}       colour="blue"   isLoading={loading} />
          <StatCard label="Security Events"     value={data?.security_events}   icon={Lock}        colour={(data?.security_events ?? 0) > 5 ? "red" : "amber"} isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded today.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 12).map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-sm">{ev.user_name ?? "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{ev.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ev.resource ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ev.ip_address ?? "—"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[ev.severity] ?? "bg-gray-100 text-gray-700"}`}>
                          {ev.severity}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className={`text-center py-4 rounded-lg font-bold text-xl capitalize ${RISK_COLORS[riskLevel]}`}>
                  {riskLevel} Risk
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : checks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No checks configured.</p>
              ) : (
                checks.map((check, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{check.label}</span>
                    </div>
                    <Badge className={check.status === "pass" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : check.status === "warn" ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                      {check.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
