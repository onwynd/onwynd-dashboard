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
  Filter,
  MoreHorizontal,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft
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
import { Badge } from "@/components/ui/badge";
import { financeService } from "@/lib/api/finance";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending" | "failed" | "reconciled";
  category: string;
  date: string;
  merchant?: string;
}

export function TransactionsList() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchTransactions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await financeService.getTransactions();
      if (response.success) {
        // Handle pagination structure
        const transactionsData = response.data.data || response.data || [];
        
        type BackendTx = {
          id: string;
          description: string;
          amount: string | number;
          type: "income" | "expense";
          status: "completed" | "pending" | "failed" | "reconciled";
          category: string;
          created_at?: string;
          date?: string;
          merchant?: string;
        };
        const transformedData = (transactionsData as BackendTx[]).map((tx) => ({
          id: tx.id,
          description: tx.description,
          amount: typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount,
          type: tx.type,
          status: tx.status,
          category: tx.category,
          date: tx.created_at || tx.date || "",
          merchant: tx.merchant,
        }));
        
        setData(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleReconcile = async (id: string) => {
    try {
      await financeService.reconcileTransaction(id);
      toast({ title: "Success", description: "Transaction reconciled." });
      fetchTransactions();
    } catch {
      toast({ title: "Error", description: "Failed to reconcile.", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "description",
      header: "Transaction",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{transaction.description}</span>
            <span className="text-xs text-muted-foreground">
              {transaction.merchant || transaction.id}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex items-center gap-2">
            {type === "income" ? (
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
            )}
            <span className="capitalize">{type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors: Record<string, string> = {
          completed: "bg-emerald-100 text-emerald-800",
          pending: "bg-yellow-100 text-yellow-800",
          failed: "bg-rose-100 text-rose-800",
          reconciled: "bg-blue-100 text-blue-800",
        };
        
        return (
          <Badge
            variant="secondary"
            className={statusColors[status] || "bg-gray-100"}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        try {
          return formatDistanceToNow(new Date(row.getValue("date")), { addSuffix: true });
        } catch {
          return row.getValue("date");
        }
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        const formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount);
  
        return (
          <div className={`text-right font-medium ${
            type === "income" ? "text-emerald-600" : "text-rose-600"
          }`}>
            {type === "income" ? "+" : "-"}{formatted}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original;
  
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
                onClick={() => navigator.clipboard.writeText(transaction.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Download Receipt</DropdownMenuItem>
              {transaction.status !== 'reconciled' && (
                <DropdownMenuItem onClick={() => handleReconcile(transaction.id)}>
                  Mark Reconciled
                </DropdownMenuItem>
              )}
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
            placeholder="Filter transactions..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <CheckCircle
                        className={`mr-2 h-4 w-4 ${
                          column.getIsVisible() ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {column.id}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  {isLoading ? "Loading transactions..." : "No transactions found."}
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
