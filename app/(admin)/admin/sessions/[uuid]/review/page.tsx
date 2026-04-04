"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import client from "@/lib/api/client";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SessionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    status: string | null;
    admin_notes: string;
    generate_commission: boolean;
  }>({
    status: "",
    admin_notes: "",
    generate_commission: false
  });

  useEffect(() => {
    fetchSession();
  }, [uuid]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/api/v1/admin/sessions/${uuid}/review`);
      setSession(res.data?.data || null);
      if (res.data?.data) {
        setFormData({
          status: res.data.data.status,
          admin_notes: res.data.data.notes || "",
          generate_commission: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch session", error);
      toast.error("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await client.put(`/api/v1/admin/sessions/${uuid}/review`, formData);
      toast.success("Session review updated successfully");
      router.push("/admin/sessions");
    } catch (error) {
      console.error("Failed to update session review", error);
      toast.error("Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading session details...</div>;
  if (!session) return <div className="p-8 text-center">Session not found.</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-3xl font-bold">Session Review</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>System recorded information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Session UUID</span>
              <span className="text-sm font-mono">{session.uuid.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Patient</span>
              <span className="text-sm">{session.patient?.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Therapist</span>
              <span className="text-sm">{session.therapist?.user?.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Scheduled At</span>
              <span className="text-sm">{format(new Date(session.scheduled_at), "MMM d, yyyy HH:mm")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <span className="text-sm capitalize">{session.session_type}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">System Status</span>
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>{session.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Analytics</CardTitle>
            <CardDescription>Actual participant activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Patient Joined At</span>
              <span className="text-sm">{session.patient_joined_at ? format(new Date(session.patient_joined_at), "HH:mm:ss") : "NEVER"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Therapist Joined At</span>
              <span className="text-sm">{session.therapist_joined_at ? format(new Date(session.therapist_joined_at), "HH:mm:ss") : "NEVER"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Session Started At</span>
              <span className="text-sm">{session.session_started_at ? format(new Date(session.session_started_at), "HH:mm:ss") : "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Actual Duration</span>
              <span className="text-sm font-bold">{session.actual_duration_minutes || 0} minutes</span>
            </div>
            <div className="pt-2">
              {session.actual_duration_minutes < 25 && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  ⚠️ SHORT DURATION ALERT: Session lasted less than 25 minutes.
                </div>
              )}
              {!session.patient_joined_at && (
                <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-xs font-bold mt-2 flex items-center gap-2">
                  ⚠️ NO-SHOW ALERT: Patient never joined the room.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review & Decision</CardTitle>
          <CardDescription>Admin override for session status and payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Final Status</Label>
              <Select value={formData.status} onValueChange={(v: string | null) => setFormData({...formData, status: v ?? ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select final status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed (Mark as successful)</SelectItem>
                  <SelectItem value="no_show">No Show (Patient missed session)</SelectItem>
                  <SelectItem value="ended_early">Ended Early (Incomplete)</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Switch 
                id="commission" 
                checked={formData.generate_commission}
                onCheckedChange={(v) => setFormData({...formData, generate_commission: v})}
              />
              <Label htmlFor="commission">Generate Therapist Commission</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Admin Review Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Reason for decision..." 
              value={formData.admin_notes}
              onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
            />
            <p className="text-xs text-muted-foreground italic">These notes will be stored for audit purposes.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Save Final Decision"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
