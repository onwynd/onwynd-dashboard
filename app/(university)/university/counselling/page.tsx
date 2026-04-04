"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope, Users, CalendarDays, TrendingUp } from "lucide-react";

// Mock data — replace with API calls when counselling endpoints are ready
const mockReferrals = [
  { id: 1, studentId: "STU-001", referredBy: "Wellness App", reason: "Anxiety – self-referred", priority: "medium", status: "pending", date: "2026-03-28" },
  { id: 2, studentId: "STU-002", referredBy: "Crisis Alert", reason: "Severe distress flag", priority: "high", status: "in_progress", date: "2026-03-29" },
  { id: 3, studentId: "STU-003", referredBy: "Wellness App", reason: "Depression screening score", priority: "high", status: "pending", date: "2026-03-30" },
  { id: 4, studentId: "STU-004", referredBy: "Academic Staff", reason: "Academic performance concern", priority: "low", status: "completed", date: "2026-03-25" },
  { id: 5, studentId: "STU-005", referredBy: "Wellness App", reason: "Stress – exam period", priority: "medium", status: "completed", date: "2026-03-26" },
];

const stats = [
  { label: "Active Referrals", value: "3", icon: Stethoscope, color: "text-teal" },
  { label: "Students Supported", value: "47", icon: Users, color: "text-blue-600" },
  { label: "Sessions This Month", value: "62", icon: CalendarDays, color: "text-purple-600" },
  { label: "Completion Rate", value: "84%", icon: TrendingUp, color: "text-green-600" },
];

function priorityVariant(p: string): "default" | "secondary" | "destructive" | "outline" {
  if (p === "high") return "destructive";
  if (p === "medium") return "secondary";
  return "outline";
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "completed") return "default";
  if (s === "in_progress") return "secondary";
  return "outline";
}

export default function CounsellingPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");

  const filtered = mockReferrals.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Counselling Centre</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage referrals to on-campus counselling and track student support outcomes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Referrals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Counselling Referrals</CardTitle>
              <CardDescription>Anonymised referral pipeline from the wellness platform.</CardDescription>
            </div>
            <div className="flex rounded-lg border overflow-hidden">
              {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No referrals found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.studentId}</TableCell>
                      <TableCell className="text-sm">{r.referredBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                      <TableCell>
                        <Badge variant={priorityVariant(r.priority)}>{r.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.date}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)}>
                          {r.status.replace("_", " ")}
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

      {/* Info note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-sm text-blue-800">
          <strong>Note:</strong> This section will connect to your counselling centre's scheduling system when the integration API is ready. Currently showing mock data for layout validation.
        </CardContent>
      </Card>
    </div>
  );
}
