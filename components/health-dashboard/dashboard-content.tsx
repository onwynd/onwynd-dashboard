"use client";

import { useEffect } from "react";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { CheckInTable } from "./check-in-table";
import { RecentDocuments } from "./recent-documents";
import { useHealthStore } from "@/store/health-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            New Check-in
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <FileText className="size-4" />
            Submit Patient Report
          </Button>
          <Button size="sm" variant="destructive" className="gap-2">
            <AlertTriangle className="size-4" />
            Escalate Distress Case
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard Content ───────────────────────────────────────────────────
export function DashboardContent() {
  const {
    stats,
    chartData,
    weeklyChartData,
    fetchStats,
    fetchCheckIns,
    fetchDocuments,
    fetchChartData,
    fetchWeeklyChartData,
  } = useHealthStore();

  useEffect(() => {
    fetchStats();
    fetchCheckIns();
    fetchDocuments();
    fetchChartData();
    fetchWeeklyChartData();
  }, [fetchStats, fetchCheckIns, fetchDocuments, fetchChartData, fetchWeeklyChartData]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">

        {/* Stat Cards — My Check-ins Today | Reports Submitted | Pending Reports | Active Distress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts — Daily Check-in Activity + Weekly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Daily Check-in Activity"
            data={chartData}
          />
          <ChartCard
            title="Weekly Activity"
            data={weeklyChartData}
            barColor="#6366f1"
          />
        </div>

        {/* Tables — My Recent Check-ins + My Submitted Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
              My Recent Check-ins
            </h2>
            <CheckInTable />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
              My Submitted Reports
            </h2>
            <RecentDocuments
              title="My Submitted Reports"
              searchPlaceholder="Search reports..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}
