"use client";

/**
 * SessionsOverviewPanel
 * Shared component used by clinical advisor and admin calendars.
 * Shows all therapy sessions with therapist, patient, status, and time.
 */

import { useEffect, useState } from "react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Activity, RefreshCw, User, Clock, Star, Search } from "lucide-react";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface TherapySession {
  uuid: string;
  patient_name?: string;
  therapist_name?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | string;
  started_at?: string;
  scheduled_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  rating?: number;
  flagged?: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  scheduled:   "bg-amber-100 text-amber-800 border-amber-200",
  completed:   "bg-green-100 text-green-800 border-green-200",
  cancelled:   "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_DOT: Record<string, string> = {
  in_progress: "bg-blue-500 animate-pulse",
  scheduled:   "bg-amber-400",
  completed:   "bg-green-500",
  cancelled:   "bg-gray-300",
};

function sessionDate(s: TherapySession) {
  const raw = s.started_at ?? s.scheduled_at;
  if (!raw) return null;
  try { return new Date(raw); } catch { return null; }
}

function dateLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isThisWeek(d)) return format(d, "EEEE");
  return format(d, "MMM d");
}

export function SessionsOverviewPanel() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/sessions", {
        params: { per_page: 100, sort: "-started_at" },
      });
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = sessions.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.patient_name?.toLowerCase().includes(q) ||
        s.therapist_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const active     = sessions.filter(s => s.status === "in_progress").length;
  const scheduled  = sessions.filter(s => s.status === "scheduled").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {active} live
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {scheduled} upcoming
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search therapist or patient…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v !== null && setFilter(v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in_progress">Live now</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No sessions match your filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{visible.length} session{visible.length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {visible.map(s => {
              const d = sessionDate(s);
              return (
                <div
                  key={s.uuid}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Status dot */}
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-0.5", STATUS_DOT[s.status] ?? "bg-gray-300")} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{s.patient_name ?? "Patient"}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground truncate">{s.therapist_name ?? "Therapist"}</span>
                      {s.flagged && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Flagged</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {d && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dateLabel(d)} {format(d, "HH:mm")}
                        </span>
                      )}
                      {s.duration_minutes && <span>{s.duration_minutes} min</span>}
                      {s.rating && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {s.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge className={cn("shrink-0 text-xs capitalize border", STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-500")}>
                    {s.status === "in_progress" ? "Live" : s.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
