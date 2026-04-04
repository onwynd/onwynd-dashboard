"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Video, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Session {
  id: number;
  patient_name: string;
  patient_email: string;
  is_anonymous: boolean;
  anonymous_username?: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  session_fee: number;
  formatted_fee: string;
  notes: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled:  "bg-blue-50   text-blue-700   border-blue-200",
  completed:  "bg-green-50  text-green-700  border-green-200",
  cancelled:  "bg-red-50    text-red-700    border-red-200",
  in_progress:"bg-purple-50 text-purple-700 border-purple-200",
  no_show:    "bg-zinc-100  text-zinc-500   border-zinc-200",
};

const ITEMS_PER_PAGE = 15;

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("week");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, per_page: ITEMS_PER_PAGE };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (view === "week") params.type = "upcoming";
      const raw = await therapistService.getSessions(params) as any;
      // Backend returns a Laravel paginator object — unwrap
      const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const totalCount: number = raw?.total ?? rows.length;

      // Normalise backend fields → frontend Session interface
      const items: Session[] = rows.map((s) => {
        const scheduledAt = s.scheduled_at ? new Date(s.scheduled_at) : null;
        const patientUser = s.patient ?? {};
        const firstName = patientUser.first_name ?? "";
        const lastName  = patientUser.last_name  ?? "";
        const fullName  = [firstName, lastName].filter(Boolean).join(" ") || "Patient";
        return {
          id: s.id,
          patient_name:    s.patient_name    ?? fullName,
          patient_email:   s.patient_email   ?? (patientUser.email ?? ""),
          is_anonymous:    s.is_anonymous    ?? false,
          anonymous_username: s.anonymous_nickname ?? s.anonymous_username,
          date: s.date ?? (scheduledAt ? scheduledAt.toISOString().split("T")[0] : ""),
          time: s.time ?? (scheduledAt ? scheduledAt.toTimeString().substring(0, 5) : ""),
          duration:      s.duration      ?? s.duration_minutes ?? 60,
          status:        s.status,
          session_fee:   s.session_fee   ?? s.session_rate ?? 0,
          formatted_fee: s.formatted_fee ?? (s.session_rate ? `₦${Number(s.session_rate).toLocaleString()}` : "—"),
          notes:         s.notes         ?? s.booking_notes ?? null,
        };
      });

      setSessions(items);
      setTotal(totalCount);
    } catch {
      toast({ title: "Error", description: "Failed to load sessions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [view, page, statusFilter, search]);

  const lastPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Video className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search patient…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            className="h-9 w-56 text-sm"
          />
          <Button size="sm" variant="outline" className="h-9"
            onClick={() => { setSearch(searchInput); setPage(1); }}>
            <Search className="size-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v: string | null) => { setStatusFilter(v || "all"); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={view} onValueChange={(v: string | null) => { if (v) { setView(v); setPage(1); } }}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Notes</TableHead>
              <TableHead className="w-[110px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                    No sessions found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {s.is_anonymous ? (
                            <span className="flex items-center gap-1">
                              <span className="text-muted-foreground">🕵️</span>
                              {s.anonymous_username || "Anonymous User"}
                            </span>
                          ) : (
                            s.patient_name
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.is_anonymous ? "Anonymous Email" : s.patient_email}
                        </p>
                        {s.is_anonymous && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            🔒 Patient has chosen to remain anonymous
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-sm">{s.time}</TableCell>
                    <TableCell className="text-sm">{s.duration} min</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[s.status] ?? ""}`}>
                        {s.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{s.formatted_fee}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {s.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      {(s.status === "scheduled" || s.status === "in_progress") && (
                        <Button asChild size="sm" className="h-7 gap-1.5 text-xs">
                          <Link href={`/therapist/sessions/${s.id}/room`}>
                            <Video className="size-3" />
                            Join
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {lastPage > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage} · {total} sessions
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
