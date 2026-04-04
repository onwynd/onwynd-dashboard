"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import client from "@/lib/api/client";
import { RefreshCw, AlertTriangle, Shield, Lock, AlertCircle, Activity } from "lucide-react";

interface SecurityEvent {
  id: number | string;
  timestamp: string;
  user_name?: string;
  action: string;
  ip_address?: string;
  severity: string;
  category?: string;
  status?: string;
  details?: string;
}

const SEVERITY_BADGE: Record<string, string> = {
  low:      "bg-gray-100 text-gray-700 hover:bg-gray-100",
  medium:   "bg-yellow-50 text-yellow-700 hover:bg-yellow-50",
  high:     "bg-orange-50 text-orange-700 hover:bg-orange-50",
  critical: "bg-red-50 text-red-700 hover:bg-red-50",
};

export default function SecurityEventsPage() {
  const [events,  setEvents]  = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/audit/log", {
        params: { severity: "high", per_page: 50, page: 1 },
      }).catch(() => null);

      if (res?.data?.data) {
        const high = (res.data.data as SecurityEvent[]).filter(
          (e) => e.severity === "high" || e.severity === "critical"
        );
        setEvents(high);
      } else {
        setEvents([]);
      }
    } catch {
      setError("Unable to load security events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const critical = events.filter((e) => e.severity === "critical").length;
  const high     = events.filter((e) => e.severity === "high").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">High and critical severity events requiring review</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            {[
              { label: "Critical Events", value: critical, icon: AlertTriangle, color: "text-red-600"    },
              { label: "High Events",     value: high,     icon: AlertCircle,   color: "text-orange-600" },
              { label: "Total Flagged",   value: events.length, icon: Shield,   color: "text-yellow-600" },
              { label: "Unique IPs",      value: new Set(events.map((e) => e.ip_address).filter(Boolean)).size, icon: Activity, color: "text-slate-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className={`size-4 shrink-0 ${color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Events table */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">High / Critical Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="size-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No high or critical security events. All clear.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{ev.user_name ?? "Unknown"}</TableCell>
                    <TableCell className="text-sm font-medium">{ev.action}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{ev.ip_address ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${SEVERITY_BADGE[ev.severity] ?? SEVERITY_BADGE.low}`}>
                        {ev.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ev.status ? (
                        <Badge className={ev.status === "blocked" ? "bg-orange-50 text-orange-700" : ev.status === "failure" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}>
                          {ev.status}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
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
