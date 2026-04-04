"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";
import { useTherapistStore } from "@/store/therapist-store";

export function AlertBanner() {
  const stats = useTherapistStore((state) => state.stats);

  const upcomingStat = stats.find((s) => s.title === "Upcoming Sessions");
  const patientsStat = stats.find((s) => s.title === "Total Patients");

  const upcomingCount = upcomingStat?.value ?? "—";
  const patientsCount = patientsStat?.value ?? "—";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">{upcomingCount}</span>{" "}
            upcoming session{upcomingCount === "1" ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">{patientsCount}</span>{" "}
            total patient{patientsCount === "1" ? "" : "s"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link href="/therapist/sessions">View Sessions</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/therapist/patients">Manage Patients</Link>
        </Button>
      </div>
    </div>
  );
}
