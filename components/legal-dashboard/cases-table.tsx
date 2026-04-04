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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLegalStore } from "@/store/legal-store";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25",
  review: "bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25",
  closed: "bg-slate-500/15 text-slate-700 dark:text-slate-400 hover:bg-slate-500/25",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25",
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25",
};

export function CasesTable() {
  const cases = useLegalStore((state) => state.cases);
  const fetchCases = useLegalStore((state) => state.fetchCases);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.id}</TableCell>
              <TableCell>{c.title}</TableCell>
              <TableCell className="capitalize">{c.type}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={c.assignee.avatar} alt={c.assignee.name} />
                    <AvatarFallback>{c.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{c.assignee.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[c.status]}
                >
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={priorityColors[c.priority]}
                >
                  {c.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(c.dueDate), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
