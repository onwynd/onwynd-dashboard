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
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { usePartnerStore } from "@/store/partner-store";
import { cn } from "@/lib/utils";

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
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export function EmployeesTable() {
  const employees = usePartnerStore((state) => state.employees);
  const fetchEmployees = usePartnerStore((state) => state.fetchEmployees);
  const searchQuery = usePartnerStore((state) => state.searchQuery);
  const departmentFilter = usePartnerStore((state) => state.departmentFilter);
  const statusFilter = usePartnerStore((state) => state.statusFilter);
  const setSearchQuery = usePartnerStore((state) => state.setSearchQuery);
  const setDepartmentFilter = usePartnerStore(
    (state) => state.setDepartmentFilter
  );
  const setStatusFilter = usePartnerStore((state) => state.setStatusFilter);
  const clearFilters = usePartnerStore((state) => state.clearFilters);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  );

  const hasActiveFilters = departmentFilter !== "all" || statusFilter !== "all";

  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name} ${emp.last_name}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.uuid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || emp.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);


  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginatedEmployees = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, pageSize]);

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedEmployees.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedEmployees.map((e) => e.id.toString())));
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
            Employee list
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
              {["all", "IT", "HR", "Finance", "Marketing", "Sales"].map(
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
              {["all", "Active", "On Leave", "Probation", "Inactive"].map(
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

          <Button variant="outline" className="gap-2">
            <Upload className="size-4" />
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
                    selectedRows.size === paginatedEmployees.length &&
                    paginatedEmployees.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                User ID
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
                Job Title
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
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(employee.id.toString())}
                      onCheckedChange={() => toggleSelectRow(employee.id.toString())}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {employee.uuid}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-6">
                        {employee.profile_photo ? (
                          <AvatarImage src={employee.profile_photo} />
                        ) : null}
                        <AvatarFallback className="text-[10px] font-semibold">
                          {employee.first_name[0]}
                          {employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {employee.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {employee.department || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {employee.job_title || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(employee.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
                        statusColors[employee.is_active ? "active" : "inactive"].bg,
                        statusColors[employee.is_active ? "active" : "inactive"].text,
                        statusColors[employee.is_active ? "active" : "inactive"].border
                      )}
                    >
                      {employee.is_active ? "Active" : "Inactive"}
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
            {Math.min(currentPage * pageSize, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} entries
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
                  className={cn(pageSize === size && "bg-muted")}
                >
                  Show {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
