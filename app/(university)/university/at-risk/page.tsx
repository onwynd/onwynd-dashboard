"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export default function AtRiskStudentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [events, setEvents] = useState<CrisisEvent[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await institutionalService.getAtRisk() as { count?: number; events?: CrisisEvent[] } | null;
        if (data && "events" in data && Array.isArray(data.events)) {
          setCount(data.count ?? 0);
          setEvents(data.events);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function exportCSV() {
    const headers = ["Student ID", "Risk Level", "Time", "Reason", "Status"];
    const lines = events.map((e) =>
      [
        JSON.stringify(e.member_identifier),
        JSON.stringify(e.risk_level),
        JSON.stringify(new Date(e.flagged_at).toLocaleString()),
        JSON.stringify(e.reason),
        JSON.stringify(e.status),
      ].join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "at-risk-students-anonymized.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getRiskBadgeColor(level: string) {
    switch (level) {
      case "severe": return "bg-red-600 hover:bg-red-700";
      case "high":   return "bg-red-500 hover:bg-red-600";
      case "medium": return "bg-orange-500 hover:bg-orange-600";
      default:       return "bg-yellow-500 hover:bg-yellow-600";
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">At-Risk Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Anonymised log of wellness flags triggered by students. Review to understand campus mental health trends.
          </p>
        </div>
        <Button variant="secondary" onClick={exportCSV} disabled={isLoading || events.length === 0}>
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border bg-amber-50 border-amber-200 px-4 py-3 flex items-start gap-3">
        <span className="text-amber-600 text-lg flex-shrink-0 mt-0.5">🔒</span>
        <p className="text-sm text-amber-800">
          <strong>Privacy protected.</strong> Student identities are masked (e.g., "Student #a1b").
          You can see severity and trends without identifying individuals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Wellness Flags
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({count} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No at-risk events detected in the reporting period.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Student Identifier</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="font-mono text-sm">
                        {e.member_identifier}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {e.reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.status === "pending" ? "outline" : "secondary"}>
                          {e.status}
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
