"use client";

import { useEffect, useState, useMemo } from "react";
import { User, usersService } from "@/lib/api/users";
import { getColumns } from "@/components/admin-dashboard/users/columns";
import { DataTable } from "@/components/admin-dashboard/users/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Upload, Loader2, Building2, FileText } from "lucide-react";
import { UserForm } from "@/components/admin-dashboard/users/user-form";
import { toast } from "@/components/ui/use-toast";
import { downloadImportTemplate } from "@/lib/import-templates";
import Cookies from "js-cookie";
import { Lock } from "lucide-react";

export default function InstitutionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [institutionType, setInstitutionType] = useState<'all' | 'school' | 'company'>('all');
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const role = Cookies.get('user_role');
    if (role === 'coo' || role === 'cgo') {
      setIsReadOnly(true);
    }
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersService.getUsers({ role: 'institution', institution_type: institutionType });
      const data = response.data || response;
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch institutions", error);
      toast({ title: "Error", description: "Failed to fetch institutions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [institutionType]);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: unknown) => {
    try {
      // Force role to institution
      const base = (data as Partial<User> & { password?: string }) || {};
      const userData = { ...base, role: 'institution' };
      
      if (selectedUser) {
        await usersService.updateUser(selectedUser.id, userData);
        toast({ title: "Success", description: "Institution updated successfully" });
      } else {
        await usersService.createUser(userData);
        toast({ title: "Success", description: "Institution created successfully" });
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
      throw error; 
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Status", "Created At"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => 
        [u.id, `"${u.name}"`, u.email, u.is_active ? "Active" : "Inactive", u.created_at].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "institutions_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      toast({ title: "Import Started", description: `Uploading ${file.name}…` });
      try {
        const form = new FormData();
        form.append("file", file);
        const endpoint = institutionType === "school"
          ? "/api/v1/institutional/universities/import"
          : "/api/v1/institutional/corporates/import";
        const res = await (await import("@/lib/api/client")).default.post(endpoint, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const { created = 0, skipped = 0 } = res.data?.data ?? {};
        toast({ title: "Import Complete", description: `${created} created, ${skipped} skipped.` });
        fetchUsers();
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Import failed.";
        toast({ title: "Import Failed", description: msg, variant: "destructive" });
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    downloadImportTemplate('institutions');
    toast({ title: "Template Downloaded", description: "Institutions import template downloaded successfully" });
  };

  const columns = useMemo(() => getColumns({ onEdit: handleEdit, onRefresh: fetchUsers, isReadOnly, showStudentVerification: institutionType === 'school' }), [fetchUsers, isReadOnly, institutionType]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Institutions
              {isReadOnly && <Badge variant="outline" className="ml-2 gap-1 text-xs font-normal opacity-70"><Lock className="w-3 h-3" /> Read-Only</Badge>}
            </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={institutionType} onValueChange={(val) => setInstitutionType((val as 'all' | 'school' | 'company') || 'all')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="school">School</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>
          </Tabs>
          {!isReadOnly && (
            <>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <FileText className="mr-2 h-4 w-4" /> Template
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" /> Import
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          {!isReadOnly && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add New Institution
            </Button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}

      <UserForm 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleSubmit}
        initialData={selectedUser}
      />
    </div>
  );
}
