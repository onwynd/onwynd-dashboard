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
  Download,
  Filter,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { marketingService } from "@/lib/api/marketing";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Lead = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  status: "new" | "contacted" | "qualified" | "lost";
  source: string | null;
  assigned_to: number | null;
  assignedUser?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
  contacted: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
  qualified: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
  lost: "text-gray-500 bg-gray-50 dark:bg-gray-950/20",
};

const defaultFormData: Partial<Lead> = {
  first_name: "",
  last_name: "",
  email: "",
  company: "",
  status: "new",
  source: "",
  assigned_to: null,
};

export function LeadsTable() {
  const [data, setData] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { toast } = useToast();

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<Partial<Lead>>(defaultFormData);

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await marketingService.getLeads();
      const leads = response.data || [];
      setData(leads);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setFormData({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      company: lead.company || "",
      status: lead.status,
      source: lead.source || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await marketingService.updateLead(editingId, formData);
        toast({ title: "Success", description: "Lead updated successfully." });
      } else {
        await marketingService.createLead(formData);
        toast({ title: "Success", description: "Lead created successfully." });
      }
      setIsDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error("Failed to save lead:", error);
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await marketingService.deleteLead(deleteId);
      toast({ title: "Success", description: "Lead deleted successfully." });
      setIsDeleteDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead:", error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,First Name,Last Name,Email,Company,Status,Source\n"
      + table.getFilteredRowModel().rows.map(row => 
        `"${row.original.id}","${row.original.first_name}","${row.original.last_name}","${row.original.email}","${row.original.company || ''}","${row.original.status}","${row.original.source || ''}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.first_name} {row.original.last_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => <div>{row.getValue("company") || "-"}</div>,
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => <div>{row.getValue("source") || "-"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusColors[status] || "text-gray-500 bg-gray-50"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedUser",
      header: "Assigned To",
      cell: ({ row }) => {
        const user = row.original.assignedUser;
        return <div>{user ? `${user.first_name} ${user.last_name}` : "-"}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const lead = row.original;

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.id.toString())}
              >
                Copy Lead ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenEdit(lead)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenDelete(lead.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Lead
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
            <Input
            placeholder="Filter leads..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Status
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue(undefined)}>
                        All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("new")}>
                        New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("contacted")}>
                        Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("qualified")}>
                        Qualified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("lost")}>
                        Lost
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
            <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Lead
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingId ? "Edit Lead" : "Create New Lead"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="first_name" className="text-right">First Name</Label>
                    <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="last_name" className="text-right">Last Name</Label>
                    <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">Company</Label>
                    <Input
                        id="company"
                        value={formData.company || ""}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">Source</Label>
                    <Input
                        id="source"
                        value={formData.source || ""}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select
                        onValueChange={(value: string | null) =>
                          setFormData({
                            ...formData,
                            status: (value ?? undefined) as Lead["status"] | undefined,
                          })
                        }
                        value={formData.status}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assigned_to" className="text-right">Assign To (User ID)</Label>
                    <Input
                        id="assigned_to"
                        type="number"
                        value={formData.assigned_to ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData({
                            ...formData,
                            assigned_to: v ? parseInt(v) : null,
                          });
                        }}
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
