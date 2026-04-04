"use client";

import { DeploymentsTable } from "@/components/tech-dashboard/deployments-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeploymentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground">
          Manage and track application deployments across environments.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>
            A record of all recent deployment activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeploymentsTable />
        </CardContent>
      </Card>
    </div>
  );
}
