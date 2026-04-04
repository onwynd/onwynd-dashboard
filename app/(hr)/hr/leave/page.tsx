"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hrService } from "@/lib/api/hr";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LeaveRequest {
  id: number;
  employee_name: string;
  employee_email: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

function statusVariant(status: string) {
  switch (status) {
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
    case "pending":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch {
      toast({ description: "Failed to load leave requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      await hrService.updateLeave(id, { status });
      toast({ description: `Leave request ${status} successfully` });
      fetchLeaves();
    } catch {
      toast({ description: `Failed to ${status === "approved" ? "approve" : "reject"} leave request`, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground">
          Review and manage employee leave requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>Approve or reject pending leave requests from employees.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leave requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{leave.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{leave.employee_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{leave.type}</TableCell>
                    <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(leave.status)}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {leave.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(leave.id, "approved")}
                            disabled={actionLoading === leave.id}
                          >
                            {actionLoading === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(leave.id, "rejected")}
                            disabled={actionLoading === leave.id}
                          >
                            {actionLoading === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
