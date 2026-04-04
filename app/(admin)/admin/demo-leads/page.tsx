"use client";

/**
 * Demo Leads — /admin/demo-leads
 *
 * Shows all demo requests from the public site.
 * Admin / CEO / COO can schedule the call and assign it to a sales rep.
 * On save the backend creates a CalendarEvent in the sales rep's calendar
 * and sends them a bell notification.
 */

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import client from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, CalendarPlus, CalendarIcon, CheckCircle2,
  Building2, User, Mail, Phone, RefreshCw, Users,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface DemoLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  status: string;
  source: string;
  assigned_to?: number;
  notes?: string;
  created_at: string;
  assigned_user?: { id: number; first_name: string; last_name: string; email: string };
}

interface SalesUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

// ── Time slots ───────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "07:00","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00",
];

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-green-100 text-green-800",
  lost:      "bg-gray-100 text-gray-600",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DemoLeadsPage() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign dialog
  const [selected, setSelected] = useState<DemoLead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/demo-leads");
      const data = res.data.data ?? res.data;
      setLeads(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load demo leads.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalesUsers = useCallback(async () => {
    try {
      const res = await client.get("/api/v1/admin/users", {
        params: { role: "sales,finder,closer,builder", per_page: 100 },
      });
      const data = res.data.data ?? res.data;
      setSalesUsers(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchSalesUsers();
  }, [fetchLeads, fetchSalesUsers]);

  const openAssign = (lead: DemoLead) => {
    setSelected(lead);
    setAssignUserId(lead.assigned_to?.toString() ?? "");
    setScheduleDate(undefined);
    setScheduleTime("10:00");
    setMeetingLink("");
    setNotes("");
    setSaved(false);
    setDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selected || !assignUserId) return;
    setSaving(true);
    try {
      let scheduledAt: string | undefined;
      if (scheduleDate) {
        const [h, m] = scheduleTime.split(":").map(Number);
        const dt = new Date(scheduleDate);
        dt.setHours(h, m, 0, 0);
        scheduledAt = dt.toISOString();
      }

      await client.post(`/api/v1/admin/leads/${selected.id}/assign-demo`, {
        user_id:      parseInt(assignUserId),
        scheduled_at: scheduledAt,
        meeting_link: meetingLink || undefined,
        notes:        notes || undefined,
      });

      setSaved(true);
      fetchLeads();
      toast({ title: "Demo assigned", description: "Calendar event created and sales rep notified." });
    } catch {
      toast({ title: "Error", description: "Failed to assign demo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demo Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Incoming demo requests from onwynd.com — schedule and assign to your sales team.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Lead cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No demo requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leads.map((lead) => (
            <Card key={lead.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {lead.first_name} {lead.last_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lead.company}</span>
                    </p>
                  </div>
                  <Badge className={cn("shrink-0 text-xs", STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600")}>
                    {lead.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{lead.email}</p>
                  {lead.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{lead.phone}</p>}
                  <p className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {lead.assigned_user
                      ? `Assigned to ${lead.assigned_user.first_name} ${lead.assigned_user.last_name}`
                      : "Unassigned"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    Received {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2 mt-2"
                  variant={lead.assigned_to ? "outline" : "default"}
                  onClick={() => openAssign(lead)}
                >
                  <CalendarPlus className="h-4 w-4" />
                  {lead.assigned_to ? "Reassign / Reschedule" : "Schedule & Assign"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              {saved ? "Assigned!" : `Schedule Demo — ${selected?.company}`}
            </DialogTitle>
          </DialogHeader>

          {saved ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="font-semibold">Demo scheduled</p>
              <p className="text-sm text-muted-foreground">
                The sales rep has been notified and the event is on their calendar.
              </p>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                {/* Sales rep */}
                <div className="space-y-1.5">
                  <Label>Assign to sales rep</Label>
                  <Select value={assignUserId} onValueChange={(v) => v !== null && setAssignUserId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a rep…" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.first_name} {u.last_name} — {u.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate ? format(scheduleDate, "MMM d, yyyy") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={(d) => { setScheduleDate(d); setDatePickerOpen(false); }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Select value={scheduleTime} onValueChange={(v) => v !== null && setScheduleTime(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Meeting link */}
                <div className="space-y-1.5">
                  <Label>Meeting link <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/…"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label>Notes for rep <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Context, talking points…"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={saving || !assignUserId} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                  Assign demo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
