"use client";

import { useEffect, useState } from "react";
import { centerService } from "@/lib/api/center";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  Activity,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DashboardData {
  todays_bookings: number;
  active_sessions: number;
  inventory_alerts: number;
  total_clients: number;
  schedule: {
    id: number | string;
    client_name: string;
    service: string;
    time: string;
    status: string;
  }[];
  equipment_status: {
    id: number | string;
    name: string;
    status: string;
    last_checked: string;
  }[];
}

const defaultData: DashboardData = {
  todays_bookings: 0,
  active_sessions: 0,
  inventory_alerts: 0,
  total_clients: 0,
  schedule: [],
  equipment_status: [],
};

function getBookingBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "in_progress":
    case "in progress":
    case "active":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{status}</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    case "cancelled":
    case "no-show":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getEquipmentBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "operational":
    case "good":
    case "ok":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "maintenance":
    case "needs_repair":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    case "out_of_service":
    case "broken":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const response = await centerService.getDashboard();
        const d = response.data || response;
        setData({
          todays_bookings: d.todays_bookings ?? d.todaysBookings ?? d.today_bookings ?? 0,
          active_sessions: d.active_sessions ?? d.activeSessions ?? 0,
          inventory_alerts: d.inventory_alerts ?? d.inventoryAlerts ?? 0,
          total_clients: d.total_clients ?? d.totalClients ?? 0,
          schedule: d.schedule ?? d.todays_schedule ?? d.todaysSchedule ?? [],
          equipment_status: d.equipment_status ?? d.equipmentStatus ?? [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
        toast({ title: "Error", description: "Failed to fetch dashboard data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todays_bookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.active_sessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventory_alerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_clients}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>Upcoming bookings and appointments for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.schedule.length === 0 ? (
              <p className="text-muted-foreground text-sm">No bookings scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {data.schedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.client_name}</p>
                      <p className="text-xs text-muted-foreground">{item.service}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                      {getBookingBadge(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Equipment Status
            </CardTitle>
            <CardDescription>Current status of center equipment.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.equipment_status.length === 0 ? (
              <p className="text-muted-foreground text-sm">No equipment data available.</p>
            ) : (
              <div className="space-y-3">
                {data.equipment_status.map((equip) => (
                  <div
                    key={equip.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{equip.name}</p>
                      <p className="text-xs text-muted-foreground">Last checked: {equip.last_checked}</p>
                    </div>
                    {getEquipmentBadge(equip.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
