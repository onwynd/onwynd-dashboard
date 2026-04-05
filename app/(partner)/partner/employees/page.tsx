import type { Metadata } from "next";
import { EmployeesTable } from "@/components/partner-dashboard/employees-table";

export const metadata: Metadata = { title: "Employees" };

export default function PartnerEmployeesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground text-sm mt-1">Your team members and their performance.</p>
      </div>
      <EmployeesTable />
    </div>
  );
}
