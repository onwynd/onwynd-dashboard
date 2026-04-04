"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStore } from "@/store/manager-store";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ScheduleCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const schedule = useManagerStore((state) => state.schedule);
  const fetchSchedule = useManagerStore((state) => state.fetchSchedule);

  React.useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const selectedDateEvents = React.useMemo(() => {
    if (!date) return [];
    return schedule.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
    });
  }, [schedule, date]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
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
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Events for {date ? format(date, "PPP") : "Selected Date"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground">No events for this day.</p>
            ) : (
                selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(event.start), "p")} - {format(new Date(event.end), "p")}
                            </p>
                        </div>
                        <Badge>{event.type}</Badge>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
