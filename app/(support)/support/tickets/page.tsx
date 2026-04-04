"use client";

import { useEffect, useState } from "react";
import { TicketsTable } from "@/components/support-dashboard/tickets-table";
import { supportService } from "@/lib/api/support";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SupportStats {
  total_tickets?: number;
  open_tickets?: number;
  avg_response_time?: string;
  resolution_rate?: string;
}

export default function TicketsPage() {
  const [stats, setStats] = useState<SupportStats>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    supportService.getStats()
      .then((data) => setStats(data ?? {}))
      .catch(() => setStats({}))
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">
          Manage and track customer support requests, issues, and inquiries.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold">{(stats.total_tickets ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold text-blue-600">{(stats.open_tickets ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active requests</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold text-amber-600">{stats.avg_response_time ?? "—"}</div>
                <p className="text-xs text-muted-foreground">Average across tickets</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.resolution_rate ?? "—"}</div>
                <p className="text-xs text-muted-foreground">Resolved of total closed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Management</CardTitle>
          <CardDescription>View and manage all support tickets in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsTable />
        </CardContent>
      </Card>
    </div>
  );
}
