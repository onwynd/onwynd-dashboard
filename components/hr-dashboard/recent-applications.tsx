"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hrService } from "@/lib/api/hr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-yellow-100 text-yellow-800",
  reviewing:   "bg-blue-100 text-blue-800",
  shortlisted: "bg-purple-100 text-purple-800",
  interviewed: "bg-indigo-100 text-indigo-800",
  offered:     "bg-cyan-100 text-cyan-800",
  hired:       "bg-green-100 text-green-800",
  rejected:    "bg-red-100 text-red-800",
  withdrawn:   "bg-gray-100 text-gray-700",
};

interface Application {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  job_posting?: { title: string; department: string };
}

export function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hrService.getRecentJobApplications()
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Briefcase className="h-5 w-5" /> Recent Job Applications
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/hr/careers/applications">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No recent applications</p>
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((app) => (
              <li key={app.uuid} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {app.first_name} {app.last_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {app.job_posting?.title ?? "—"} · {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-gray-100"}`}>
                  {app.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
