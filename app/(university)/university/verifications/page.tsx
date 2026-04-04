"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { institutionalService } from "@/lib/api/institutional";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type Verification = {
  id: number;
  student_email: string;
  student_id?: string;
  faculty?: string;
  year_of_study?: number;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
};

export default function StudentVerificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await institutionalService.getStudentVerifications() as { data?: Verification[] } | null;
        if (data?.data) setVerifications(data.data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = verifications.filter((v) =>
    v.student_email.toLowerCase().includes(search.toLowerCase()) ||
    (v.faculty ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.student_id ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const pending = verifications.filter((v) => v.status === "pending").length;
  const approved = verifications.filter((v) => v.status === "approved").length;
  const rejected = verifications.filter((v) => v.status === "rejected").length;

  function statusIcon(status: string) {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-orange-500" />;
  }

  function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "outline";
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Verifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and approve student enrolment verification requests for subsidised access.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Requests</CardTitle>
            <Input
              placeholder="Search by email, faculty, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No verification requests found.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-sm">{v.student_email}</TableCell>
                      <TableCell className="font-mono text-sm">{v.student_id ?? "—"}</TableCell>
                      <TableCell className="text-sm">{v.faculty ?? "—"}</TableCell>
                      <TableCell className="text-sm">{v.year_of_study ? `Year ${v.year_of_study}` : "—"}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(v.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {statusIcon(v.status)}
                          <Badge variant={statusVariant(v.status)}>
                            {v.status}
                          </Badge>
                        </div>
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
