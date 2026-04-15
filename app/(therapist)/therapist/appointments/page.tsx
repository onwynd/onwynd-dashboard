"use client";

import { useEffect } from "react";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarControls } from "@/components/calendar/calendar-controls";
import { CalendarView } from "@/components/calendar/calendar-view";
import { useCalendarStore } from "@/store/calendar-store";
import { therapistService } from "@/lib/api/therapist";
import type { Event } from "@/lib/api/calendar";

/** Convert HH:MM + duration (minutes) to HH:MM end time */
function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export default function TherapistAppointmentsPage() {
  const setSessionEvents = useCalendarStore((state) => state.setSessionEvents);

  useEffect(() => {
    therapistService.getSessions({ per_page: 100 })
      .then((data) => {
        const raw = data as any;
        const list: unknown[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
        const mapped: Event[] = list.map((s: unknown) => {
          const session = s as any;
          const scheduledAt = session.scheduled_at ? new Date(session.scheduled_at) : null;
          const patient = session.patient ?? {};
          const patientName = (session.patient_name
            ?? [patient.first_name, patient.last_name].filter(Boolean).join(" "))
            || "Patient";
          const startTime = session.time
            ?? (scheduledAt ? scheduledAt.toTimeString().substring(0, 5) : "09:00");
          const duration = session.duration ?? session.duration_minutes ?? 60;
          const date = session.date
            ?? (scheduledAt ? scheduledAt.toISOString().split("T")[0] : "");
          const endTime = addMinutes(startTime, duration);
          const canJoin = session.status === "scheduled" || session.status === "in_progress";
          const statusLabel = session.status === "pending_confirmation"
            ? "Awaiting acceptance"
            : session.status === "scheduled"
              ? "Scheduled"
              : session.status === "in_progress"
                ? "In progress"
                : "Session";
          return {
            id: String(session.id),
            title: `Session with ${patientName} · ${statusLabel}`,
            date,
            startTime,
            endTime,
            participants: [patientName],
            meetingLink: canJoin ? `/therapist/sessions/${session.id}/room` : undefined,
            status: session.status,
            sessionUuid: session.uuid,
          };
        }).filter((e) => Boolean(e.date));
        setSessionEvents(mapped);
      })
      .catch(() => {});
  }, [setSessionEvents]);

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
