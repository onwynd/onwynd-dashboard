"use client";

import { useEffect, useState } from "react";
import { employeeService } from "@/lib/api/employee";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ClipboardList,
  CheckCircle2,
  Clock,
  Timer,
  LogIn,
  LogOut,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DashboardData {
  tasks_assigned: number;
  tasks_completed: number;
  hours_today: number;
  hours_this_week: number;
  is_clocked_in: boolean;
  clock_in_time: string | null;
  recent_tasks: {
    id: number | string;
    title: string;
    status: string;
    due_date: string;
    priority: string;
  }[];
}

const defaultData: DashboardData = {
  tasks_assigned: 0,
  tasks_completed: 0,
  hours_today: 0,
  hours_this_week: 0,
  is_clocked_in: false,
  clock_in_time: null,
  recent_tasks: [],
};

function getPriorityBadge(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
    case "urgent":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{priority}</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{priority}</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{priority}</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}

function getTaskStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "in_progress":
    case "in progress":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{status}</Badge>;
    case "pending":
    case "todo":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await employeeService.getDashboard();
      const d = response.data || response;
      setData({
        tasks_assigned: d.tasks_assigned ?? d.tasksAssigned ?? 0,
        tasks_completed: d.tasks_completed ?? d.tasksCompleted ?? 0,
        hours_today: d.hours_today ?? d.hoursToday ?? 0,
        hours_this_week: d.hours_this_week ?? d.hoursThisWeek ?? 0,
        is_clocked_in: d.is_clocked_in ?? d.isClockedIn ?? false,
        clock_in_time: d.clock_in_time ?? d.clockInTime ?? null,
        recent_tasks: d.recent_tasks ?? d.recentTasks ?? [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard", error);
      toast({ title: "Error", description: "Failed to fetch dashboard data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClockToggle = async () => {
    setIsClocking(true);
    try {
      if (data.is_clocked_in) {
        await employeeService.clockOut();
        toast({ title: "Clocked Out", description: "You have successfully clocked out." });
      } else {
        await employeeService.clockIn();
        toast({ title: "Clocked In", description: "You have successfully clocked in." });
      }
      fetchDashboard();
    } catch (error) {
      console.error("Clock toggle failed", error);
      toast({ title: "Error", description: "Failed to update clock status.", variant: "destructive" });
    } finally {
      setIsClocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button
          onClick={handleClockToggle}
          disabled={isClocking}
          variant={data.is_clocked_in ? "outline" : "default"}
        >
          {isClocking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : data.is_clocked_in ? (
            <LogOut className="mr-2 h-4 w-4" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {data.is_clocked_in ? "Clock Out" : "Clock In"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Assigned</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasks_assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasks_completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hours_today.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hours_this_week.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timesheet Status</CardTitle>
            <CardDescription>Your current clock status for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {data.is_clocked_in ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Clocked In</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Clocked Out</Badge>
                )}
              </div>
              {data.clock_in_time && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clocked In At</span>
                  <span className="font-medium">{data.clock_in_time}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Today&apos;s Hours</span>
                <span className="font-medium">{data.hours_today.toFixed(1)} hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest assigned tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recent_tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent tasks.</p>
            ) : (
              <div className="space-y-3">
                {data.recent_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center gap-2">
                        {getTaskStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{task.due_date}</span>
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
