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
  Download,
  Rocket,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import client from "@/lib/api/client";

export interface Deployment {
  id: string;
  version: string;
  environment: "Production" | "Staging" | "Development";
  status: "Success" | "Failed" | "In Progress" | "Pending";
  deployed_by: string;
  deployed_at: string;
  duration: string;
}

export function DeploymentsTable() {
  const [data, setData] = React.useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchDeployments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.get("/api/v1/tech/deployments");
      if (response.data.success) {
        const deployments = response.data.data.data || response.data.data || [];
        // Transform data if necessary
        const formattedDeployments = (Array.isArray(deployments) ? deployments : []).map((dep: unknown) => {
          const d = dep as Record<string, unknown>;
          return {
            id: String(d?.id ?? ""),
            version: String(d?.version ?? ""),
            environment: String(d?.environment ?? "Development") as Deployment["environment"],
            status: String(d?.status ?? "Pending") as Deployment["status"],
            deployed_by: String(d?.deployed_by ?? ""),
            deployed_at: String(d?.deployed_at ?? ""),
            duration: String(d?.duration ?? ""),
          } as Deployment;
        });
        setData(formattedDeployments);
      }
    } catch (error) {
      console.error("Failed to fetch deployments", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success": return <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />;
      case "Failed": return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
      case "In Progress": return <Clock className="h-4 w-4 text-blue-500 mr-2 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  const columns: ColumnDef<Deployment>[] = [
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => <div className="font-bold">{row.getValue("version")}</div>,
    },
    {
      accessorKey: "environment",
      header: "Environment",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("environment")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center">
            {getStatusIcon(status)}
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "deployed_by",
      header: "Deployed By",
      cell: ({ row }) => <div className="text-sm">{row.getValue("deployed_by")}</div>,
    },
    {
      accessorKey: "deployed_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deployed At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue("deployed_at")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <div className="text-sm font-mono">{row.getValue("duration")}</div>,
    },
    {
      id: "actions",
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Logs</DropdownMenuItem>
              <DropdownMenuItem>Rollback</DropdownMenuItem>
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

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Version,Environment,Status,Deployed By,Deployed At,Duration\n"
      + table.getFilteredRowModel().rows.map(row => 
        `"${row.original.version}","${row.original.environment}","${row.original.status}","${row.original.deployed_by}","${row.original.deployed_at}","${row.original.duration}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deployments.csv");
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
              placeholder="Search version..."
              value={(table.getColumn("version")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("version")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <Rocket className="mr-2 h-4 w-4" /> Trigger Deploy
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
    </div>
  );
}
