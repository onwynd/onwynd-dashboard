"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, CheckCircle, RefreshCw, Phone, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { clinicalService } from "@/lib/api/clinical";
import { cn } from "@/lib/utils";

interface DistressQueueResponseItem {
  id: string | number;
  session_id?: string | number;
  member_id?: string | number;
  user_id?: string | number;
  member_name?: string;
  user_name?: string;
  risk_level?: "low" | "medium" | "high" | "severe" | "critical";
  message_preview?: string;
  flagged_at?: string;
  created_at?: string;
}

interface CrisisAlert {
  id: string;
  session_id: string;
  user_id: string;
  user_name?: string;
  severity: "medium" | "high" | "critical";
  trigger: string;
  created_at: string;
  resolved_at?: string;
  status: "open" | "in_progress" | "resolved";
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
};

export default function CrisisAlertsPage() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await clinicalService.getDistressQueue();
      const raw = res?.data ?? res ?? [];
      const items = Array.isArray(raw) ? (raw as DistressQueueResponseItem[]) : [];
      const mapped = items
        .filter((item) => ["high", "severe", "critical"].includes(item.risk_level ?? ""))
        .map((item) => ({
          id: String(item.id),
          session_id: String(item.session_id ?? ""),
          user_id: String(item.member_id ?? item.user_id ?? ""),
          user_name: item.member_name ?? item.user_name,
          severity: (item.risk_level === "critical" || item.risk_level === "severe" ? "critical" : "high") as CrisisAlert["severity"],
          trigger: item.message_preview ?? "High-risk conversation flagged for clinical follow-up.",
          created_at: item.flagged_at ?? item.created_at ?? new Date().toISOString(),
          status: "open" as const,
        }));
      setAlerts(mapped);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    try {
      await clinicalService.resolveDistressItem(id, "resolved", "Reviewed and resolved by clinical advisor");
      setAlerts((prev) => prev.map((alert) => alert.id === id ? { ...alert, status: "resolved", resolved_at: new Date().toISOString() } : alert));
      toast({ title: "Alert resolved", description: "Crisis alert marked as resolved." });
    } catch {
      toast({ title: "Error", description: "Could not resolve alert.", variant: "destructive" });
    }
  };

  const open = alerts.filter((alert) => alert.status !== "resolved");
  const resolved = alerts.filter((alert) => alert.status === "resolved");

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            Crisis Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Active crisis interventions requiring immediate clinical attention.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : open.length === 0 && resolved.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="font-semibold">No crisis alerts</p>
            <p className="text-sm text-muted-foreground">All members are currently safe.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {open.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-red-600">{open.length} Active Alert{open.length !== 1 ? "s" : ""}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {open.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border-b last:border-b-0">
                    <Badge className={cn("shrink-0 text-xs capitalize", SEVERITY_COLOR[alert.severity])}>
                      {alert.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.user_name ?? `User #${alert.user_id}`}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.trigger}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.created_at), "MMM d, yyyy HH:mm")}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Contact
                      </Button>
                      <Button size="sm" variant="default" onClick={() => resolve(alert.id)}>
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {resolved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Resolved ({resolved.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {resolved.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border-b last:border-b-0 opacity-60">
                    <Badge variant="secondary" className="shrink-0 text-xs capitalize">{alert.severity}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-through">{alert.user_name ?? `User #${alert.user_id}`}</p>
                      <p className="text-xs text-muted-foreground">{alert.trigger}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">Resolved</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


