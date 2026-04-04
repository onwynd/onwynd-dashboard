"use client";

import { useEffect, useState } from "react";
import { supportService } from "@/lib/api/support";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Ticket, CheckCircle2, Clock, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SupportStats {
  total_tickets?: number;
  open_tickets?: number;
  resolved_tickets?: number;
  avg_resolution_hours?: number;
  satisfaction_score?: number;
  tickets_by_status?: Record<string, number>;
  tickets_by_priority?: Record<string, number>;
  weekly_volume?: { label: string; count: number }[];
}

export default function SupportReportsPage() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportService.getStats()
      .then((data) => setStats(data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Tickets",
      value: stats?.total_tickets ?? 0,
      icon: Ticket,
      color: "text-blue-500",
    },
    {
      label: "Resolved",
      value: stats?.resolved_tickets ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Avg Resolution",
      value: stats?.avg_resolution_hours != null ? `${stats.avg_resolution_hours}h` : "—",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "CSAT Score",
      value: stats?.satisfaction_score != null ? `${stats.satisfaction_score}%` : "—",
      icon: Star,
      color: "text-purple-500",
    },
  ];

  const weeklyData = stats?.weekly_volume ?? [];

  const priorityData = stats?.tickets_by_priority
    ? Object.entries(stats.tickets_by_priority).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Support team performance and ticket analytics.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Ticket Volume</CardTitle>
                <CardDescription>Number of tickets submitted per week.</CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                    No weekly data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
                <CardDescription>Distribution of open tickets across priority levels.</CardDescription>
              </CardHeader>
              <CardContent>
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={priorityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                    No priority data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          {stats?.tickets_by_status && Object.keys(stats.tickets_by_status).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(stats.tickets_by_status).map(([status, count]) => (
                    <div key={status} className="text-center p-3 rounded-lg bg-muted/40">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">{status.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
