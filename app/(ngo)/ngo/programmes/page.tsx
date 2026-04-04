"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartHandshake, Users, TrendingUp, CheckCircle } from "lucide-react";

type ProgrammeStatus = "active" | "planned" | "completed" | "paused";

type Programme = {
  id: number;
  name: string;
  target: string;
  beneficiaries: number;
  status: ProgrammeStatus;
  startDate: string;
  endDate?: string;
  description: string;
};

// Mock data — replace with API when programme endpoints are ready
const mockProgrammes: Programme[] = [
  { id: 1, name: "Grief & Loss Support Circle", target: "Bereaved adults", beneficiaries: 34, status: "active", startDate: "2026-01-10", description: "Group-based peer support facilitated by a licensed counsellor." },
  { id: 2, name: "Youth Resilience Programme", target: "Ages 14–25", beneficiaries: 78, status: "active", startDate: "2026-02-01", description: "Six-week structured resilience-building curriculum." },
  { id: 3, name: "Caregiver Wellbeing Initiative", target: "Family caregivers", beneficiaries: 22, status: "planned", startDate: "2026-04-15", description: "Online and in-person sessions for those caring for mentally ill relatives." },
  { id: 4, name: "Community Stress Clinic", target: "General community", beneficiaries: 110, status: "completed", startDate: "2025-09-01", endDate: "2026-01-31", description: "Walk-in stress and anxiety screenings with referral pipeline." },
  { id: 5, name: "Refugee Mental Health Outreach", target: "Displaced populations", beneficiaries: 55, status: "active", startDate: "2026-03-01", description: "Culturally sensitive trauma-informed care for refugee communities." },
];

const stats = [
  { label: "Active Programmes", value: mockProgrammes.filter(p => p.status === "active").length.toString(), icon: HeartHandshake, color: "text-teal" },
  { label: "Total Beneficiaries", value: mockProgrammes.reduce((s, p) => s + p.beneficiaries, 0).toString(), icon: Users, color: "text-blue-600" },
  { label: "Completed", value: mockProgrammes.filter(p => p.status === "completed").length.toString(), icon: CheckCircle, color: "text-green-600" },
  { label: "Planned", value: mockProgrammes.filter(p => p.status === "planned").length.toString(), icon: TrendingUp, color: "text-purple-600" },
];

function statusVariant(s: ProgrammeStatus): "default" | "secondary" | "destructive" | "outline" {
  if (s === "active") return "default";
  if (s === "completed") return "secondary";
  if (s === "paused") return "destructive";
  return "outline";
}

export default function ProgrammesPage() {
  const [filter, setFilter] = useState<"all" | ProgrammeStatus>("all");
  const filtered = mockProgrammes.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programmes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your organisation's mental health programmes and track beneficiary impact.
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>All Programmes</CardTitle>
              <CardDescription>Track delivery, reach, and status across all initiatives.</CardDescription>
            </div>
            <div className="flex rounded-lg border overflow-hidden">
              {(["all", "active", "planned", "completed", "paused"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No programmes found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programme</TableHead>
                    <TableHead>Target Group</TableHead>
                    <TableHead>Beneficiaries</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.target}</TableCell>
                      <TableCell className="text-sm font-medium">{p.beneficiaries}</TableCell>
                      <TableCell className="text-sm">{p.startDate}</TableCell>
                      <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-sm text-blue-800">
          <strong>Note:</strong> Programme data will sync from your programme management API when the integration is ready. Currently showing mock data.
        </CardContent>
      </Card>
    </div>
  );
}
