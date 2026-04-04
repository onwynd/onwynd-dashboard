"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesStore } from "@/store/sales-store";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-utils";
import { salesService } from "@/lib/api/sales";
import { toast } from "@/components/ui/use-toast";
import { HandoffModal } from "./handoff-modal";
import { ScheduleDemoModal } from "./schedule-demo-modal";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Lost" | "Converted";
  value: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Contacted: "bg-yellow-100 text-yellow-800",
  Qualified: "bg-purple-100 text-purple-800",
  Lost: "bg-red-100 text-red-800",
  Converted: "bg-green-100 text-green-800",
};

export function LeadsTable() {
  const rawLeads = useSalesStore((state) => state.leads);
  const fetchLeads = useSalesStore((state) => state.fetchLeads);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [handoffLead, setHandoffLead] = React.useState<Lead | null>(null);
  const [scheduleLead, setScheduleLead] = React.useState<Lead | null>(null);
  const [viewLead, setViewLead] = React.useState<Lead | null>(null);
  const [editLead, setEditLead] = React.useState<Lead | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: "", email: "", phone: "", company: "", source: "", status: "New" as Lead["status"], value: "" });

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Map API shape → component shape
  const leads: Lead[] = rawLeads.map((l) => ({
    id: l.id,
    name: `${l.first_name ?? ""} ${l.last_name ?? ""}`.trim(),
    email: l.email,
    phone: l.phone ?? "",
    company: l.company ?? "",
    source: l.source ?? "",
    status: (l.status.charAt(0).toUpperCase() + l.status.slice(1)) as Lead["status"],
    value: l.value ?? 0,
    created_at: l.created_at,
  }));
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Lead; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  const filteredLeads = React.useMemo(() => {
    const filtered = leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [leads, searchQuery, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: keyof Lead) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setEditForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status, value: String(lead.value) });
  };

  const handleEditSave = async () => {
    if (!editLead) return;
    setEditSaving(true);
    try {
      const [first_name, ...rest] = editForm.name.trim().split(" ");
      await salesService.updateLead(editLead.id, {
        first_name,
        last_name: rest.join(" ") || "",
        email: editForm.email,
        phone: editForm.phone,
        company: editForm.company,
        source: editForm.source,
        status: editForm.status.toLowerCase(),
        value: Number(editForm.value) || 0,
      });
      toast({ description: "Lead updated" });
      setEditLead(null);
      fetchLeads();
    } catch {
      toast({ description: "Failed to update lead", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return;
    try {
      await salesService.deleteLead(lead.id);
      toast({ description: "Lead deleted" });
      fetchLeads();
    } catch {
      toast({ description: "Failed to delete lead", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Source", "Status", "Value", "Created At"];
    const rows = filteredLeads.map((l) => ({
      Name: l.name,
      Email: l.email,
      Phone: l.phone,
      Company: l.company,
      Source: l.source,
      Status: l.status,
      Value: l.value,
      "Created At": l.created_at,
    }));
    downloadCSV("leads.csv", headers, rows);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={statusFilter === "all"} onCheckedChange={() => setStatusFilter("all")}>
                All Statuses
              </DropdownMenuCheckboxItem>
              {Object.keys(statusColors).map((status) => (
                <DropdownMenuCheckboxItem key={status} checked={statusFilter === status} onCheckedChange={() => setStatusFilter(status)}>
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                Name {sortConfig?.key === "name" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("company")}>
                Company {sortConfig?.key === "company" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Status {sortConfig?.key === "status" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("value")}>
                Value {sortConfig?.key === "value" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground gap-1">
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</div>
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[lead.status]}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${lead.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setScheduleLead(lead)}>
                          Schedule Demo Call
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHandoffLead(lead)}>
                          Hand Off to Builder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setViewLead(lead)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(lead)}>Edit Lead</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lead)}>Delete Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {scheduleLead && (
        <ScheduleDemoModal
          isOpen={!!scheduleLead}
          onClose={() => {
            setScheduleLead(null);
            fetchLeads();
          }}
          leadId={scheduleLead.id}
          leadName={scheduleLead.name}
          companyName={scheduleLead.company}
        />
      )}

      {handoffLead && (
        <HandoffModal
          isOpen={!!handoffLead}
          onClose={() => {
            setHandoffLead(null);
            fetchLeads();
          }}
          leadId={handoffLead.id}
          leadName={handoffLead.name}
        />
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewLead} onOpenChange={o => !o && setViewLead(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {viewLead && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{viewLead.name}</p></div>
                <div><span className="text-muted-foreground">Company</span><p className="font-medium">{viewLead.company || "—"}</p></div>
                <div><span className="text-muted-foreground">Email</span><p>{viewLead.email}</p></div>
                <div><span className="text-muted-foreground">Phone</span><p>{viewLead.phone || "—"}</p></div>
                <div><span className="text-muted-foreground">Source</span><p>{viewLead.source || "—"}</p></div>
                <div><span className="text-muted-foreground">Status</span><Badge variant="secondary" className={statusColors[viewLead.status]}>{viewLead.status}</Badge></div>
                <div><span className="text-muted-foreground">Value</span><p className="font-semibold">${viewLead.value.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Created</span><p>{new Date(viewLead.created_at).toLocaleDateString()}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLead(null)}>Close</Button>
            <Button onClick={() => { setViewLead(null); openEdit(viewLead!); }}>Edit Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLead} onOpenChange={o => !o && setEditLead(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Full Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Company</Label>
                <Input value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v as Lead["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["New", "Contacted", "Qualified", "Lost", "Converted"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Deal Value ($)</Label>
                <Input type="number" min={0} value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Source</Label>
              <Input value={editForm.source} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLead(null)} disabled={editSaving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
