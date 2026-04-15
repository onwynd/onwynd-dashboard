"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCw, Star, User, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { clinicalService } from "@/lib/api/clinical";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Session {
  uuid: string;
  patient_name?: string;
  therapist_name?: string;
  status: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  rating?: number;
  flagged: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  completed:  "bg-green-100 text-green-800",
  in_progress:"bg-blue-100 text-blue-800",
  scheduled:  "bg-amber-100 text-amber-800",
  cancelled:  "bg-gray-100 text-gray-600",
};

export default function SessionReviewPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await clinicalService.getReviews({ per_page: 50, sort: "-created_at" });
      const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      // Map clinical review shape → Session display shape
      setSessions(rows.map((r: Record<string, unknown>) => ({
        uuid:             (r.uuid ?? r.session_id ?? r.id) as string,
        patient_name:     (r.patient_name ?? (r.user as Record<string,unknown>)?.first_name) as string | undefined,
        therapist_name:   (r.therapist_name ?? (r.therapist as Record<string,unknown>)?.first_name) as string | undefined,
        status:           (r.review_status ?? r.status ?? "pending") as string,
        started_at:       (r.created_at ?? r.started_at) as string | undefined,
        ended_at:         r.ended_at as string | undefined,
        duration_minutes: r.duration_minutes as number | undefined,
        rating:           r.rating as number | undefined,
        flagged:          r.review_status === "flagged" || r.review_status === "escalated",
      })));
    } catch {
      toast({ title: "Error", description: "Failed to load session reviews.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal" />
            Session Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review recent therapy sessions for quality and compliance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No sessions to review.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{sessions.length} recent sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sessions.map(s => (
              <div key={s.uuid} className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{s.patient_name ?? "Patient"}</span>
                    <span className="text-xs text-muted-foreground">with {s.therapist_name ?? "Therapist"}</span>
                    {s.flagged && <Badge variant="destructive" className="text-xs">Flagged</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {s.started_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(s.started_at), "MMM d, yyyy HH:mm")}
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
                <Badge className={cn("shrink-0 text-xs capitalize", STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-600")}>
                  {s.status}
                </Badge>
                <Link href={`/clinical/session-audits?session=${encodeURIComponent(s.uuid)}`}>
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
