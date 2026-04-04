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
  Download,
  Plus,
  Edit,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

import { secretaryService } from "@/lib/api/secretary";
import { VisitorForm } from "@/components/secretary/visitors/visitor-form";

export interface Visitor {
  id: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  host: string;
  check_in_time: string;
  check_out_time: string | null;
  status: "checked_in" | "checked_out";
  created_at: string;
}

function VisitorsTableView({
  data,
  onCheckOut,
  onEdit,
}: {
  data: Visitor[];
  onCheckOut: (visitor: Visitor) => void;
  onEdit: (visitor: Visitor) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  const columns: ColumnDef<Visitor>[] = [
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
      accessorKey: "name",
      header: "Visitor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => <div className="text-sm">{row.getValue("purpose")}</div>,
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => <div className="text-sm">{row.getValue("host")}</div>,
    },
    {
      accessorKey: "check_in_time",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Check In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue("check_in_time") as string;
        if (!dateStr) return <span>N/A</span>;
        const date = new Date(dateStr);
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{format(date, "h:mm a")}</span>
            <span className="text-xs text-muted-foreground">{format(date, "MMM d")}</span>
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
          <Badge variant={status === "checked_in" ? "default" : "secondary"}>
            {status === "checked_in" ? "Checked In" : "Checked Out"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const visitor = row.original;
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
              {visitor.status === 'checked_in' && (
                <DropdownMenuItem onClick={() => onCheckOut(visitor)}>
                  <LogOut className="mr-2 h-4 w-4" /> Check Out
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(visitor)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
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
                  No results.
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
    </div>
  );
}

export function VisitorsTable() {
  const [data, setData] = React.useState<Visitor[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedVisitor, setSelectedVisitor] = React.useState<Visitor | null>(null);

  const fetchVisitors = React.useCallback(async () => {
    try {
      const result = await secretaryService.getVisitors({ search: globalFilter });
      const visitorsData = result.data?.data || result.data || result || [];
      setData(Array.isArray(visitorsData) ? visitorsData : []);
    } catch {
      toast({ title: "Error", description: "Failed to load visitors.", variant: "destructive" });
    }
  }, [globalFilter]);

  React.useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleCheckOut = async (visitor: Visitor) => {
    try {
      await secretaryService.checkoutVisitor(visitor.id);
      fetchVisitors();
      toast({ title: "Success", description: "Visitor checked out successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to check out visitor.", variant: "destructive" });
    }
  };

  const openEditDialog = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsEditOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search visitors..."
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Check In Visitor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Check In Visitor</DialogTitle>
                <DialogDescription>Register a new visitor.</DialogDescription>
              </DialogHeader>
              <VisitorForm onSuccess={() => {
                setIsCreateOpen(false);
                fetchVisitors();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <VisitorsTableView data={data} onCheckOut={handleCheckOut} onEdit={openEditDialog} />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Visitor</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <VisitorForm
              initialData={selectedVisitor}
              onSuccess={() => {
                setIsEditOpen(false);
                fetchVisitors();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
