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
  FileText,
  Eye,
  Send,
  Printer
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from "@/store/finance-store";
import { financeService } from "@/lib/api/finance";
import { toast } from "@/components/ui/use-toast";

export interface Invoice {
  id: number;
  invoice_number: string;
  user_name?: string;
  user_email?: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string;
  created_at: string;
}

export function InvoicesTable() {
  const { invoices: data, isLoading, fetchInvoices } = useFinanceStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ user_email: "", amount: "", currency: "NGN", due_date: "", status: "pending" });

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = async () => {
    if (!createForm.user_email || !createForm.amount) {
      toast({ description: "Email and amount are required", variant: "destructive" });
      return;
    }
    setCreateSaving(true);
    try {
      await financeService.createInvoice({
        user_email: createForm.user_email,
        amount: Number(createForm.amount),
        currency: createForm.currency,
        due_date: createForm.due_date || null,
        status: createForm.status,
      });
      toast({ description: "Invoice created" });
      setCreateOpen(false);
      setCreateForm({ user_email: "", amount: "", currency: "NGN", due_date: "", status: "pending" });
      fetchInvoices();
    } catch {
      toast({ description: "Failed to create invoice", variant: "destructive" });
    } finally {
      setCreateSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<Invoice>[] = [
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
      accessorKey: "invoice_number",
      header: "Invoice #",
      cell: ({ row }) => <div className="font-medium">{row.getValue("invoice_number")}</div>,
    },
    {
      accessorKey: "user_name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.getValue("user_name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.user_email}</span>
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
          <Badge className={getStatusColor(status)} variant="outline">
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("due_date")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;

        const handlePrint = () => {
          const customerName = invoice.user
            ? `${invoice.user.first_name} ${invoice.user.last_name}`
            : (invoice.user_name ?? "—");
          const customerEmail = invoice.user?.email ?? invoice.user_email ?? "—";
          const amount = new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: invoice.currency,
          }).format(invoice.amount);
          const due = new Date(invoice.due_date).toLocaleDateString("en-NG", {
            year: "numeric", month: "long", day: "numeric",
          });
          const issued = new Date(invoice.created_at).toLocaleDateString("en-NG", {
            year: "numeric", month: "long", day: "numeric",
          });

          const win = window.open("", "_blank", "width=800,height=700");
          if (!win) return;
          win.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo img { max-width: 150px; height: auto; }
    .invoice-meta { text-align: right; }
    .invoice-meta h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .invoice-meta p { color: #666; font-size: 14px; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .section { margin-bottom: 24px; }
    .label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
    .value { font-size: 15px; }
    .row { display: flex; gap: 48px; }
    .amount-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; margin-top: 32px; }
    .amount-box .total-label { font-size: 13px; color: #6b7280; }
    .amount-box .total-value { font-size: 32px; font-weight: 700; margin-top: 4px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-cancelled { background: #f3f4f6; color: #374151; }
    .footer { margin-top: 48px; font-size: 12px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo"><img src="${window.location.origin}/LOGO.SVG" alt="Onwynd" /></div>
    <div class="invoice-meta">
      <h1>Invoice</h1>
      <p>#${invoice.invoice_number}</p>
      <p style="margin-top:8px"><span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span></p>
    </div>
  </div>
  <hr class="divider" />
  <div class="row section">
    <div>
      <div class="label">Billed To</div>
      <div class="value">${customerName}</div>
      <div class="value" style="color:#6b7280;font-size:13px">${customerEmail}</div>
    </div>
    <div>
      <div class="label">Issued</div>
      <div class="value">${issued}</div>
    </div>
    <div>
      <div class="label">Due Date</div>
      <div class="value">${due}</div>
    </div>
  </div>
  <hr class="divider" />
  <div class="amount-box">
    <div class="total-label">Total Amount</div>
    <div class="total-value">${amount}</div>
  </div>
  <div class="footer">Onwynd Mental Health Platform &bull; onwynd.com</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
          win.document.close();
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" /> Resend Email
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

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Invoice #,Customer,Email,Amount,Currency,Status,Due Date,Created At\n"
      + table.getFilteredRowModel().rows.map(row => 
        `"${row.original.invoice_number}","${row.original.user_name}","${row.original.user_email}",${row.original.amount},"${row.original.currency}","${row.original.status}","${row.original.due_date}","${row.original.created_at}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices.csv");
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
              placeholder="Search invoices..."
              value={(table.getColumn("invoice_number")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("invoice_number")?.setFilterValue(event.target.value)
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
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("paid")}>
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("overdue")}>
                Overdue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("cancelled")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Create Invoice
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

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Customer Email *</Label>
              <Input type="email" placeholder="customer@example.com" value={createForm.user_email} onChange={e => setCreateForm(f => ({ ...f, user_email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Amount *</Label>
                <Input type="number" min={0} placeholder="e.g. 50000" value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Currency</Label>
                <Input value={createForm.currency} onChange={e => setCreateForm(f => ({ ...f, currency: e.target.value }))} placeholder="NGN" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v ?? "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "paid", "overdue", "cancelled"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={createForm.due_date} onChange={e => setCreateForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSaving}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={createSaving || !createForm.user_email || !createForm.amount}>
              {createSaving ? "Creating…" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
