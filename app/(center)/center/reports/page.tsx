"use client";

import { useEffect, useState } from "react";
import { centerService } from "@/lib/api/center";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ReportData {
  total_bookings: number;
  completed_sessions: number;
  revenue: number;
  new_clients: number;
  avg_session_duration: number;
  occupancy_rate: number;
  monthly_bookings: { month: string; count: number }[];
  top_services: { name: string; count: number }[];
}

const defaultReport: ReportData = {
  total_bookings: 0,
  completed_sessions: 0,
  revenue: 0,
  new_clients: 0,
  avg_session_duration: 0,
  occupancy_rate: 0,
  monthly_bookings: [],
  top_services: [],
};

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData>(defaultReport);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      try {
        const response = await centerService.getReports();
        const data = response.data || response;
        setReport({
          total_bookings: data.total_bookings ?? data.totalBookings ?? 0,
          completed_sessions: data.completed_sessions ?? data.completedSessions ?? 0,
          revenue: data.revenue ?? 0,
          new_clients: data.new_clients ?? data.newClients ?? 0,
          avg_session_duration: data.avg_session_duration ?? data.avgSessionDuration ?? 0,
          occupancy_rate: data.occupancy_rate ?? data.occupancyRate ?? 0,
          monthly_bookings: data.monthly_bookings ?? data.monthlyBookings ?? [],
          top_services: data.top_services ?? data.topServices ?? [],
        });
      } catch (error) {
        console.error("Failed to fetch reports", error);
        toast({ title: "Error", description: "Failed to fetch reports", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Center performance reports and analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.total_bookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.completed_sessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.new_clients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.avg_session_duration} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.occupancy_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {report.monthly_bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No monthly data available.</p>
            ) : (
              <div className="space-y-3">
                {report.monthly_bookings.map((item, index) => {
                  const max = Math.max(...report.monthly_bookings.map((m) => m.count), 1);
                  const width = (item.count / max) * 100;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-16 shrink-0">{item.month}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            {report.top_services.length === 0 ? (
              <p className="text-muted-foreground text-sm">No service data available.</p>
            ) : (
              <div className="space-y-3">
                {report.top_services.map((service, index) => {
                  const max = Math.max(...report.top_services.map((s) => s.count), 1);
                  const width = (service.count / max) * 100;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32 shrink-0 truncate">{service.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{service.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
