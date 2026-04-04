"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Server,
  HardDrive,
  Cpu,
  Activity,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ServiceInfo {
  status: string;
  latency: string | null;
}

interface SystemMetrics {
  cpu_load_pct: number | null;
  memory_used_mb: number;
  memory_limit_mb: number | null;
  memory_pct: number | null;
  disk_used_pct: number | null;
  disk_total_gb: number | null;
  disk_free_gb: number | null;
}

interface HealthMeta {
  php_version: string;
  laravel: string;
  environment: string;
  server_uptime: string | null;
}

interface HealthData {
  services: {
    database: ServiceInfo;
    redis: ServiceInfo;
    storage: ServiceInfo;
  };
  system: SystemMetrics;
  meta: HealthMeta;
  last_check: string;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const isOk = s === "operational" || s === "ok" || s === "healthy";
  const isDegraded = s === "degraded" || s === "warning";
  if (isOk) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
  if (isDegraded) return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
}

function StatusIcon({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "operational" || s === "ok" || s === "healthy")
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (s === "degraded" || s === "warning")
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-red-600" />;
}

function MetricBar({
  label,
  value,
  pct,
  detail,
  icon: Icon,
  warnAt = 80,
  critAt = 95,
}: {
  label: string;
  value: string;
  pct: number | null;
  detail?: string;
  icon: React.FC<{ className?: string }>;
  warnAt?: number;
  critAt?: number;
}) {
  const barColor =
    pct === null ? "bg-gray-400" : pct >= critAt ? "bg-red-500" : pct >= warnAt ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </div>
        <span className="text-muted-foreground">{value}</span>
      </div>
      {pct !== null && (
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemStatus();
      setHealth(data as HealthData);
    } catch {
      toast({ title: "Error", description: "Failed to fetch system health.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const iv = setInterval(fetchHealth, 30_000);
    return () => clearInterval(iv);
  }, [fetchHealth]);

  const allOk =
    health && Object.values(health.services).every((s) => s.status?.toLowerCase() === "operational");

  const services = health
    ? [
        { name: "Database", icon: Database, info: health.services.database },
        { name: "Redis / Cache", icon: Activity, info: health.services.redis },
        { name: "Storage", icon: HardDrive, info: health.services.storage },
      ]
    : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">
            Real-time server metrics and service status.
            {health && (
              <span className="ml-2 text-xs">
                Last checked: {new Date(health.last_check).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading && !health ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : health ? (
        <>
          {/* Overall banner */}
          <Card className={allOk ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <CardContent className="py-4 flex items-center gap-3">
              {allOk ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className="font-semibold">
                  {allOk ? "All Systems Operational" : "Some Services Degraded"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {health.meta.environment} · PHP {health.meta.php_version} · Laravel {health.meta.laravel}
                  {health.meta.server_uptime && ` · Uptime: ${health.meta.server_uptime}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map(({ name, icon: Icon, info }) => (
              <Card key={name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {name}
                    </div>
                    <StatusIcon status={info.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <StatusBadge status={info.status} />
                  {info.latency && info.latency !== "N/A" && (
                    <p className="text-xs text-muted-foreground pt-1">Latency: {info.latency}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {health.system.cpu_load_pct !== null && (
                <MetricBar
                  label="CPU Load (1-min avg)"
                  value={`${health.system.cpu_load_pct}%`}
                  pct={health.system.cpu_load_pct}
                  icon={Cpu}
                />
              )}
              <MetricBar
                label="Memory"
                value={`${health.system.memory_used_mb} MB${health.system.memory_limit_mb ? ` / ${health.system.memory_limit_mb} MB` : ""}`}
                pct={health.system.memory_pct ?? null}
                detail={health.system.memory_pct !== null ? `${health.system.memory_pct}% used` : undefined}
                icon={Server}
              />
              {health.system.disk_total_gb !== null && (
                <MetricBar
                  label="Disk"
                  value={`${health.system.disk_free_gb} GB free / ${health.system.disk_total_gb} GB total`}
                  pct={health.system.disk_used_pct}
                  detail={health.system.disk_used_pct !== null ? `${health.system.disk_used_pct}% used` : undefined}
                  icon={HardDrive}
                />
              )}
            </CardContent>
          </Card>

          {/* Meta cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "PHP Version", value: health.meta.php_version, icon: Server },
              { label: "Laravel", value: health.meta.laravel, icon: Activity },
              { label: "Environment", value: health.meta.environment, icon: Clock },
              { label: "Server Uptime", value: health.meta.server_uptime ?? "—", icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                  <p className="font-semibold capitalize">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-red-500" />
            <p>Could not reach system health endpoint.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
