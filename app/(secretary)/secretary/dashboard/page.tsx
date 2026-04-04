"use client";

import { useEffect } from "react";
import { SecretaryStatsCards } from "@/components/secretary-dashboard/stats-cards";
import { useSecretaryStore } from "@/store/secretary-store";
import { AppointmentsTable } from "@/components/secretary-dashboard/appointments-table";
import { VisitorsTable } from "@/components/secretary-dashboard/visitors-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecretaryDashboard() {
  const fetchStats = useSecretaryStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today&apos;s activities.</p>
      </div>

      <SecretaryStatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentsTable />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Visitor Log</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
