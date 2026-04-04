"use client";

import { AppointmentsTable } from "@/components/secretary-dashboard/appointments-table";

export default function SecretaryAppointmentsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Manage appointments and schedules.</p>
      </div>

      <AppointmentsTable />
    </div>
  );
}
