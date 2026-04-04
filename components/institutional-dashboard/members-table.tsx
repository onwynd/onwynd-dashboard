"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Plus,
  Upload,
  ArrowUpDown,
} from "lucide-react";
import { useInstitutionalStore } from "@/store/institutional-store";
import { Member, institutionalService } from "@/lib/api/institutional";
import { Badge } from "@/components/ui/badge";
import { MemberForm } from "./member-form";
import { useToast } from "@/components/ui/use-toast";

type SortConfig = {
  key: keyof Member | null;
  direction: 'asc' | 'desc';
};

export function MembersTable() {
  const members = useInstitutionalStore((state) => state.members);
  const fetchMembers = useInstitutionalStore((state) => state.fetchMembers);
  const orgId = useInstitutionalStore((state) => state.orgId);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: null, direction: 'asc' });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const organizationId = orgId ?? "current";

  React.useEffect(() => {
    if (orgId) fetchMembers(orgId);
  }, [fetchMembers, orgId]);

  const sortedMembers = React.useMemo(() => {
    const sortableMembers = [...members];
    if (sortConfig.key) {
      sortableMembers.sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortConfig.key as string];
        const bValue = (b as unknown as Record<string, unknown>)[sortConfig.key as string];
        const ax = typeof aValue === 'number' ? aValue : String(aValue ?? '');
        const bx = typeof bValue === 'number' ? bValue : String(bValue ?? '');
        if (ax < bx) return sortConfig.direction === 'asc' ? -1 : 1;
        if (ax > bx) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableMembers;
  }, [members, sortConfig]);

  const filteredMembers = React.useMemo(() => {
    return sortedMembers.filter((member) => {
      const fullName = (member.name || "");
      return (
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [sortedMembers, searchQuery]);

  const requestSort = (key: keyof Member) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  type MemberFormData = {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    status: 'active' | 'inactive' | 'pending';
  };

  const handleCreate = async (data: MemberFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        department: data.department,
        status: data.status,
      } as Partial<Member>;
      await institutionalService.addMember(organizationId, payload);
      toast({ title: "Success", description: "Member added successfully" });
      fetchMembers(organizationId);
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: MemberFormData) => {
    if (!selectedMember) return;
    setIsLoading(true);
    try {
      const payload = {
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        department: data.department,
        status: data.status,
      } as Partial<Member>;
      await institutionalService.updateMember(organizationId, selectedMember.id, payload);
      toast({ title: "Success", description: "Member updated successfully" });
      fetchMembers(organizationId);
      setIsDialogOpen(false);
      setSelectedMember(undefined);
    } catch {
      toast({ title: "Error", description: "Failed to update member", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await institutionalService.deleteMember(organizationId, member.id);
      toast({ title: "Success", description: "Member removed successfully" });
      fetchMembers(organizationId);
    } catch {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        try {
          await institutionalService.importMembers(organizationId, file);
          toast({ title: "Success", description: "Members imported successfully" });
          fetchMembers(organizationId);
        } catch {
          toast({ title: "Error", description: "Import failed", variant: "destructive" });
        }
      }
    };
    input.click();
  };

  const openCreateDialog = () => {
    setSelectedMember(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Members List
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('email')}>
                Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('department')}>
                Department <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.department || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'outline' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember ? "Edit Member" : "Add Member"}</DialogTitle>
            <DialogDescription>
              {selectedMember ? "Update member details." : "Add a new member to your organization."}
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            initialData={selectedMember}
            onSubmit={selectedMember ? handleEdit : handleCreate}
            isLoading={isLoading}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
