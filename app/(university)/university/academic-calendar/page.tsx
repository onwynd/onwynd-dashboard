"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarDays, Info } from "lucide-react";

type RiskLevel = "high" | "medium" | "low";

type AcademicPeriod = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  riskLevel: RiskLevel;
  description: string;
  active: boolean;
};

// Seeded academic calendar — replace with API when ready
const academicPeriods: AcademicPeriod[] = [
  {
    id: 1,
    name: "Semester 1 Exams",
    startDate: "2026-01-10",
    endDate: "2026-01-24",
    riskLevel: "high",
    description: "High-stress exam period. Historically correlated with increased wellness flags.",
    active: false,
  },
  {
    id: 2,
    name: "Results Day – Semester 1",
    startDate: "2026-02-07",
    endDate: "2026-02-08",
    riskLevel: "high",
    description: "Academic results publication. Monitor for distress spikes in the 48h window.",
    active: false,
  },
  {
    id: 3,
    name: "Mid-Semester Break",
    startDate: "2026-03-14",
    endDate: "2026-03-21",
    riskLevel: "low",
    description: "Lower academic pressure. Good period for proactive outreach.",
    active: false,
  },
  {
    id: 4,
    name: "Fresher's Week",
    startDate: "2026-09-07",
    endDate: "2026-09-13",
    riskLevel: "medium",
    description: "Transition period for new students. Elevated loneliness and adjustment stress.",
    active: false,
  },
  {
    id: 5,
    name: "Semester 2 Exams",
    startDate: "2026-05-04",
    endDate: "2026-05-22",
    riskLevel: "high",
    description: "End-of-year examinations. Peak wellness flag period across all cohorts.",
    active: true,
  },
  {
    id: 6,
    name: "Dissertation Deadline",
    startDate: "2026-04-17",
    endDate: "2026-04-17",
    riskLevel: "high",
    description: "Final-year dissertation submission. Elevated anxiety and burnout risk.",
    active: true,
  },
  {
    id: 7,
    name: "Graduation Transition",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    riskLevel: "medium",
    description: "Post-study transition. Identity and uncertainty-related distress common.",
    active: false,
  },
];

const riskConfig: Record<RiskLevel, { label: string; variant: "destructive" | "secondary" | "outline"; color: string }> = {
  high:   { label: "High Risk",   variant: "destructive", color: "border-l-red-500"    },
  medium: { label: "Medium Risk", variant: "secondary",   color: "border-l-orange-400" },
  low:    { label: "Low Risk",    variant: "outline",     color: "border-l-green-500"  },
};

export default function AcademicCalendarPage() {
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");

  const filtered = academicPeriods.filter((p) => filter === "all" || p.riskLevel === filter);
  const active = academicPeriods.filter((p) => p.active);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Key academic periods and their associated mental health risk levels. Use this to prepare proactive support.
        </p>
      </div>

      {/* Active period alert */}
      {active.length > 0 && (
        <div className="rounded-xl border bg-red-50 border-red-200 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="text-red-600 h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong>Active high-stress period{active.length > 1 ? "s" : ""}:</strong>{" "}
            {active.map((p) => p.name).join(", ")}. Consider proactive counselling outreach now.
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Filter:</span>
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Period cards */}
      <div className="space-y-3">
        {filtered.map((period) => {
          const risk = riskConfig[period.riskLevel];
          return (
            <Card key={period.id} className={`border-l-4 ${risk.color}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base">{period.name}</h3>
                      <Badge variant={risk.variant}>{risk.label}</Badge>
                      {period.active && (
                        <Badge className="bg-teal text-white animate-pulse">Active Now</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{period.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {period.startDate === period.endDate
                          ? period.startDate
                          : `${period.startDate} → ${period.endDate}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-2 text-sm text-blue-800">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Dates and risk levels are editable from the admin panel. When the calendar API is ready,
            these periods will sync automatically with your university timetable system.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
