"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { User, usersService } from "@/lib/api/users"
import { toast } from "@/components/ui/use-toast"

interface GetColumnsProps {
  onEdit: (user: User) => void;
  onRefresh: () => void;
  onManageQuota?: (user: User) => void;
  isReadOnly?: boolean;
  showStudentVerification?: boolean;
}

export const getColumns = ({ onEdit, onRefresh, onManageQuota, isReadOnly, showStudentVerification = true }: GetColumnsProps): ColumnDef<User>[] => {
  const cols: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original as User
        const name =
          (row.getValue("name") as string) ||
          (user as unknown as { full_name?: string })?.full_name ||
          [ (user as unknown as { first_name?: string })?.first_name, (user as unknown as { last_name?: string })?.last_name ]
            .filter(Boolean)
            .join(" ") ||
          (user as unknown as { username?: string })?.username ||
          "—"
        return <span>{name}</span>
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original as User
        const roleVal = row.getValue("role")
        const role = (typeof roleVal === "string" ? roleVal : (roleVal as { name?: string; slug?: string } | null)?.name || (roleVal as { name?: string; slug?: string } | null)?.slug)
          || (user.roles && user.roles[0]?.name) || "user"
        return (
          <Badge variant={role === "admin" ? "default" : role === "therapist" ? "secondary" : "outline"}>
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean
        return (
          <Badge variant={isActive ? "secondary" : "destructive"} className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isActive ? "Active" : "Suspended"}
          </Badge>
        )
      },
    },
  ];

  if (showStudentVerification) {
    cols.push({
      accessorKey: "student_verification_status",
      header: "Student Verification",
      cell: ({ row }) => {
        const status = row.getValue("student_verification_status") as string | null
        if (!status) return <span className="text-gray-400">—</span>

        const variants = {
          pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
          approved: { label: "Approved", className: "bg-green-100 text-green-800" },
          rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
        }

        const variant = variants[status as keyof typeof variants] || { label: status, className: "bg-gray-100 text-gray-800" }

        return (
          <Badge variant="secondary" className={variant.className}>
            {variant.label}
          </Badge>
        )
      },
    });
  }

  cols.push({
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      if (isReadOnly) return null;

      const handleSuspend = async () => {
        try {
          if (user.is_active) {
            await usersService.suspendUser(user.id, "Admin action");
            toast({ title: "User Suspended", description: `${user.name} has been suspended.` });
          } else {
            await usersService.activateUser(user.id);
            toast({ title: "User Activated", description: `${user.name} has been activated.` });
          }
          onRefresh();
        } catch {
          toast({ title: "Error", description: "Action failed", variant: "destructive" });
        }
      }

      const handleStudentVerification = async (status: 'approved' | 'rejected') => {
        try {
          await usersService.verifyStudent(user.id, {
            student_verification_status: status,
            student_email: user.student_email,
            institution_name: user.institution_name
          });

          if (status === 'approved') {
            toast({
              title: "Student Verified",
              description: `${user.name}'s student status has been approved.`
            });
          } else {
            toast({
              title: "Student Rejected",
              description: `${user.name}'s student verification has been rejected.`
            });
          }
          onRefresh();
        } catch {
          toast({ title: "Error", description: "Verification failed", variant: "destructive" });
        }
      }

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(user.id))}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>Edit details</DropdownMenuItem>
            {showStudentVerification && user.student_verification_status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStudentVerification('approved')} className="text-green-600">
                  Approve Student Verification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStudentVerification('rejected')} className="text-red-600">
                  Reject Student Verification
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSuspend} className={user.is_active ? "text-red-600" : "text-green-600"}>
              {user.is_active ? "Suspend User" : "Activate User"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onManageQuota && (
              <DropdownMenuItem onClick={() => onManageQuota(user)}>
                Manage Quota
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  });

  return cols;
}
