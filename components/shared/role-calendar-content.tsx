"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isToday, isFuture, parseISO, startOfDay } from "date-fns";
import {
  CalendarDays, Plus, Bell, RefreshCw, CalendarIcon,
  Users, Video, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { calendarService, type Event } from "@/lib/api/calendar";
import { useCalendarStore } from "@/store/calendar-store";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarControls } from "@/components/calendar/calendar-controls";
import client from "@/lib/api/client";

export interface CalendarEventType {
  value: string;
  label: string;
  /** tailwind bg+text classes, e.g. "bg-red-100 text-red-700" */
  badge: string;
  /** left-border colour class, e.g. "border-l-red-500" */
  border: string;
}

export interface RoleCalendarContentProps {
  heading: string;
  subheading: string;
  /** API base for notifications, e.g. "/api/v1/admin" or "/api/v1/sales" */
  notifBasePath: string;
  eventTypes: CalendarEventType[];
  /** Optional pre-filled title suggestions shown in "New Event" */
  quickSuggestions?: string[];
}

const TIME_SLOTS = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00",
];

function addMins(t: string, mins: number) {
  const [h, m] = t.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface BellNotif {
  id: string | number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

function notifBorderColor(type: string) {
  const map: Record<string, string> = {
    demo:     "border-l-red-400",
    waitlist: "border-l-amber-400",
    contact:  "border-l-blue-400",
    security: "border-l-rose-500",
    signup:   "border-l-green-400",
  };
  return map[type] ?? "border-l-gray-300";
}

function notifBgColor(type: string) {
  const map: Record<string, string> = {
    demo:     "bg-red-50",
    waitlist: "bg-amber-50",
    contact:  "bg-blue-50",
    security: "bg-rose-50",
    signup:   "bg-green-50",
  };
  return map[type] ?? "bg-gray-50";
}

/** Determine event type colour from title keywords (fallback when no explicit type stored) */
function eventBorderFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("demo"))    return "border-l-red-500";
  if (t.includes("board") || t.includes("investor")) return "border-l-purple-500";
  if (t.includes("close") || t.includes("contract")) return "border-l-green-600";
  if (t.includes("prospect") || t.includes("outreach")) return "border-l-orange-500";
  if (t.includes("onboard") || t.includes("qbr"))    return "border-l-teal-500";
  if (t.includes("ops") || t.includes("sync"))       return "border-l-blue-500";
  return "border-l-gray-400";
}

export function RoleCalendarContent({
  heading,
  subheading,
  notifBasePath,
  eventTypes,
  quickSuggestions = [],
}: RoleCalendarContentProps) {
  const { fetchEvents, events } = useCalendarStore();
  const [notifs, setNotifs] = useState<BellNotif[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // New-event form
  const [open, setOpen] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState(eventTypes[0]?.value ?? "meeting");
  const [evDate, setEvDate] = useState<Date | undefined>();
  const [evTime, setEvTime] = useState("");
  const [evDuration, setEvDuration] = useState("30");
  const [evParticipants, setEvParticipants] = useState("");
  const [evLink, setEvLink] = useState("");
  const [evNotes, setEvNotes] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await client.get(`${notifBasePath}/notifications`, {
        params: { per_page: 8 },
      });
      const raw = res.data?.data ?? res.data ?? [];
      setNotifs(Array.isArray(raw) ? raw : raw.data ?? []);
    } catch { /* non-fatal */ }
    finally { setLoadingNotifs(false); }
  }, [notifBasePath]);

  useEffect(() => {
    fetchEvents();
    fetchNotifs();
  }, [fetchEvents, fetchNotifs]);

  // --- today's agenda
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEvents = events
    .filter((e) => e.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // --- upcoming (today + future, max 6)
  const upcoming = events
    .filter((e) => {
      try { return e.date === todayStr || isFuture(startOfDay(parseISO(e.date))); }
      catch { return false; }
    })
    .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime))
    .slice(0, 6);

  async function handleCreate() {
    if (!evTitle || !evDate || !evTime) return;
    setSaving(true);
    try {
      await calendarService.addEvent({
        title: evTitle,
        date: format(evDate, "yyyy-MM-dd"),
        startTime: evTime,
        endTime: addMins(evTime, Number(evDuration)),
        participants: evParticipants ? evParticipants.split(",").map((p) => p.trim()) : [],
        meetingLink: evLink || undefined,
        timezone: "UTC",
      });
      // reset
      setOpen(false);
      setEvTitle(""); setEvDate(undefined); setEvTime("");
      setEvParticipants(""); setEvLink(""); setEvNotes(""); setEvDuration("30");
      fetchEvents();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  function applyQuick(title: string) {
    setEvTitle(title);
    const matched = eventTypes.find((et) =>
      title.toLowerCase().includes(et.label.toLowerCase().split(" ")[0].toLowerCase())
    );
    if (matched) setEvType(matched.value);
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{subheading}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── Main calendar ── */}
        <div className="xl:col-span-3 space-y-3">
          <CalendarControls />
          <div className="rounded-xl border bg-background overflow-hidden shadow-sm">
            <CalendarView />
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-4">
          {/* Today's agenda */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Today — {format(new Date(), "EEE d MMM")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Nothing scheduled today
                </p>
              ) : todayEvents.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </CardContent>
          </Card>

          {/* Coming up */}
          {upcoming.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Coming up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <div className="w-14 shrink-0 text-muted-foreground mt-0.5">
                      {isToday(parseISO(ev.date)) ? ev.startTime : format(parseISO(ev.date), "MMM d")}
                    </div>
                    <p className="font-medium truncate flex-1">{ev.title}</p>
                    {ev.meetingLink && (
                      <a href={ev.meetingLink} target="_blank" rel="noreferrer" className="text-primary shrink-0">
                        <Video className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Bell feed */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Recent Alerts
            </h3>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={fetchNotifs} disabled={loadingNotifs}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loadingNotifs && "animate-spin")} />
            </Button>
          </div>

          <div className="space-y-2 pb-4">
            {notifs.length === 0 && !loadingNotifs && (
              <p className="text-xs text-muted-foreground text-center py-4">No recent alerts</p>
            )}
            {notifs.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-l-4 rounded-r px-3 py-2 text-xs space-y-0.5",
                  notifBgColor(n.type), notifBorderColor(n.type),
                  !n.is_read && "ring-1 ring-inset ring-primary/20"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold truncate">{n.title}</p>
                  {!n.is_read && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-primary/10 text-primary shrink-0">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2">{n.message}</p>
                {n.created_at && (
                  <p className="text-muted-foreground/60">
                    {(() => { try { return format(parseISO(n.created_at), "d MMM · HH:mm"); } catch { return ""; } })()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── New Event Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            {/* Quick suggestions */}
            {quickSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => applyQuick(s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                placeholder="What's this event about?"
                autoFocus
              />
            </div>

            {/* Type + Duration row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={evType} onValueChange={(v) => v !== null && setEvType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((et) => (
                      <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Duration</Label>
                <Select value={evDuration} onValueChange={(v) => v !== null && setEvDuration(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date + Time row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Date</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start font-normal text-sm", !evDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {evDate ? format(evDate, "d MMM yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single" selected={evDate}
                      onSelect={(d) => { setEvDate(d); setDateOpen(false); }}
                      disabled={(d) => d < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-1.5">
                <Label>Time (UTC)</Label>
                <Select value={evTime} onValueChange={(v) => v !== null && setEvTime(v)}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participants */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Participants <span className="text-muted-foreground font-normal">(comma-separated)</span>
              </Label>
              <Input
                value={evParticipants}
                onChange={(e) => setEvParticipants(e.target.value)}
                placeholder="Alice, Bob, client@company.com"
              />
            </div>

            {/* Meeting link */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" />
                Meeting link <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={evLink}
                onChange={(e) => setEvLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={evNotes}
                onChange={(e) => setEvNotes(e.target.value)}
                placeholder="Agenda, prep notes, context…"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!evTitle || !evDate || !evTime || saving}>
              {saving ? "Creating…" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small card for a single calendar event in the right panel */
function EventCard({ ev }: { ev: Event }) {
  return (
    <div className={cn("border-l-4 rounded-r px-3 py-2 text-xs bg-muted/40", eventBorderFromTitle(ev.title))}>
      <p className="font-semibold truncate">{ev.title}</p>
      <p className="text-muted-foreground">{ev.startTime} – {ev.endTime}</p>
      {ev.participants?.length > 0 && (
        <p className="text-muted-foreground truncate flex items-center gap-1 mt-0.5">
          <Users className="h-3 w-3 shrink-0" />
          {ev.participants.slice(0, 2).join(", ")}
          {ev.participants.length > 2 && ` +${ev.participants.length - 2}`}
        </p>
      )}
      {ev.meetingLink && (
        <a
          href={ev.meetingLink} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-primary hover:underline"
        >
          <Video className="h-3 w-3" /> Join call
        </a>
      )}
    </div>
  );
}
