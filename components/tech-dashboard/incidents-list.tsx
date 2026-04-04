"use client";

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
import { format } from "date-fns";

const statusColors = {
  investigating: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
  identified: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
  monitoring: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
  resolved: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
};

const severityColors = {
  critical: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
  major: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
  minor: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
};

export function IncidentsList() {
  const incidents = useTechStore((state) => state.incidents);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Recent Incidents</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Incident ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="text-right">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.id}</TableCell>
              <TableCell>{incident.title}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    statusColors[incident.status]
                  )}
                >
                  {incident.status}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    severityColors[incident.severity]
                  )}
                >
                  {incident.severity}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {format(new Date(incident.updatedAt), "MMM d, HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
