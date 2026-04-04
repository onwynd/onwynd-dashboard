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
  Shield,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Plus,
} from "lucide-react";
import { useRolesStore } from "@/store/roles-store";
import { Role, rolesService } from "@/lib/api/roles";
import { Badge } from "@/components/ui/badge";
import { RoleForm } from "./role-form";
import { useToast } from "@/components/ui/use-toast";

export function RolesTable() {
  const { roles, permissions, fetchRoles, fetchPermissions, isLoading: isStoreLoading, lastError } = useRolesStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);
  React.useEffect(() => {
    if (lastError) {
      toast({ title: "Error", description: lastError, variant: "destructive" });
    }
  }, [lastError, toast]);

  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roles, searchQuery]);

  type RolePayload = { name: string; permissions?: string[] };
  const handleCreate = async (data: RolePayload) => {
    setIsLoading(true);
    try {
      await rolesService.createRole(data);
      toast({ title: "Success", description: "Role created successfully" });
      fetchRoles();
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Error", description: "Failed to create role", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: RolePayload) => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await rolesService.updateRole(selectedRole.id, data);
      toast({ title: "Success", description: "Role updated successfully" });
      fetchRoles();
      setIsDialogOpen(false);
      setSelectedRole(undefined);
    } catch {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
    try {
      await rolesService.deleteRole(role.id);
      toast({ title: "Success", description: "Role deleted successfully" });
      fetchRoles();
    } catch {
      toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
    }
  };

  const openCreateDialog = () => {
    setSelectedRole(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Roles & Permissions
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Guard</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isStoreLoading && roles.length === 0 ? (
               <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading roles...
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.guard_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                        {role.permissions?.slice(0, 5).map((p) => (
                            <Badge key={p.id} variant="secondary" className="text-xs">
                                {p.name}
                            </Badge>
                        ))}
                        {(role.permissions?.length || 0) > 5 && (
                            <Badge variant="outline" className="text-xs">
                                +{(role.permissions?.length || 0) - 5} more
                            </Badge>
                        )}
                    </div>
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
                        <DropdownMenuItem onClick={() => openEditDialog(role)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(role)}>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {selectedRole ? "Update role permissions." : "Create a new role and assign permissions."}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            initialData={selectedRole}
            allPermissions={permissions}
            onSubmit={selectedRole ? handleEdit : handleCreate}
            isLoading={isLoading}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
