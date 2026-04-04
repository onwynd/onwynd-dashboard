"use client";

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
} from "lucide-react";
import { useManagerStore, type Employee } from "@/store/manager-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmployeeForm } from "./employee-form";
import { MoreHorizontal, Pencil, Trash, ArrowUpRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managerService } from "@/lib/api/manager";
import { adminService } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";

const getStatus = (employee: Employee): "Active" | "Inactive" => {
  return employee.is_active ? "Active" : "Inactive";
};

const statusColors: Record<
  "Active" | "Inactive",
  { bg: string; text: string; border: string }
> = {
  Active: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Inactive: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EmployeesTable() {
  const employees = useManagerStore((state) => state.employees);
  const fetchEmployees = useManagerStore((state) => state.fetchEmployees);
  const searchQuery = useManagerStore((state) => state.searchQuery);
  const departmentFilter = useManagerStore((state) => state.departmentFilter);
  const statusFilter = useManagerStore((state) => state.statusFilter);
  const setSearchQuery = useManagerStore((state) => state.setSearchQuery);
  const setDepartmentFilter = useManagerStore(
    (state) => state.setDepartmentFilter
  );
  const setStatusFilter = useManagerStore((state) => state.setStatusFilter);
  const clearFilters = useManagerStore((state) => state.clearFilters);
  const addEmployee = useManagerStore((state) => state.addEmployee);
  const updateEmployee = useManagerStore((state) => state.updateEmployee);
  const deleteEmployee = useManagerStore((state) => state.deleteEmployee);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(8);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(
    new Set()
  );
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  const [upgradeEmployee, setUpgradeEmployee] = React.useState<Employee | null>(null);
  const [plans, setPlans] = React.useState<Array<{ uuid: string; name: string; slug: string; billing_interval?: string | null }>>([]);
  const [selectedPlan, setSelectedPlan] = React.useState<string>("");
  const [includeRevenue, setIncludeRevenue] = React.useState(false);
  const [comped, setComped] = React.useState<boolean>(true);
  const [reason, setReason] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  type EmployeeFormData = {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    job_title?: string;
    status: "active" | "inactive";
    password?: string;
  };

  const handleAddEmployee = async (data: EmployeeFormData) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      department: data.department,
      job_title: data.job_title,
      is_active: data.status === "active",
    } as Partial<Employee>;
    await addEmployee(payload);
  };

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    if (editingEmployee) {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        department: data.department,
        job_title: data.job_title,
        is_active: data.status === "active",
      } as Partial<Employee>;
      await updateEmployee(editingEmployee.id, payload);
      setEditingEmployee(null);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  const openRequestUpgrade = async (emp: Employee) => {
    setUpgradeEmployee(emp);
    setSelectedPlan("");
    setIncludeRevenue(false);
    setComped(true);
    setReason("");
    if (plans.length === 0) {
      try {
        const res = await adminService.getAllPlans();
        const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
        setPlans(list);
      } catch {
        setPlans([]);
      }
    }
  };

  const submitRequestUpgrade = async () => {
    if (!upgradeEmployee || !selectedPlan) return;
    setSaving(true);
    try {
      await managerService.requestSubscriptionUpgrade({
        user_id: upgradeEmployee.id,
        plan_uuid: selectedPlan,
        billing_interval: (plans.find(p => p.uuid === selectedPlan)?.billing_interval as any) ?? "monthly",
        include_in_revenue: includeRevenue,
        comped,
        reason: reason || undefined,
      });
      toast({ description: "Upgrade request submitted for approval." });
      setUpgradeEmployee(null);
    } catch {
      toast({ description: "Failed to submit request.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

      const status = getStatus(emp);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

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
      setSelectedRows(new Set(paginatedEmployees.map((e) => e.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
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
              {["all", "Active", "Inactive"].map(
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
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => {
                 const status = getStatus(employee);
                 return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(employee.id)}
                        onCheckedChange={() => toggleSelectRow(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {employee.uuid.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-6">
                          {employee.profile_photo ? (
                            <AvatarImage src={employee.profile_photo} />
                          ) : null}
                          <AvatarFallback className="text-[10px] font-semibold">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {employee.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {employee.department || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {employee.job_title || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-6 px-2.5 font-medium border",
                          statusColors[status].bg,
                          statusColors[status].text,
                          statusColors[status].border
                        )}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingEmployee(employee)}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRequestUpgrade(employee)}>
                            <ArrowUpRight className="mr-2 size-4" />
                            Request Upgrade
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls can be added here if needed */}
      <div className="flex items-center justify-between px-5 py-4 border-t">
        <div className="text-xs text-muted-foreground">
          Showing <strong>{paginatedEmployees.length}</strong> of{" "}
          <strong>{filteredEmployees.length}</strong> employees
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            onSubmit={async (data) => {
              await handleAddEmployee(data as EmployeeFormData);
              setIsAddOpen(false);
            }}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              initialData={editingEmployee}
              onSubmit={async (data) => {
                await handleUpdateEmployee(data as EmployeeFormData);
              }}
              onCancel={() => setEditingEmployee(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!upgradeEmployee} onOpenChange={(open) => !open && setUpgradeEmployee(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Request Subscription Upgrade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={selectedPlan} onValueChange={(v: string | null) => setSelectedPlan(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.uuid} value={p.uuid}>
                      {p.name} {p.billing_interval ? `· ${p.billing_interval}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Include in revenue reports</p>
                <p className="text-xs text-muted-foreground">Count this upgrade toward revenue.</p>
              </div>
              <input
                type="checkbox"
                checked={includeRevenue}
                onChange={(e) => setIncludeRevenue(e.target.checked)}
                className="w-4 h-4"
                aria-label="Include in revenue"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Comped (no immediate billing)</p>
                <p className="text-xs text-muted-foreground">Mark as comped; admin will approve.</p>
              </div>
              <input
                type="checkbox"
                checked={comped}
                onChange={(e) => setComped(e.target.checked)}
                className="w-4 h-4"
                aria-label="Comped"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                placeholder="Why is this upgrade needed?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setUpgradeEmployee(null)}>Cancel</Button>
              <Button onClick={submitRequestUpgrade} disabled={!selectedPlan || saving}>
                {saving ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
