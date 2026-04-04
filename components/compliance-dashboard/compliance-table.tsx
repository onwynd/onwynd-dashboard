"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useComplianceStore } from "@/store/compliance-store";
import { useEffect } from "react";

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

export function ComplianceTable() {
  const issues = useComplianceStore((state) => state.issues);
  const fetchIssues = useComplianceStore((state) => state.fetchIssues);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6 border-b">
        <h3 className="font-semibold">Compliance Issues</h3>
        <p className="text-sm text-muted-foreground">Recent compliance incidents and tasks</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issue</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">{issue.title}</TableCell>
              <TableCell>{issue.type}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={severityColors[issue.severity]}
                >
                  {issue.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[issue.status]}
                >
                  {issue.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>{issue.assignedTo}</TableCell>
              <TableCell>{issue.dueDate}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
