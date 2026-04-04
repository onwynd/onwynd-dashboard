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
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Banknote
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useFinanceStore } from "@/store/finance-store";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { exportToCsv } from "@/lib/export-utils";

export interface Payout {
  id: number;
  user_name?: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "rejected";
  bank_name: string;
  account_number: string;
  created_at: string;
}

type BatchProcessResult = {
  processed_count?: number;
  data?: {
    processed_count?: number;
  };
};

export function PayoutsTable() {
  const { payouts: data, isLoading, processing, fetchPayouts, processBatch, processOne } = useFinanceStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [lastProcessedCount, setLastProcessedCount] = React.useState<number | null>(null);
  const [lastFailedCount, setLastFailedCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (lastProcessedCount != null) {
      const t = setTimeout(() => setLastProcessedCount(null), 6000);
      return () => clearTimeout(t);
    }
  }, [lastProcessedCount]);
  React.useEffect(() => {
    if (lastFailedCount != null) {
      const t = setTimeout(() => setLastFailedCount(null), 8000);
      return () => clearTimeout(t);
    }
  }, [lastFailedCount]);

  React.useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
      default: return <Clock className="h-4 w-4 text-amber-500 mr-2" />;
    }
  };

  const columns: ColumnDef<Payout>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
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
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user_name",
      header: "Recipient",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("user_name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.bank_name} • {row.original.account_number}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount);
 
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center">
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Requested At",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        const handleApprove = async () => {
          try {
            await processOne(id, "approve");
            toast({ description: "Payout approved", variant: "success" });
            await fetchPayouts();
          } catch {
            toast({ description: "Failed to approve payout", variant: "error" });
          }
        };
        const handleReject = async () => {
          try {
            const reason = window.prompt("Provide rejection reason (optional):") || undefined;
            await processOne(id, "reject", reason);
            toast({ description: "Payout rejected", variant: "success" });
            await fetchPayouts();
          } catch {
            toast({ description: "Failed to reject payout", variant: "error" });
          }
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleApprove}>Approve Payout</DropdownMenuItem>
              <DropdownMenuItem onClick={handleReject} className="text-red-600">Reject Payout</DropdownMenuItem>
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

  async function handleProcess() {
    const selected = table.getFilteredSelectedRowModel().rows;
    if (!selected.length) {
      toast({ description: "Select at least one payout to process", variant: "warning" });
      return;
    }
    const ids = selected.map((r) => r.original.id);
    try {
      const result = (await processBatch(ids)) as BatchProcessResult;
      const processedCount = result?.processed_count ?? result?.data?.processed_count ?? ids.length;
      const failedCount = (result as unknown as { failed_count?: number })?.failed_count
        ?? (result as unknown as { data?: { failed_count?: number } })?.data?.failed_count
        ?? 0;
      toast({ description: `Processed ${processedCount} payout(s) successfully`, variant: "success" });
      setLastProcessedCount(processedCount);
      if (failedCount > 0) {
        setLastFailedCount(failedCount);
      }
      await fetchPayouts();
      table.resetRowSelection();
    } catch {
      toast({ description: "Failed to process payouts", variant: "error" });
    }
  }

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map(row => ({
      recipient: row.original.user_name,
      amount: row.original.amount,
      currency: row.original.currency,
      status: row.original.status,
      bank: row.original.bank_name,
      account: row.original.account_number,
      requested_at: row.original.created_at
    }));
    exportToCsv("payouts.csv", rows);
  };

  return (
    <div className="w-full space-y-4">
      {lastFailedCount != null && lastFailedCount > 0 && (
        <Alert>
          <AlertDescription>
            {lastFailedCount} payout{lastFailedCount === 1 ? "" : "s"} failed to process. Please review their status.
          </AlertDescription>
        </Alert>
      )}
      {lastProcessedCount != null && (
        <Alert>
          <AlertDescription>
            Processed {lastProcessedCount} payout{lastProcessedCount === 1 ? "" : "s"} successfully.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipients..."
              value={(table.getColumn("user_name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("user_name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("failed")}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleProcess} disabled={processing}>
            <Banknote className="mr-2 h-4 w-4" /> {processing ? "Processing..." : "Process Payouts"}
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
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={columns.length} className="h-24 text-center">
                   Loading...
                 </TableCell>
               </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => row.toggleSelected()}
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
