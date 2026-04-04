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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { supportService } from "@/lib/api/support";

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_agent?: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export function TicketsTable() {
  const [data, setData] = React.useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [viewTicket, setViewTicket] = React.useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ subject: "", description: "", priority: "medium" });
  const [agents, setAgents] = React.useState<{ id: number; first_name: string; last_name: string }[]>([]);
  const [assigningId, setAssigningId] = React.useState<number | null>(null);

  const fetchTickets = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams: Record<string, string> = {};
      if (globalFilter) queryParams.search = globalFilter;
      if (statusFilter !== "all") queryParams.status = statusFilter;
      if (priorityFilter !== "all") queryParams.priority = priorityFilter;

      const response = await supportService.getTickets(queryParams);
      if (response.success) {
        setData(response.data.data || response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [globalFilter, statusFilter, priorityFilter]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchTickets]);

  // Load support agents once for assignment dropdown
  React.useEffect(() => {
    supportService.getSupportAgents()
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleAssignAgent = async (ticketId: number, agentId: number | null) => {
    setAssigningId(ticketId);
    try {
      await supportService.updateTicket(ticketId, { assigned_to: agentId });
      await fetchTickets();
      if (viewTicket?.id === ticketId) setViewTicket(null);
    } catch (error) {
      console.error("Failed to assign agent", error);
    } finally {
      setAssigningId(null);
    }
  };

  const handleCreateTicket = async () => {
    if (!createForm.subject.trim()) return;
    setCreateSaving(true);
    try {
      await supportService.createTicket(createForm);
      setCreateOpen(false);
      setCreateForm({ subject: "", description: "", priority: "medium" });
      fetchTickets();
    } catch {
      console.error("Failed to create ticket");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: Ticket["status"]) => {
    try {
      await supportService.updateTicket(id, { status });
      await fetchTickets();
    } catch (error) {
      console.error("Failed to update ticket status", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in_progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "closed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 font-bold";
      case "high":
        return "text-orange-600 font-semibold";
      case "medium":
        return "text-blue-600";
      case "low":
        return "text-slate-600";
      default:
        return "";
    }
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      accessorKey: "id",
      header: "Ticket ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subject
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("subject")}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex flex-col">
            <span>{user ? `${user.first_name} ${user.last_name}` : 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">{user?.email || '-'}</span>
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
          <Badge className={getStatusColor(status)} variant="outline">
            {status.replace("_", " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <span className={getPriorityColor(priority)}>
            {priority.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "assigned_agent",
      header: "Assigned To",
      cell: ({ row }) => {
        const agent = row.original.assigned_agent;
        return agent ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
              {agent.first_name.charAt(0)}
            </div>
            <span>{agent.first_name} {agent.last_name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const ticket = row.original;

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
                onClick={() => navigator.clipboard.writeText(ticket.id.toString())}
              >
                Copy Ticket ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}>Mark In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'resolved')}>Mark Resolved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'closed')}>Close Ticket</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setViewTicket(ticket)}>View Details</DropdownMenuItem>
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
    manualFiltering: true, // Server-side filtering
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Subject,Description,Status,Priority,Customer,Email,Assigned To,Created At\n"
      + table.getFilteredRowModel().rows.map(row => 
        `"${row.original.id}","${row.original.subject}","${row.original.description}","${row.original.status}","${row.original.priority}","${row.original.user ? `${row.original.user.first_name} ${row.original.user.last_name}` : ''}","${row.original.user?.email || ''}","${row.original.assigned_agent ? `${row.original.assigned_agent.first_name} ${row.original.assigned_agent.last_name}` : ''}","${row.original.created_at}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "support_tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("open")}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("closed")}>
                Closed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setPriorityFilter("all")}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("urgent")}>
                Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("high")}>
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("low")}>
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Ticket
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
                  {isLoading ? "Loading..." : "No results."}
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

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>New Support Ticket</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Subject *</Label>
              <Input value={createForm.subject} onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of the issue" />
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={createForm.priority} onValueChange={v => setCreateForm(f => ({ ...f, priority: v ?? "medium" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description…" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSaving}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={createSaving || !createForm.subject.trim()}>
              {createSaving ? "Creating…" : "Create Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!viewTicket} onOpenChange={o => !o && setViewTicket(null)}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Ticket #{viewTicket?.id} — {viewTicket?.subject}</DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Status</span>
                  <p><Badge className={`mt-1 ${getStatusColor(viewTicket.status)}`}>{viewTicket.status.replace("_", " ")}</Badge></p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Priority</span>
                  <p className={`mt-1 font-medium ${getPriorityColor(viewTicket.priority)}`}>{viewTicket.priority}</p>
                </div>
                {viewTicket.user && (
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Customer</span>
                    <p className="mt-1">{viewTicket.user.first_name} {viewTicket.user.last_name}</p>
                    <p className="text-muted-foreground">{viewTicket.user.email}</p>
                  </div>
                )}
                {viewTicket.assigned_agent && (
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Assigned To</span>
                    <p className="mt-1">{viewTicket.assigned_agent.first_name} {viewTicket.assigned_agent.last_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Created</span>
                  <p className="mt-1">{new Date(viewTicket.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Updated</span>
                  <p className="mt-1">{new Date(viewTicket.updated_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Description</span>
                <Textarea className="mt-1" readOnly value={viewTicket.description} rows={4} />
              </div>
              {agents.length > 0 && (
                <div className="grid gap-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Assign to Agent</Label>
                  <Select
                    value={viewTicket.assigned_agent ? String((viewTicket as unknown as Record<string, unknown>).assigned_to ?? "") : ""}
                    onValueChange={(v) => handleAssignAgent(viewTicket!.id, v ? Number(v) : null)}
                    disabled={assigningId === viewTicket.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select support agent…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.first_name} {a.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { handleUpdateStatus(viewTicket!.id, 'in_progress'); setViewTicket(null); }}>Mark In Progress</Button>
            <Button onClick={() => { handleUpdateStatus(viewTicket!.id, 'resolved'); setViewTicket(null); }}>Mark Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
