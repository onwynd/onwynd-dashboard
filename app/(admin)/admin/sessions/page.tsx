"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/lib/api/client";
import { format } from "date-fns";
import Link from "next/link";
import { Search, Calendar, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";

const STATUS_STYLES: Record<string, string> = {
  completed:  "bg-emerald-50 text-emerald-700",
  ongoing:    "bg-blue-50 text-blue-600",
  cancelled:  "bg-red-50 text-red-700",
  scheduled:  "bg-gray-50 text-gray-600",
  no_show:    "bg-orange-50 text-orange-700",
};

function SessionStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/sessions");
      const raw = res.data?.data;
      setSessions(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = (sessions as Record<string, unknown>[]).filter((s) => {
    const patient = s.patient as Record<string, unknown> | undefined;
    const therapist = s.therapist as Record<string, unknown> | undefined;
    const therapistUser = therapist?.user as Record<string, unknown> | undefined;
    const q = search.toLowerCase();
    return (
      (patient?.full_name as string)?.toLowerCase().includes(q) ||
      (therapistUser?.full_name as string)?.toLowerCase().includes(q) ||
      (s.uuid as string)?.includes(search)
    );
  });

  return (
    <main className="p-6 space-y-6">
      <PageHeader
        title="Platform Sessions"
        subtitle="All therapy sessions across the platform"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search sessions…"
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchSessions} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date &amp; Time</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Therapist</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableBodyShimmer rows={6} cols={7} />
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16">
                        <Calendar className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-600">No sessions found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {search ? "Try a different search term" : "Sessions will appear here once scheduled"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session, idx) => {
                    const s = session as Record<string, unknown>;
                    const patient = s.patient as Record<string, unknown> | undefined;
                    const therapist = s.therapist as Record<string, unknown> | undefined;
                    const therapistUser = therapist?.user as Record<string, unknown> | undefined;
                    return (
                      <TableRow
                        key={s.id as string}
                        className={idx % 2 === 0 ? "bg-white hover:bg-teal/5" : "bg-gray-50/50 hover:bg-teal/5"}
                      >
                        <TableCell className="px-4 py-3 font-medium text-sm">
                          {s.scheduled_at
                            ? format(new Date(s.scheduled_at as string), "MMM d, yyyy HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {(patient?.full_name as string) || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">{patient?.email as string}</p>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {(therapistUser?.full_name as string) || "Unknown"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm capitalize text-gray-600">
                          {(s.session_type as string)?.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <SessionStatusBadge status={s.status as string} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600">
                          {((s.actual_duration_minutes as number) || 0)} mins
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm" className="text-teal hover:text-teal hover:bg-teal/5">
                            <Link href={`/admin/sessions/${s.uuid as string}/review`}>Review</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
