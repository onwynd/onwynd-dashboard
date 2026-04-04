"use client";

import { LogsTable } from "@/components/tech-dashboard/logs-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View and analyze system events, errors, and activities.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Search and filter through recent system logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogsTable />
        </CardContent>
      </Card>
    </div>
  );
}
