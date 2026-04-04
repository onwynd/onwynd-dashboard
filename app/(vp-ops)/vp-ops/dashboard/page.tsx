"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import { RefreshCw, Video, LifeBuoy, Users, TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react";

interface OpsOverview {
  sessions_live?: number;
  sessions_today?: number;
  open_tickets?: number;
  pending_leave_requests?: number;
  open_positions?: number;
  avg_ticket_resolution_hours?: number;
  support_sla_breaches?: number;
  hr_headcount?: number;
  session_ops?: {
    scheduled_today?: number;
    completed_today?: number;
    no_shows_today?: number;
    ended_early?: number;
    therapist_availability_gaps?: number;
  };
  support_health?: {
    open_tickets?: number;
    avg_first_response_hours?: number;
    avg_resolution_hours?: number;
    long_open_tickets?: number;
    ai_handover_rate?: number;
  };
  hr_summary?: {
    headcount?: number;
    on_leave_today?: number;
    pending_approvals?: number;
    open_positions?: number;
  };
}

export default function VpOpsDashboardPage() {
  const [data, setData] = useState<OpsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/coo/overview");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load operations data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { session_ops, support_health, hr_summary } = data ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Leadership Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Sessions, support &amp; HR operational health</p>
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
          <StatCard label="Sessions Live"         value={data?.sessions_live ?? session_ops?.scheduled_today}  icon={Video}      colour="blue"   isLoading={loading} />
          <StatCard label="Sessions Today"         value={session_ops?.completed_today}    icon={Activity}   colour="emerald" isLoading={loading} />
          <StatCard label="Open Tickets"           value={support_health?.open_tickets}    icon={LifeBuoy}   colour={(support_health?.open_tickets ?? 0) > 10 ? "red" : "amber"} isLoading={loading} />
          <StatCard label="HR Headcount"           value={hr_summary?.headcount}           icon={Users}      colour="blue"   isLoading={loading} />
          <StatCard label="On Leave Today"         value={hr_summary?.on_leave_today}      icon={Clock}      colour="amber"  isLoading={loading} />
          <StatCard label="Open Positions"         value={hr_summary?.open_positions}      icon={TrendingUp} colour="blue"   isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="w-4 h-4 text-blue-500" />
              Session Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Scheduled Today",         value: session_ops?.scheduled_today },
              { label: "Completed",                value: session_ops?.completed_today },
              { label: "No-Shows",                 value: session_ops?.no_shows_today, warn: (session_ops?.no_shows_today ?? 0) > 0 },
              { label: "Ended Early (Flagged)",    value: session_ops?.ended_early,    warn: (session_ops?.ended_early ?? 0) > 0 },
              { label: "Availability Gaps",        value: session_ops?.therapist_availability_gaps !== undefined ? `${session_ops.therapist_availability_gaps} therapists` : "—" },
            ].map(({ label, value, warn }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                {warn ? (
                  <Badge className="bg-red-50 text-red-700 hover:bg-red-50">{value ?? "—"}</Badge>
                ) : (
                  <span className="text-sm font-semibold">{value ?? "—"}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="w-4 h-4 text-orange-500" />
              Support Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Open Tickets",             value: support_health?.open_tickets },
              { label: "Avg First Response",        value: support_health?.avg_first_response_hours !== undefined ? `${support_health.avg_first_response_hours}h` : "—" },
              { label: "Avg Resolution Time",       value: support_health?.avg_resolution_hours !== undefined ? `${support_health.avg_resolution_hours}h` : "—" },
              { label: "SLA Breaches (48h+)",       value: support_health?.long_open_tickets, warn: (support_health?.long_open_tickets ?? 0) > 0 },
              { label: "AI Handover Rate",          value: support_health?.ai_handover_rate !== undefined ? `${support_health.ai_handover_rate}%` : "—" },
            ].map(({ label, value, warn }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                {warn ? (
                  <Badge className="bg-red-50 text-red-700 hover:bg-red-50">{value ?? "—"}</Badge>
                ) : (
                  <span className="text-sm font-semibold">{value ?? "—"}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-emerald-500" />
              HR Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Total Headcount",     value: hr_summary?.headcount },
              { label: "On Leave Today",      value: hr_summary?.on_leave_today },
              { label: "Pending Approvals",   value: hr_summary?.pending_approvals, warn: (hr_summary?.pending_approvals ?? 0) > 0 },
              { label: "Open Positions",      value: hr_summary?.open_positions },
            ].map(({ label, value, warn }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                {warn ? (
                  <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">{value ?? "—"}</Badge>
                ) : (
                  <span className="text-sm font-semibold">{value ?? "—"}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
