"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCheck, RefreshCw, Star, FileText, ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { adminService } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TherapistReview {
  id: number;
  therapist_id: number;
  therapist_name: string;
  specializations?: string[];
  status: "pending" | "approved" | "flagged" | "rejected" | "suspended";
  sessions_count: number;
  avg_rating?: number;
  last_session_at?: string;
  documents_uploaded: boolean;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800",
  approved:  "bg-green-100 text-green-800",
  flagged:   "bg-red-100 text-red-800",
  rejected:  "bg-red-100 text-red-800",
  suspended: "bg-gray-100 text-gray-600",
};

export default function TherapistReviewsPage() {
  const [therapists, setTherapists] = useState<TherapistReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  // Flag / reject dialog
  const [flagTarget, setFlagTarget] = useState<TherapistReview | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTherapists({ per_page: 50 });
      const raw = res as any;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      setTherapists(list);
    } catch {
      toast({ title: "Error", description: "Failed to load therapist reviews.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (t: TherapistReview) => {
    setActingId(t.id);
    try {
      await adminService.approveTherapist(String(t.id));
      setTherapists(prev => prev.map(x => x.id === t.id ? { ...x, status: "approved" } : x));
      toast({ title: "Approved", description: `${t.therapist_name} has been approved.` });
    } catch {
      toast({ title: "Error", description: "Could not approve therapist.", variant: "destructive" });
    } finally {
      setActingId(null);
    }
  };

  const handleFlagSubmit = async () => {
    if (!flagTarget) return;
    if (!flagReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for flagging.", variant: "destructive" });
      return;
    }
    setFlagging(true);
    try {
      await adminService.rejectTherapist(String(flagTarget.id), flagReason.trim());
      setTherapists(prev => prev.map(x => x.id === flagTarget.id ? { ...x, status: "flagged" } : x));
      toast({ title: "Flagged", description: `${flagTarget.therapist_name} has been flagged.` });
      setFlagTarget(null);
      setFlagReason("");
    } catch {
      toast({ title: "Error", description: "Could not flag therapist.", variant: "destructive" });
    } finally {
      setFlagging(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-teal" />
            Therapist Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review therapist profiles, sessions, and quality metrics.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : therapists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <UserCheck className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No therapists to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {therapists.map(t => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{t.therapist_name}</CardTitle>
                  <Badge className={cn("shrink-0 text-xs capitalize", STATUS_COLOR[t.status] ?? "bg-gray-100 text-gray-600")}>
                    {t.status}
                  </Badge>
                </div>
                {t.specializations && t.specializations.length > 0 && (
                  <p className="text-xs text-muted-foreground">{t.specializations.join(", ")}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {t.sessions_count} sessions
                  </span>
                  {t.avg_rating !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {t.avg_rating.toFixed(1)}
                    </span>
                  )}
                  <span className={cn("flex items-center gap-1 text-xs", t.documents_uploaded ? "text-green-600" : "text-red-500")}>
                    {t.documents_uploaded ? "Docs ✓" : "Docs missing"}
                  </span>
                </div>
                {t.last_session_at && (
                  <p className="text-xs text-muted-foreground">
                    Last session: {format(new Date(t.last_session_at), "MMM d, yyyy")}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Link href="/admin/therapists" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Full Review
                    </Button>
                  </Link>
                  {t.status === "pending" && (
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={actingId === t.id}
                      onClick={() => handleApprove(t)}
                    >
                      {actingId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Approve
                    </Button>
                  )}
                  {(t.status === "approved" || t.status === "pending") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 gap-1"
                      onClick={() => { setFlagTarget(t); setFlagReason(""); }}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Flag
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Flag / reject dialog */}
      <Dialog open={!!flagTarget} onOpenChange={(o) => { if (!o) { setFlagTarget(null); setFlagReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flag Therapist</DialogTitle>
            <DialogDescription>
              Provide a reason for flagging <strong>{flagTarget?.therapist_name}</strong>. This will be recorded and the therapist will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="flag-reason">Reason <span className="text-red-500">*</span></Label>
            <Textarea
              id="flag-reason"
              placeholder="Describe the issue or concern…"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFlagTarget(null); setFlagReason(""); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFlagSubmit} disabled={flagging}>
              {flagging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
