"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { useEffect, useState } from "react";
import { marketingService, MarketingEvent } from "@/lib/api/marketing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { Plus, Loader2, CalendarDays, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function MarketingCalendarPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await marketingService.listEvents();
      setEvents(res.data ?? []);
    } catch {
      toast({ description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setEventDate("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (ev: MarketingEvent) => {
    setEditing(ev);
    setName(ev.name);
    setEventDate(ev.event_date?.slice(0, 10) ?? "");
    setDescription(ev.description ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !eventDate) return;
    setSubmitting(true);
    try {
      const payload = { name, event_date: eventDate, description: description || undefined };
      if (editing) {
        await marketingService.updateEvent(editing.id, payload);
        toast({ description: "Event updated" });
      } else {
        await marketingService.createEvent(payload);
        toast({ description: "Event created" });
      }
      setDialogOpen(false);
      fetchEvents();
    } catch {
      toast({ description: "Failed to save event", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await marketingService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ description: "Event deleted" });
    } catch {
      toast({ description: "Failed to delete event", variant: "destructive" });
    }
  };

  const handleToggleActive = async (ev: MarketingEvent) => {
    try {
      await marketingService.updateEvent(ev.id, { active: !ev.active });
      setEvents((prev) => prev.map((e) => e.id === ev.id ? { ...e, active: !e.active } : e));
    } catch {
      toast({ description: "Failed to update event", variant: "destructive" });
    }
  };

  const upcoming = events.filter((e) => {
    try { return parseISO(e.event_date) >= new Date(); } catch { return false; }
  }).sort((a, b) => a.event_date.localeCompare(b.event_date));

  const past = events.filter((e) => {
    try { return parseISO(e.event_date) < new Date(); } catch { return false; }
  });

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketing Calendar</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage campaigns, events, and scheduled broadcasts.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid gap-2">
                    <Label>Event Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 Product Launch..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={submitting || !name.trim() || !eventDate}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>{upcoming.length} scheduled events</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                  {upcoming.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 opacity-20" />
                      <p className="text-sm">No upcoming events. Create one to get started.</p>
                    </div>
                  ) : (
                    upcoming.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{ev.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(() => { try { return format(parseISO(ev.event_date), "EEEE, MMMM d, yyyy"); } catch { return ev.event_date; } })()}
                          </p>
                          {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch checked={ev.active} onCheckedChange={() => handleToggleActive(ev)} />
                          <Badge variant={ev.active ? "default" : "secondary"}>{ev.active ? "Active" : "Inactive"}</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ev.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {past.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Past Events</CardTitle>
                    <CardDescription>{past.length} completed events</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y">
                    {past.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between py-3 gap-4 opacity-60">
                        <div>
                          <p className="font-medium text-sm">{ev.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(() => { try { return format(parseISO(ev.event_date), "MMMM d, yyyy"); } catch { return ev.event_date; } })()}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ev.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
