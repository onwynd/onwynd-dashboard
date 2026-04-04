"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useSecretaryStore } from "@/store/secretary-store";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

export default function SecretaryCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const fetchCalendarEvents = useSecretaryStore((state) => state.fetchCalendarEvents);
  const events = useSecretaryStore((state) => state.calendarEvents);
  const isLoading = useSecretaryStore((state) => state.isLoading);

  useEffect(() => {
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      fetchCalendarEvents({ start_date: start.toISOString(), end_date: end.toISOString() });
    }
  }, [date, fetchCalendarEvents]);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Manage schedules and appointments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Events for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">No events scheduled for this day.</div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        {event.type === 'visitor' ? (
                          <Users className="w-5 h-5 text-primary" />
                        ) : (
                          <Clock className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
