"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Filter,
  Download,
  Plus,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useInstitutionalStore, type Referral } from "@/store/institutional-store";
import { institutionalService } from "@/lib/api/institutional";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import { useEffect } from "react";



export function ReferralsTable() {
  const { searchQuery, setSearchQuery, getFilteredReferrals, fetchReferrals, createReferral } = useInstitutionalStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailReferral, setDetailReferral] = useState<Referral | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Referral | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const referrals = getFilteredReferrals();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' } 
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = (a as unknown as Record<string, unknown>)[sortConfig.key];
    const bValue = (b as unknown as Record<string, unknown>)[sortConfig.key];
    const aComparable = typeof aValue === 'number' ? aValue : String(aValue ?? '');
    const bComparable = typeof bValue === 'number' ? bValue : String(bValue ?? '');
    
    if (aComparable < bComparable) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aComparable > bComparable) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAndSortedReferrals = sortedReferrals.filter(r => 
    statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase()
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
      case "discharged":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Patient", "Program", "Status", "Created At", "Doctor"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedReferrals.map(r => [
        r.id,
        `"${r.patientName}"`,
        `"${r.program}"`,
        r.status,
        r.created_at,
        `"${r.doctorName}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "referrals_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatus = async () => {
    if (!updateTarget || !updateStatus) return;
    setIsUpdating(true);
    try {
      await institutionalService.updateReferralStatus(updateTarget.id, updateStatus);
      toast({ title: "Status Updated", description: `Referral status changed to ${updateStatus}.` });
      setUpdateTarget(null);
      setUpdateStatus("");
      fetchReferrals();
    } catch {
      toast({ title: "Error", description: "Failed to update referral status", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async (referral: Referral) => {
    if (!window.confirm(`Cancel referral for ${referral.patientName}?`)) return;
    try {
      await institutionalService.cancelReferral(referral.id);
      toast({ title: "Referral Cancelled", description: `Referral for ${referral.patientName} has been cancelled.` });
      fetchReferrals();
    } catch {
      toast({ title: "Error", description: "Failed to cancel referral", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {["all", "Active", "Pending", "Completed", "Cancelled"].map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All Statuses" : status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                <span className="hidden sm:inline">New Referral</span>
              </Button>
            </DialogTrigger>
            <CreateReferralDialog 
              onSubmit={async (data) => {
                await createReferral(data as Record<string, unknown>);
                setIsCreateOpen(false);
              }} 
            />
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort('patientName')}>
                <div className="flex items-center gap-2">
                  Patient
                  {sortConfig?.key === 'patientName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('program')}>
                <div className="flex items-center gap-2">
                  Program
                  {sortConfig?.key === 'program' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-2">
                  Status
                  {sortConfig?.key === 'status' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-2">
                  Date
                  {sortConfig?.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedReferrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No referrals found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>
                          {(referral.patientName || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {referral.patientName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {referral.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{referral.program}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("font-normal", getStatusColor(referral.status))}
                    >
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {referral.created_at}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {(referral.doctorName || "D")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{referral.doctorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailReferral(referral)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setUpdateTarget(referral); setUpdateStatus(referral.status); }}>
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={referral.status.toLowerCase() === "cancelled"}
                          onClick={() => handleCancel(referral)}
                        >
                          Cancel Referral
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!detailReferral} onOpenChange={(o) => { if (!o) setDetailReferral(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
            <DialogDescription>Full information for this referral.</DialogDescription>
          </DialogHeader>
          {detailReferral && (
            <div className="space-y-3 text-sm">
              {[
                ["Patient", detailReferral.patientName],
                ["Program", detailReferral.program],
                ["Doctor", detailReferral.doctorName || "—"],
                ["Status", detailReferral.status],
                ["Created", detailReferral.created_at],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailReferral(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateTarget} onOpenChange={(o) => { if (!o) { setUpdateTarget(null); setUpdateStatus(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
            <DialogDescription>
              Change the status for {updateTarget?.patientName}&apos;s referral.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={updateStatus} onValueChange={(v: string | null) => v && setUpdateStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {["active", "pending", "completed", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUpdateTarget(null); setUpdateStatus(""); }}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating || !updateStatus}>
              {isUpdating ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateReferralDialog({ onSubmit }: { onSubmit: (data: unknown) => Promise<void> }) {
  const { plans, fetchPlans } = useInstitutionalStore();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    program: "",
    doctor_name: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        program: "",
        doctor_name: ""
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create referral. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>New Referral</DialogTitle>
        <DialogDescription>
          Create a new referral for a patient. An account will be created if one doesn&apos;t exist.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="program">Program / Plan</Label>
          <Select 
            value={formData.program} 
            onValueChange={(value: string | null) => setFormData({ ...formData, program: value ?? "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent>
              {(plans as Array<{ id: string | number; name: string }>).map((plan) => (
                <SelectItem key={plan.id} value={plan.name}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor_name">Assign Doctor (Optional)</Label>
          <Input
            id="doctor_name"
            value={formData.doctor_name}
            onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
            placeholder="Dr. Name"
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Referral"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
