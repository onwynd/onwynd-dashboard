"use client";

import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTechStore } from "@/store/tech-store";
import { cn } from "@/lib/utils";

const severityColors: Record<string, string> = {
  Critical: "text-red-500 bg-red-50 dark:bg-red-950/20",
  High: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
  Medium: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  Low: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
};

const statusColors: Record<string, string> = {
  Open: "text-blue-500",
  Investigating: "text-orange-500",
  Resolved: "text-emerald-500",
};

export function IncidentsTable() {
  const incidents = useTechStore((state) => state.incidents);
  const fetchIncidents = useTechStore((state) => state.fetchIncidents);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Recent Incidents</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.title}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    severityColors[incident.severity]
                  )}
                >
                  {incident.severity}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-sm font-medium",
                    statusColors[incident.status]
                  )}
                >
                  {incident.status}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {incident.time}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

