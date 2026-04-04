"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import { RefreshCw, Zap, Rocket, Bug, Activity, Clock, CheckSquare, AlertTriangle } from "lucide-react";

interface ProductDashboard {
  features_shipped_mtd?: number;
  in_development?: number;
  backlog_items?: number;
  bug_count?: number;
  deploy_frequency_per_week?: number;
  system_uptime_pct?: number;
  roadmap_initiatives?: { name: string; progress: number; status: "on_track" | "at_risk" | "off_track" | "done" }[];
  recent_deployments?: {
    id: number | string;
    version: string;
    date: string;
    environment: string;
    status: "success" | "failed" | "rollback";
  }[];
  tech_health?: {
    api_error_rate?: number;
    avg_response_ms?: number;
    uptime_pct?: number;
    active_incidents?: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  on_track:  "bg-emerald-50 text-emerald-700",
  at_risk:   "bg-yellow-50 text-yellow-700",
  off_track: "bg-red-50 text-red-700",
  done:      "bg-blue-50 text-blue-700",
};

const DEPLOY_STATUS_COLORS: Record<string, string> = {
  success:  "bg-emerald-50 text-emerald-700",
  failed:   "bg-red-50 text-red-700",
  rollback: "bg-orange-50 text-orange-700",
};

export default function VpProductDashboardPage() {
  const [data, setData] = useState<ProductDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/product/dashboard");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load product data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initiatives = data?.roadmap_initiatives ?? [];
  const deployments = data?.recent_deployments ?? [];
  const tech = data?.tech_health ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Leadership Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Roadmap progress, tech health &amp; delivery velocity</p>
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
          <StatCard label="Features Shipped (MTD)" value={data?.features_shipped_mtd}   icon={CheckSquare} colour="emerald" isLoading={loading} />
          <StatCard label="In Development"          value={data?.in_development}          icon={Zap}         colour="blue"   isLoading={loading} />
          <StatCard label="Backlog Items"            value={data?.backlog_items}           icon={Clock}       colour="amber"  isLoading={loading} />
          <StatCard label="Open Bugs"               value={data?.bug_count}               icon={Bug}         colour={(data?.bug_count ?? 0) > 10 ? "red" : "amber"} isLoading={loading} />
          <StatCard label="Deploys / Week"           value={data?.deploy_frequency_per_week} icon={Rocket}   colour="blue"   isLoading={loading} />
          <StatCard label="System Uptime"            value={data?.system_uptime_pct !== undefined ? `${data.system_uptime_pct}%` : "—"} icon={Activity} colour={((data?.system_uptime_pct ?? 100) >= 99.5) ? "emerald" : "red"} isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Roadmap Initiatives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : initiatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No initiatives found.</p>
            ) : (
              initiatives.map((init) => (
                <div key={init.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{init.name}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{init.progress}%</span>
                      <Badge className={`${STATUS_COLORS[init.status] ?? "bg-gray-100 text-gray-700"} text-xs`}>
                        {init.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={init.progress} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              <>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">API Error Rate</span>
                  <Badge className={((tech.api_error_rate ?? 0) < 0.1) ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                    {tech.api_error_rate ?? "—"}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Avg Response Time</span>
                  <span className="text-sm font-semibold">{tech.avg_response_ms ? `${tech.avg_response_ms}ms` : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <Badge className={((tech.uptime_pct ?? 0) >= 99.5) ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                    {tech.uptime_pct ?? "—"}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Active Incidents</span>
                  <Badge className={((tech.active_incidents ?? 0) === 0) ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                    {tech.active_incidents ?? 0}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent deployments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.slice(0, 10).map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="text-sm font-mono font-medium">{dep.version}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(dep.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{dep.environment}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${DEPLOY_STATUS_COLORS[dep.status] ?? "bg-gray-100 text-gray-700"} text-xs capitalize`}>
                        {dep.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
