"use client";

import { useEffect, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Clock, Loader2, CalendarCheck2, Info } from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: string | number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string | null;
  is_available: boolean;
}

const DAYS = [
  { label: "Sunday",    short: "Sun", value: 0 },
  { label: "Monday",    short: "Mon", value: 1 },
  { label: "Tuesday",   short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday",  short: "Thu", value: 4 },
  { label: "Friday",    short: "Fri", value: 5 },
  { label: "Saturday",  short: "Sat", value: 6 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return { label: i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`, value: `${h}:00` };
});

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // New slot form state
  const [formDay, setFormDay] = useState<string>("1");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("17:00");
  const [formRecurring, setFormRecurring] = useState(true);
  const [formSpecificDate, setFormSpecificDate] = useState("");

  useEffect(() => {
    therapistService.getAvailability()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSlots(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const startH = parseInt(formStart.split(":")[0]);
    const endH = parseInt(formEnd.split(":")[0]);
    const startM = parseInt(formStart.split(":")[1] || "0");
    const endM = parseInt(formEnd.split(":")[1] || "0");
    if (startH * 60 + startM >= endH * 60 + endM) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        day_of_week: parseInt(formDay),
        start_time: formStart,
        end_time: formEnd,
        is_recurring: formRecurring,
      };
      if (!formRecurring && formSpecificDate) {
        payload.specific_date = formSpecificDate;
      }
      const created = await therapistService.createAvailability(payload);
      setSlots((prev) => [...prev, (created as any)?.data ?? created as unknown as AvailabilitySlot]);
      setDialogOpen(false);
      toast.success("Availability slot added");
    } catch {
      toast.error("Failed to add slot");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (slot: AvailabilitySlot) => {
    const updated = { ...slot, is_available: !slot.is_available };
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? updated : s)));
    try {
      await therapistService.updateAvailability(slot.id, { is_available: !slot.is_available });
    } catch {
      // revert on failure
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? slot : s)));
      toast.error("Failed to update slot");
    }
  };

  const handleDelete = async (id: string | number) => {
    setDeletingId(id);
    try {
      await therapistService.deleteAvailability(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast.success("Slot removed");
    } catch {
      toast.error("Failed to delete slot");
    } finally {
      setDeletingId(null);
    }
  };

  const slotsByDay = DAYS.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.day_of_week === day.value),
  }));

  const totalSlots = slots.filter((s) => s.is_available).length;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set the times you&apos;re available for patient bookings. Patients can only book sessions during your available slots.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Add Slot
        </Button>
      </div>

      {/* Summary banner */}
      {!loading && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          <CalendarCheck2 className="size-5 text-primary shrink-0" />
          <p className="text-sm">
            You have <span className="font-semibold text-foreground">{totalSlots}</span> active availability slot{totalSlots !== 1 ? "s" : ""} across the week.
            {totalSlots === 0 && (
              <span className="text-muted-foreground"> Add at least one slot so patients can book sessions with you.</span>
            )}
          </p>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
        <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Recurring slots</strong> repeat every week on the selected day. <strong>One-time slots</strong> apply only on a specific date. Patients see your available times when booking a session.
        </p>
      </div>

      {/* Weekly grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slotsByDay.map((day) => (
            <div key={day.value} className="rounded-xl border bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <p className="font-semibold text-sm">{day.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    setFormDay(String(day.value));
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="p-3 space-y-2 min-h-[80px]">
                {day.slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center pt-4 pb-2">No slots</p>
                ) : (
                  day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 bg-background"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium">
                            {slot.start_time} – {slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant={slot.is_recurring ? "default" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {slot.is_recurring ? "Recurring" : "One-time"}
                          </Badge>
                          {slot.specific_date && (
                            <span className="text-[10px] text-muted-foreground">{slot.specific_date}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Switch
                          checked={slot.is_available}
                          onCheckedChange={() => handleToggleAvailable(slot)}
                          className="scale-75"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Day of Week</Label>
              <Select value={formDay} onValueChange={(v: string | null) => v && setFormDay(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Select value={formStart} onValueChange={(v: string | null) => v && setFormStart(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {HOURS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Select value={formEnd} onValueChange={(v: string | null) => v && setFormEnd(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {HOURS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
              <Switch
                id="recurring"
                checked={formRecurring}
                onCheckedChange={setFormRecurring}
              />
              <div>
                <Label htmlFor="recurring" className="cursor-pointer">Recurring</Label>
                <p className="text-xs text-muted-foreground">
                  Repeat every week on this day
                </p>
              </div>
            </div>

            {!formRecurring && (
              <div className="space-y-1.5">
                <Label>Specific Date</Label>
                <Input
                  type="date"
                  value={formSpecificDate}
                  onChange={(e) => setFormSpecificDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
