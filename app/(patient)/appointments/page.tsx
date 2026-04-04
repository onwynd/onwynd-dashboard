"use client";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarControls } from "@/components/calendar/calendar-controls";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function AppointmentsPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden w-full bg-background">
      <div className="w-full">
        <CalendarHeader />
        <CalendarControls />
      </div>
      <div className="flex-1 overflow-hidden w-full">
        <CalendarView />
      </div>
    </div>
  );
}
