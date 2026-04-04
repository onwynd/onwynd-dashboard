"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, FileBarChart, Calendar, CheckCircle2, Clock } from "lucide-react";

interface Report {
  id: number;
  title: string;
  type: "compliance" | "security" | "access" | "activity" | "ndpr";
  period: string;
  generated_at: string;
  generated_by: string;
  status: "ready" | "pending" | "scheduled";
  size_kb?: number;
}

const SAMPLE_REPORTS: Report[] = [
  { id: 1, title: "NDPR Annual Compliance Report 2025", type: "ndpr",       period: "Jan–Dec 2025",     generated_at: "2026-01-10", generated_by: "Compliance Officer", status: "ready",   size_kb: 840  },
  { id: 2, title: "Q1 2026 Security Events Summary",    type: "security",   period: "Jan–Mar 2026",     generated_at: "2026-03-29", generated_by: "Audit System",       status: "ready",   size_kb: 220  },
  { id: 3, title: "Q1 2026 Access Control Audit",       type: "access",     period: "Jan–Mar 2026",     generated_at: "2026-03-29", generated_by: "Audit System",       status: "ready",   size_kb: 510  },
  { id: 4, title: "March 2026 User Activity Report",    type: "activity",   period: "March 2026",       generated_at: "2026-03-29", generated_by: "Audit System",       status: "ready",   size_kb: 145  },
  { id: 5, title: "Q2 2026 Compliance Report",          type: "compliance", period: "Apr–Jun 2026",     generated_at: "—",          generated_by: "Scheduled",          status: "scheduled" },
  { id: 6, title: "NDPR Mid-Year Review 2026",          type: "ndpr",       period: "Jan–Jun 2026",     generated_at: "—",          generated_by: "Pending",            status: "pending"  },
];

const TYPE_BADGE: Record<string, string> = {
  ndpr:       "bg-blue-50 text-blue-700",
  security:   "bg-red-50 text-red-700",
  access:     "bg-purple-50 text-purple-700",
  activity:   "bg-slate-100 text-slate-700",
  compliance: "bg-emerald-50 text-emerald-700",
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; badge: string; label: string }> = {
  ready:     { icon: CheckCircle2, badge: "bg-emerald-50 text-emerald-700", label: "Ready"     },
  pending:   { icon: Clock,        badge: "bg-yellow-50 text-yellow-700",   label: "Pending"   },
  scheduled: { icon: Calendar,     badge: "bg-blue-50 text-blue-700",       label: "Scheduled" },
};

export default function AuditReportsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch]         = useState("");

  const visible = SAMPLE_REPORTS.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const readyCount = SAMPLE_REPORTS.filter((r) => r.status === "ready").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Compliance, security, and access audit reports</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-emerald-500" />
          {readyCount} reports ready to download
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Input
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v !== null && setTypeFilter(v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ndpr">NDPR</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="access">Access</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No reports match your filters.</p>
        ) : (
          visible.map((r) => {
            const sc = STATUS_CONFIG[r.status];
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileBarChart className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold">{r.title}</p>
                        <Badge className={`text-xs capitalize ${TYPE_BADGE[r.type]}`}>{r.type}</Badge>
                        <Badge className={`text-xs ${sc.badge}`}>{sc.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Period: {r.period}</span>
                        {r.generated_at !== "—" && <span>Generated: {r.generated_at}</span>}
                        <span>By: {r.generated_by}</span>
                        {r.size_kb && <span>{r.size_kb} KB</span>}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={r.status !== "ready"}
                      className="gap-1.5 shrink-0"
                    >
                      <Download className="size-3.5" />
                      {r.status === "ready" ? "Download" : r.status === "pending" ? "Generating…" : "Scheduled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Schedule a New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Custom report generation is handled by the Compliance Officer. Contact the compliance portal or raise an internal request.
          </p>
          <Button variant="outline" size="sm" disabled>
            <Calendar className="size-4 mr-2" />
            Request Custom Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
