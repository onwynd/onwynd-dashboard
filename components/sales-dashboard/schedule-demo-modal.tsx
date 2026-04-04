"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import client from "@/lib/api/client";
import { calendarService } from "@/lib/api/calendar";

interface SalesUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number;
  leadName: string;
  companyName: string;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

function addThirtyMins(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const totalMins = h * 60 + m + 30;
  return `${String(Math.floor(totalMins / 60)).padStart(2, "0")}:${String(totalMins % 60).padStart(2, "0")}`;
}

export function ScheduleDemoModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  companyName,
}: ScheduleDemoModalProps) {
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Load sales/admin users who can take demo calls
  useEffect(() => {
    if (!isOpen) return;
    client
      .get("/api/v1/admin/users", { params: { roles: "super_admin,admin,sales" } })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSalesUsers(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch(() => {
        // Fallback: at minimum pre-populate with current user if API fails
        setSalesUsers([]);
      });
  }, [isOpen]);

  async function handleSchedule() {
    if (!assigneeId || !date || !time) return;
    setLoading(true);

    const dateStr = format(date, "yyyy-MM-dd");
    const endTime = addThirtyMins(time);
    const assignee = salesUsers.find((u) => u.id === assigneeId);
    const assigneeName = assignee
      ? `${assignee.first_name} ${assignee.last_name}`
      : "Team";

    try {
      // 1. Assign lead via handoff endpoint
      await client.post(`/api/v1/sales/leads/${leadId}/handoff`, {
        assigned_to: assigneeId,
        handoff_note: note || `Demo call scheduled for ${companyName} on ${dateStr} at ${time}`,
      });

      // 2. Create calendar event for the assigned user
      await calendarService.addEvent({
        title: `Demo call — ${companyName}`,
        date: dateStr,
        startTime: time,
        endTime,
        participants: [assigneeName, leadName],
        meetingLink: "",
        timezone: "UTC",
      });

      onClose();
    } catch (err) {
      console.error("Failed to schedule demo", err);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!assigneeId && !!date && !!time;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Schedule Demo Call</DialogTitle>
          <DialogDescription>
            Assign this demo call to a sales team member and block the time in their calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Assign to */}
          <div className="grid gap-2">
            <Label>Assign to</Label>
            <Select value={assigneeId} onValueChange={(v) => v !== null && setAssigneeId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {salesUsers.length === 0 && (
                  <SelectItem value="_loading" disabled>
                    Loading…
                  </SelectItem>
                )}
                {salesUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      ({u.role.replace("_", " ")})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setCalendarOpen(false);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid gap-2">
            <Label>Time (UTC)</Label>
            <Select value={time} onValueChange={(v) => v !== null && setTime(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agenda, context, or anything the assignee should know…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!canSubmit || loading}>
            {loading ? "Scheduling…" : "Schedule & Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
