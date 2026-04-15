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
import { clinicalService, TherapistInvite } from "@/lib/api/clinical";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";

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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNotes, setInviteNotes] = useState("");
  const [invites, setInvites] = useState<TherapistInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Flag / reject dialog
  const [flagTarget, setFlagTarget] = useState<TherapistReview | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await clinicalService.getTherapists({ per_page: 50 });
      const raw = res as any;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      setTherapists(list);
    } catch {
      // 403 = insufficient role — silently show empty state rather than toasting
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const data = await clinicalService.getTherapistInvites();
      const raw = data as any;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      setInvites(list);
    } catch {
      setInvites([]);
      toast({ title: "Error", description: "Failed to load therapist invites.", variant: "destructive" });
    } finally {
      setInvitesLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadInvites(); }, []);

  const handleApprove = async (t: TherapistReview) => {
    setActingId(t.id);
    try {
      await clinicalService.approveTherapist(String(t.id));
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
      await clinicalService.rejectTherapist(String(flagTarget.id), flagReason.trim());
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

  const handleSendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast({ title: "Email required", description: "Enter therapist email to invite.", variant: "destructive" });
      return;
    }
    setIsInviting(true);
    try {
      await clinicalService.inviteTherapist(email, inviteNotes.trim() || undefined);
      toast({ title: "Invite sent", description: `Invite email sent to ${email}.` });
      setInviteEmail("");
      setInviteNotes("");
      await loadInvites();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send therapist invite.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invite: TherapistInvite) => {
    try {
      await clinicalService.revokeTherapistInvite(invite.id);
      toast({ title: "Invite revoked", description: `Invite for ${invite.email} was revoked.` });
      await loadInvites();
    } catch {
      toast({ title: "Error", description: "Failed to revoke invite.", variant: "destructive" });
    }
  };

  const inviteStatus = (invite: TherapistInvite) => {
    if (invite.accepted_at) return { label: "Joined", className: "bg-green-100 text-green-800" };
    if (new Date(invite.expires_at).getTime() < Date.now()) return { label: "Expired", className: "bg-gray-100 text-gray-700" };
    return { label: "Pending", className: "bg-amber-100 text-amber-800" };
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Therapist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Therapist Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="therapist@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-notes">Personal Note (optional)</Label>
              <Input
                id="invite-notes"
                placeholder="Brief intro for the invite..."
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSendInvite} disabled={isInviting} className="sm:w-auto w-full">
              {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invite
            </Button>
            <Button variant="outline" onClick={loadInvites} disabled={invitesLoading} className="sm:w-auto w-full">
              {invitesLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Refresh Invite Status
            </Button>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Expires</th>
                  <th className="text-left px-3 py-2">Joined At</th>
                  <th className="text-right px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No therapist invites yet.</td>
                  </tr>
                ) : (
                  invites.map((invite) => {
                    const status = inviteStatus(invite);
                    const accepted = Boolean(invite.accepted_at);
                    return (
                      <tr key={invite.id} className="border-t">
                        <td className="px-3 py-2 font-medium">{invite.email}</td>
                        <td className="px-3 py-2">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", status.className)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{format(new Date(invite.expires_at), "MMM d, yyyy")}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {invite.accepted_at ? format(new Date(invite.accepted_at), "MMM d, yyyy HH:mm") : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={accepted}
                            onClick={() => handleRevokeInvite(invite)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Link href={`/clinical/therapist-reviews?therapist=${t.id}`} className="sm:flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Full Review
                    </Button>
                  </Link>
                  {t.status === "pending" && (
                    <Button
                      size="sm"
                      className="gap-1 sm:shrink-0"
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
                      className="text-red-600 gap-1 sm:shrink-0"
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
