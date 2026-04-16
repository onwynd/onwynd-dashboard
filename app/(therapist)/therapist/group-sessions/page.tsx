"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { groupSessionApi } from "@/lib/api/groupSession";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UsersRound, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { SESSION_MODES } from "@/lib/constants/groupSessionModes";
import type { GroupSession } from "@/types/groupSession";

const STATUS_STYLES: Record<string, string> = {
  scheduled:   "bg-blue-50   text-blue-700   border-blue-200",
  active:      "bg-purple-50 text-purple-700 border-purple-200",
  completed:   "bg-green-50  text-green-700  border-green-200",
  cancelled:   "bg-red-50    text-red-700    border-red-200",
  expired:     "bg-zinc-100  text-zinc-500   border-zinc-200",
};

const ITEMS_PER_PAGE = 15;

export default function TherapistGroupSessionsPage() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = async () => {
    setIsLoading(true);
    try {
      const all = await groupSessionApi.getSessions(
        modeFilter !== "all" ? modeFilter : undefined
      );
      setSessions(all);
    } catch {
      toast({ title: "Error", description: "Failed to load group sessions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [modeFilter]);

  const paginated = sessions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const lastPage = Math.max(1, Math.ceil(sessions.length / ITEMS_PER_PAGE));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Group Sessions</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/therapist/group-settings">
            <Settings className="size-4 mr-2" />
            Group Settings
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={modeFilter} onValueChange={(v: string | null) => { setModeFilter(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="Session mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            {SESSION_MODES.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <UsersRound className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No group sessions yet.</p>
          <p className="text-xs text-muted-foreground">
            Enable group sessions in{" "}
            <Link href="/therapist/group-settings" className="underline">Group Settings</Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {paginated.map((s) => {
              const modeConfig = SESSION_MODES.find((m) => m.id === (s.mode ?? s.session_type));
              const scheduledDate = new Date(s.scheduled_at).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              });
              const scheduledTime = new Date(s.scheduled_at).toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit",
              });
              return (
                <div key={s.uuid} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: "var(--teal-light)" }}
                    >
                      {modeConfig?.icon ?? "👥"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-none mb-1">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {modeConfig?.label ?? s.session_type} · {scheduledDate} at {scheduledTime} · {s.duration_minutes ?? 60} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {s.current_participants}/{s.max_participants} joined
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${STATUS_STYLES[s.status] ?? ""}`}
                    >
                      {s.status}
                    </Badge>
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link href={`/sessions/group/${s.uuid}`}>View</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage} · {sessions.length} sessions
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
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
