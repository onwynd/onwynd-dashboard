"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

import { pmService } from "@/lib/api/pm";

export interface MaintenanceSchedule {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  notify_users: boolean;
  affected_services: string[] | null;
}

export function MaintenanceList() {
  const [data, setData] = React.useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<MaintenanceSchedule | null>(null);

  // Form states
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    notify_users: false,
    affected_services: ""
  });

  const fetchSchedules = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await pmService.getMaintenanceSchedules({ status: globalFilter });
      setData(Array.isArray(result) ? result : result.data?.data || result.data || []);
    } catch (error) {
      console.error("Failed to fetch maintenance schedules", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance schedules.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [globalFilter]);

  React.useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCreate = async () => {
    try {
      await pmService.createMaintenanceSchedule({
        ...formData,
        affected_services: formData.affected_services.split(',').map(s => s.trim())
      });
      setIsCreateOpen(false);
      resetForm();
      fetchSchedules();
      toast({ title: "Success", description: "Maintenance scheduled successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to schedule maintenance.", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedSchedule) return;
    try {
      await pmService.updateMaintenanceSchedule(selectedSchedule.id, {
        ...formData,
        affected_services: typeof formData.affected_services === 'string' 
            ? formData.affected_services.split(',').map(s => s.trim()) 
            : formData.affected_services
      });
      setIsEditOpen(false);
      setSelectedSchedule(null);
      resetForm();
      fetchSchedules();
      toast({ title: "Success", description: "Schedule updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to update schedule.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await pmService.cancelMaintenanceSchedule(selectedSchedule.id);
      setIsDeleteOpen(false);
      setSelectedSchedule(null);
      fetchSchedules();
      toast({ title: "Success", description: "Schedule cancelled successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to cancel schedule.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      notify_users: false,
      affected_services: ""
    });
  };

  const openEditDialog = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      notify_users: schedule.notify_users,
      affected_services: Array.isArray(schedule.affected_services) 
        ? schedule.affected_services.join(', ') 
        : ""
    });
    setIsEditOpen(true);
  };

  const columns: ColumnDef<MaintenanceSchedule>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium">{row.getValue("title")}</div>
        </div>
      ),
    },
    {
      accessorKey: "start_time",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Scheduled Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const start = new Date(row.getValue("start_time"));
        const end = new Date(row.original.end_time);
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{format(start, "MMM d, yyyy HH:mm")}</span>
            <span className="text-muted-foreground">to {format(end, "MMM d, yyyy HH:mm")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={
            status === "pending" ? "outline" :
            status === "completed" ? "secondary" :
            status === "cancelled" ? "destructive" : "default"
          }>
            {status}
          </Badge>
        );
      },
    },
    {
        accessorKey: "affected_services",
        header: "Services",
        cell: ({ row }) => {
            const services = row.original.affected_services;
            return (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(services) && services.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                </div>
            )
        }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const schedule = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(schedule)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedSchedule(schedule);
                  setIsDeleteOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
                <DialogDescription>Create a new system maintenance schedule.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="desc" className="text-right">Description</Label>
                  <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start" className="text-right">Start Time</Label>
                  <Input type="datetime-local" id="start" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end" className="text-right">End Time</Label>
                  <Input type="datetime-local" id="end" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="services" className="text-right">Services</Label>
                  <Input id="services" placeholder="Comma separated (e.g. API, Database)" value={formData.affected_services} onChange={(e) => setFormData({...formData, affected_services: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3 flex items-center space-x-2">
                        <Checkbox 
                            id="notify" 
                            checked={formData.notify_users} 
                            onCheckedChange={(c) => setFormData({...formData, notify_users: !!c})} 
                        />
                        <label htmlFor="notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Notify Users
                        </label>
                    </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Loading..." : "No maintenance schedules found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Title</Label>
              <Input id="edit-title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-desc" className="text-right">Description</Label>
              <Textarea id="edit-desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start" className="text-right">Start Time</Label>
              <Input type="datetime-local" id="edit-start" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end" className="text-right">End Time</Label>
              <Input type="datetime-local" id="edit-end" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-services" className="text-right">Services</Label>
              <Input id="edit-services" placeholder="Comma separated (e.g. API, Database)" value={formData.affected_services} onChange={(e) => setFormData({...formData, affected_services: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="edit-notify" 
                  checked={formData.notify_users} 
                  onCheckedChange={(c) => setFormData({...formData, notify_users: !!c})} 
                />
                <label htmlFor="edit-notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Notify Users
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Maintenance</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this maintenance schedule?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleDelete}>Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
