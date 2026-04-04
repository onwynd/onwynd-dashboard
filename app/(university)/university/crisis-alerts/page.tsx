"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { institutionalService } from "@/lib/api/institutional";

type CrisisEvent = {
  id: number;
  uuid: string;
  risk_level: "low" | "medium" | "high" | "severe";
  flagged_at: string;
  member_identifier: string;
  status: "pending" | "reviewed" | "resolved";
  reason: string;
  resources_shown: boolean;
};

export default function CrisisAlertsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CrisisEvent[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await institutionalService.getAtRisk() as { events?: CrisisEvent[] } | null;
        if (data?.events) {
          // Show only high/severe for crisis alerts view
          setEvents(data.events.filter((e) => ["high", "severe"].includes(e.risk_level)));
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function getRiskBadgeColor(level: string) {
    return level === "severe" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crisis Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            High and severe risk flags requiring immediate attention from student affairs or counselling.
          </p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">
          {isLoading ? "..." : `${events.filter((e) => e.status === "pending").length} pending`}
        </Badge>
      </div>

      <div className="rounded-xl border bg-red-50 border-red-200 px-4 py-3 flex items-start gap-3">
        <span className="text-red-600 text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-sm text-red-800">
          <strong>Immediate action may be required.</strong> These are anonymised high/severe flags.
          Contact your campus counselling centre or safeguarding team for follow-up protocols.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Crisis Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No active crisis alerts. All clear.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Flagged At</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resources Shown</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(e.risk_level)}>
                          {e.risk_level.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(e.flagged_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{e.member_identifier}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{e.reason}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "pending" ? "outline" : "secondary"}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.resources_shown ? "default" : "outline"}>
                          {e.resources_shown ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
