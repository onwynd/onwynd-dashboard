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
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHRStore, type Employee } from "@/store/hr-store";
import { hrService } from "@/lib/api/hr";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

export function EmployeesTable() {
  const employees = useHRStore((state) => state.employees);
  const fetchEmployees = useHRStore((state) => state.fetchEmployees);
  const searchQuery = useHRStore((state) => state.searchQuery);
  const departmentFilter = useHRStore((state) => state.departmentFilter);
  const statusFilter = useHRStore((state) => state.statusFilter);
  const setSearchQuery = useHRStore((state) => state.setSearchQuery);
  const setDepartmentFilter = useHRStore((state) => state.setDepartmentFilter);
  const setStatusFilter = useHRStore((state) => state.setStatusFilter);
  const clearFilters = useHRStore((state) => state.clearFilters);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(8);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [empForm, setEmpForm] = React.useState({ first_name: "", last_name: "", email: "", department: "", job_title: "", is_active: true });

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

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedEmployees.map((e) => e.id.toString())));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const openCreate = () => {
    setEditingEmployee(null);
    setEmpForm({ first_name: "", last_name: "", email: "", department: "", job_title: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({ first_name: emp.first_name, last_name: emp.last_name, email: emp.email, department: emp.department ?? "", job_title: emp.job_title ?? "", is_active: emp.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!empForm.first_name || !empForm.email) {
      toast({ description: "First name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingEmployee) {
        await hrService.updateEmployee(editingEmployee.id, empForm);
        toast({ description: "Employee updated" });
      } else {
        await hrService.createEmployee(empForm);
        toast({ description: "Employee created" });
      }
      setDialogOpen(false);
      fetchEmployees();
    } catch {
      toast({ description: "Failed to save employee", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Name,Email,Role,Department,Status,Joined\n"
      + filteredEmployees.map(e => `"${e.first_name} ${e.last_name}","${e.email}","${e.role_id}","${e.department ?? ""}","${getStatus(e)}","${e.last_seen_at ?? ""}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary w-2 h-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={departmentFilter === "all"}
                onCheckedChange={() => setDepartmentFilter("all")}
              >
                All Departments
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={departmentFilter === "Clinical"}
                onCheckedChange={() => setDepartmentFilter("Clinical")}
              >
                Clinical
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={departmentFilter === "Human Resources"}
                onCheckedChange={() => setDepartmentFilter("Human Resources")}
              >
                Human Resources
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={departmentFilter === "Technology"}
                onCheckedChange={() => setDepartmentFilter("Technology")}
              >
                Technology
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => setStatusFilter("all")}
              >
                All Statuses
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "Active"}
                onCheckedChange={() => setStatusFilter("Active")}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "Inactive"}
                onCheckedChange={() => setStatusFilter("Inactive")}
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <FileInput className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreate}>
            <Users className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    paginatedEmployees.length > 0 &&
                    paginatedEmployees.every((e) => selectedRows.has(e.id.toString()))
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(employee.id.toString())}
                      onCheckedChange={(checked) =>
                        handleSelectRow(employee.id.toString(), !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={employee.profile_photo || undefined}
                          alt={`${employee.first_name} ${employee.last_name}`}
                        />
                        <AvatarFallback>
                          {employee.first_name[0]}
                          {employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.department || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        statusColors[getStatus(employee)].bg,
                        statusColors[getStatus(employee)].text,
                        statusColors[getStatus(employee)].border
                      )}
                    >
                      {getStatus(employee)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.last_seen_at ? (
                      <span className="text-sm text-muted-foreground" title={new Date(employee.last_seen_at).toLocaleString()}>
                        {(() => {
                          const diff = Date.now() - new Date(employee.last_seen_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return <span className="text-green-600 font-medium">Online</span>;
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          return `${Math.floor(hrs / 24)}d ago`;
                        })()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(employee)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + pageSize, filteredEmployees.length)} of{" "}
          {filteredEmployees.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add / Edit Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>First Name *</Label>
                <Input value={empForm.first_name} onChange={e => setEmpForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Last Name</Label>
                <Input value={empForm.last_name} onChange={e => setEmpForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Email *</Label>
              <Input type="email" value={empForm.email} onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Department</Label>
                <Input value={empForm.department} onChange={e => setEmpForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering" />
              </div>
              <div className="grid gap-1.5">
                <Label>Job Title</Label>
                <Input value={empForm.job_title} onChange={e => setEmpForm(f => ({ ...f, job_title: e.target.value }))} placeholder="e.g. Senior Engineer" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={empForm.is_active} onCheckedChange={v => setEmpForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !empForm.first_name || !empForm.email}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editingEmployee ? "Update" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
