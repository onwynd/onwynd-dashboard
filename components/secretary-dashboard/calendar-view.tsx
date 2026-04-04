"use client";

import * as React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSecretaryStore } from "@/store/secretary-store";

export function CalendarView() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const calendarEvents = useSecretaryStore((state) => state.calendarEvents);
  const fetchCalendarEvents = useSecretaryStore((state) => state.fetchCalendarEvents);

  React.useEffect(() => {
    const start = startOfWeek(startOfMonth(currentDate)).toISOString();
    const end = endOfWeek(endOfMonth(currentDate)).toISOString();
    fetchCalendarEvents({ start_date: start, end_date: end });
  }, [currentDate, fetchCalendarEvents]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getAppointmentsForDay = (day: Date) => {
    return calendarEvents.filter(appt => isSameDay(new Date(appt.start), day));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={today}>Today</Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="grid grid-cols-7 border-b text-center text-sm font-semibold leading-10 text-muted-foreground">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 grid-rows-5 h-[600px] divide-x divide-y">
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`relative flex flex-col p-2 ${
                  !isSameMonth(day, monthStart) ? "bg-muted/50 text-muted-foreground" : ""
                }`}
              >
                <div className={`text-sm font-medium ${
                    isSameDay(day, new Date()) ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center" : ""
                }`}>
                  {format(day, "d")}
                </div>
                <ScrollArea className="flex-1 mt-2">
                  <div className="space-y-1">
                    {dayAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="rounded bg-primary/10 px-1 py-1 text-xs text-primary"
                        title={appt.title}
                      >
                        <div className="flex items-center gap-1 font-semibold">
                           <Clock className="h-3 w-3" />
                           {format(new Date(appt.start), "HH:mm")}
                        </div>
                        <div className="truncate">{appt.title}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
