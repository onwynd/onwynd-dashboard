"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  listEvents,
  createEvent,
  deleteEvent,
  sendBroadcast,
  previewBroadcast,
  type MarketingEvent,
  type AudienceType,
} from "@/lib/api/marketing";

export default function CeoEmailsPage() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [audience, setAudience] = useState<AudienceType[]>([]);
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const [newEvent, setNewEvent] = useState({
    name: "",
    event_date: "",
    description: "",
  });

  async function loadEvents() {
    const res = await listEvents();
    setEvents(res.data);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function toggleAudience(a: AudienceType) {
    setAudience((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
    setPreviewCount(null);
  }

  async function handleSend() {
    if (!subject.trim() || !html.trim() || audience.length === 0) {
      toast({ description: "Subject, content and at least one audience are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await sendBroadcast({ subject, html, audience });
      toast({ description: `Sent to ${res.data.sent} recipients.` });
      setSubject("");
      setHtml("");
      setAudience([]);
      setPreviewCount(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast({ description: err?.response?.data?.message || err?.message || "Failed to send.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview() {
    if (audience.length === 0) {
      toast({ description: "Select at least one audience to preview recipients.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await previewBroadcast({ audience });
      setPreviewCount(res.data.count);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast({ description: err?.response?.data?.message || err?.message || "Failed to preview.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent() {
    if (!newEvent.name || !newEvent.event_date) {
      toast({ description: "Name and date are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createEvent({
        name: newEvent.name,
        event_date: newEvent.event_date,
        description: newEvent.description || undefined,
        audience,
        template_html: html || undefined,
      });
      setNewEvent({ name: "", event_date: "", description: "" });
      toast({ description: "Event created." });
      loadEvents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast({ description: err?.response?.data?.message || err?.message || "Failed to create event.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      toast({ description: "Event deleted." });
      loadEvents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast({ description: err?.response?.data?.message || err?.message || "Failed to delete event.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">CEO Broadcasts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compose</h2>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audience.includes("staff")}
                onChange={() => toggleAudience("staff")}
              />
              Staff
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audience.includes("therapists")}
                onChange={() => toggleAudience("therapists")}
              />
              Therapists
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audience.includes("customers")}
                onChange={() => toggleAudience("customers")}
              />
              Customers
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audience.includes("investors")}
                onChange={() => toggleAudience("investors")}
              />
              Investors
            </label>
          </div>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="HTML content"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="min-h-[220px]"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handlePreview} variant="secondary" disabled={loading}>
              Preview Recipients
            </Button>
            <Button onClick={handleSend} disabled={loading}>
              Send Now
            </Button>
            {previewCount !== null && (
              <span className="text-sm text-muted-foreground">
                Recipients: {previewCount}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Event Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Event name"
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Input
              type="date"
              value={newEvent.event_date}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, event_date: e.target.value }))
              }
            />
            <Button onClick={handleCreateEvent} disabled={loading}>
              Add Event
            </Button>
          </div>
          <Textarea
            placeholder="Optional description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent((p) => ({ ...p, description: e.target.value }))
            }
          />
          <div className="rounded-xl border divide-y">
            {events.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No events yet
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold">{ev.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(ev.event_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSubject(ev.name);
                        if (ev.template_html) setHtml(ev.template_html);
                        if (Array.isArray(ev.audience) && ev.audience.length) {
                          setAudience(ev.audience);
                        }
                      }}
                      disabled={loading}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEvent(ev.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
