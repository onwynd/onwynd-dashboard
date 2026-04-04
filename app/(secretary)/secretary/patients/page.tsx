"use client";

import { PatientsTable } from "@/components/secretary-dashboard/patients-table";

export default function SecretaryPatientsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">Manage registered patients and profiles.</p>
      </div>

      <PatientsTable />
    </div>
  );
}
