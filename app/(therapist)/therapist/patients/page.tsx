"use client";

import { PatientsTable } from "@/components/therapist-dashboard/patients-table";

export default function PatientsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <p className="text-muted-foreground">Manage your patients and view their records.</p>
      </div>
      <PatientsTable />
    </div>
  );
}
