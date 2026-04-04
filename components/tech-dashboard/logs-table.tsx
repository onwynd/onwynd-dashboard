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
  Download
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

import { techService } from "@/lib/api/tech";
import { format } from "date-fns";

export interface LogEntry {
  id: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  service: string;
  timestamp: string;
}

export function LogsTable() {
  const [data, setData] = React.useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [logSource, setLogSource] = React.useState<"activity" | "system">("activity");

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      if (logSource === "activity") {
        response = await techService.getLogs();
      } else {
        response = await techService.getSystemLogs();
      }

      if (response.success || response.data) { // Handle both response structures
        // Handle different response structures
        const logs = response.data?.data || response.data || [];
        // Ensure logs match LogEntry interface
        const formattedLogs = Array.isArray(logs)
          ? logs.map((log: unknown) => {
              const l = log as Record<string, unknown>;
              return {
                id: String(l?.id ?? ""),
                level: String(l?.level ?? "INFO") as LogEntry["level"],
                message: String(l?.message ?? ""),
                service: String(l?.service ?? "System"),
                timestamp: String((l?.created_at as string | undefined) ?? (l?.timestamp as string | undefined) ?? ""),
              } as LogEntry;
            })
          : [];
        setData(formattedLogs);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  }, [logSource]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "WARNING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "ERROR":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "CRITICAL":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<LogEntry>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("timestamp") as string;
        try {
          return <div>{format(new Date(date), "MMM d, HH:mm:ss")}</div>
        } catch {
          return <div>{date}</div>
        }
      },
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.getValue("level") as string;
        return (
          <Badge className={getLevelColor(level)} variant="outline">
            {level}
          </Badge>
        )
      },
    },
    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }) => <div>{row.getValue("service")}</div>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => <div className="max-w-[500px] truncate" title={row.getValue("message")}>{row.getValue("message")}</div>,
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
      + "Timestamp,Level,Service,Message\n"
      + table.getFilteredRowModel().rows.map(row => 
        `"${row.original.timestamp}","${row.original.level}","${row.original.service}","${row.original.message}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${logSource}_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="activity" onValueChange={(v: string | null) => setLogSource((v ?? "activity") as "activity" | "system") } className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <TabsList>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="system">System Logs</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("message")?.setFilterValue(event.target.value)
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
                 <DropdownMenuLabel>Filter by Level</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => table.getColumn("level")?.setFilterValue("")}>
                   All Levels
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => table.getColumn("level")?.setFilterValue("INFO")}>
                   INFO
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => table.getColumn("level")?.setFilterValue("WARNING")}>
                   WARNING
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => table.getColumn("level")?.setFilterValue("ERROR")}>
                   ERROR
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => table.getColumn("level")?.setFilterValue("CRITICAL")}>
                   CRITICAL
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <TabsContent value="activity" className="m-0">
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
                      {isLoading ? "Loading..." : "No logs found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="system" className="m-0">
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
                      {isLoading ? "Loading..." : "No logs found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
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
