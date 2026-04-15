"use client";

import { useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Filter,
  FileInput,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useClinicalStore } from "@/store/clinical-store";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

const statusColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  inactive: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  monitoring: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export function PatientsTable() {
  const patients = useClinicalStore((state) => state.patients);
  const fetchPatients = useClinicalStore((state) => state.fetchPatients);
  const searchQuery = useClinicalStore((state) => state.searchQuery);
  const departmentFilter = useClinicalStore((state) => state.departmentFilter);
  const statusFilter = useClinicalStore((state) => state.statusFilter);
  const setSearchQuery = useClinicalStore((state) => state.setSearchQuery);
  const setDepartmentFilter = useClinicalStore(
    (state) => state.setDepartmentFilter
  );
  const setStatusFilter = useClinicalStore((state) => state.setStatusFilter);
  const clearFilters = useClinicalStore((state) => state.clearFilters);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  );

  const hasActiveFilters = departmentFilter !== "all" || statusFilter !== "all";

  const filteredPatients = React.useMemo(() => {
    return (patients || []).filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.uuid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || patient.department === departmentFilter;

      const status = patient.status || "active";
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [patients, searchQuery, departmentFilter, statusFilter]);


  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  const paginatedPatients = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPatients.slice(startIndex, startIndex + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, pageSize]);

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedPatients.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedPatients.map((e) => String(e.id))));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRows(newSet);
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Patient list
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-sm font-medium",
                "border-border hover:bg-background bg-muted shadow-xs",
              )}
            >
              <Filter className="size-4" />
              Filter
              {hasActiveFilters && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                Department
              </DropdownMenuLabel>
              {["all", "General", "Mental Health", "Physical Therapy", "Nutrition", "Cardiology"].map(
                (dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={departmentFilter === dept}
                    onCheckedChange={() => setDepartmentFilter(dept)}
                  >
                    {dept === "all" ? "All Departments" : dept}
                  </DropdownMenuCheckboxItem>
                )
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                Status
              </DropdownMenuLabel>
              {["all", "Active", "Discharged", "Monitoring", "Critical"].map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All Statuses" : status}
                  </DropdownMenuCheckboxItem>
                )
              )}
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="text-destructive"
                  >
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block w-px h-6 bg-border" />

          <Button variant="outline" className="gap-2 min-h-[44px] min-w-[44px]">
            <FileInput className="size-4" />
            Import
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedRows.size === paginatedPatients.length &&
                    paginatedPatients.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Patient ID
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px] text-muted-foreground font-medium">
                Email Address
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px] text-muted-foreground font-medium">
                Department
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[140px] text-muted-foreground font-medium">
                Treatment
              </TableHead>
              <TableHead className="hidden sm:table-cell min-w-[120px] text-muted-foreground font-medium">
                Joined Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No patients found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(patient.id.toString())}
                      onCheckedChange={() => toggleSelectRow(patient.id.toString())}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {patient.uuid}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-6">
                        {patient.profile_photo ? (
                          <AvatarImage src={patient.profile_photo} />
                        ) : null}
                        <AvatarFallback className="text-[10px] font-semibold">
                          {patient.first_name[0]}
                          {patient.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {patient.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {patient.department || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      Treatment
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
                        statusColors[patient.status || (patient.is_active ? "active" : "inactive")]?.bg || statusColors.active.bg,
                        statusColors[patient.status || (patient.is_active ? "active" : "inactive")]?.text || statusColors.active.text,
                        statusColors[patient.status || (patient.is_active ? "active" : "inactive")]?.border || statusColors.active.border
                      )}
                    >
                      {patient.status || (patient.is_active ? "Active" : "Inactive")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (i === 3 && totalPages > 5 && currentPage < totalPages - 2) {
                return (
                  <span key="ellipsis" className="px-3 py-1 text-sm">
                    ...
                  </span>
                );
              }

              if (i === 4 && totalPages > 5) {
                pageNum = totalPages;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(currentPage === pageNum && "bg-muted")}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
            {filteredPatients.length} entries
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted shadow-xs text-sm font-medium">
              Show {pageSize}
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => setPageSize(size)}
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
