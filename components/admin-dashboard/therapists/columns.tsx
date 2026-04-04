 "use client"
 
 import { ColumnDef } from "@tanstack/react-table"
 import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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
 import { User, usersService } from "@/lib/api/users"
 import { toast } from "@/components/ui/use-toast"
 
 interface GetColumnsProps {
   onEdit: (user: User) => void;
   onRefresh: () => void;
 }
 
 export const getTherapistColumns = ({ onEdit, onRefresh }: GetColumnsProps): ColumnDef<User>[] => [
   {
     accessorKey: "name",
     header: ({ column }) => (
       <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
         Name
         <ArrowUpDown className="ml-2 h-4 w-4" />
       </Button>
     ),
   },
   {
     accessorKey: "email",
     header: ({ column }) => (
       <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
         Email
         <ArrowUpDown className="ml-2 h-4 w-4" />
       </Button>
     ),
   },
   {
     id: "role_display",
     header: "Role",
     cell: ({ row }) => {
       const user = row.original
       const role = user.role || (user.roles && user.roles[0]?.name) || "therapist"
       return (
         <Badge variant={role === "admin" ? "default" : "secondary"}>
           {role}
         </Badge>
       )
     },
   },
   {
     accessorKey: "location",
     header: "Location",
     cell: ({ row }) => {
       const loc = row.getValue("location") as string | undefined
       return <span className="text-sm">{loc || "—"}</span>
     },
   },
   {
     accessorKey: "is_active",
     header: "Account Status",
     cell: ({ row }) => {
       const active = row.getValue("is_active") as boolean
       return active
         ? <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
         : <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-500 border-zinc-200">Inactive</Badge>
     },
   },
   {
     accessorKey: "document_verification_status",
     header: "Document Verification",
     cell: ({ row }) => {
       const status = row.getValue("document_verification_status") as string | null
       if (!status) return <span className="text-gray-400">—</span>
       const variants = {
         pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
         approved: { label: "Verified", className: "bg-green-100 text-green-800" },
         rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
       }
       const variant = variants[status as keyof typeof variants] || { label: status, className: "bg-gray-100 text-gray-800" }
       return (
         <Badge variant="secondary" className={variant.className}>
           {variant.label}
         </Badge>
       )
     },
   },
   {
     id: "actions",
     cell: ({ row }) => {
       const user = row.original
       const toggleActive = async () => {
         try {
           if (user.is_active) {
             await usersService.suspendUser(user.id, "Admin action")
             toast({ title: "Therapist Suspended", description: `${user.name} has been suspended.` })
           } else {
             await usersService.activateUser(user.id)
             toast({ title: "Therapist Activated", description: `${user.name} has been activated.` })
           }
           onRefresh()
         } catch {
           toast({ title: "Error", description: "Action failed", variant: "destructive" })
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
               Copy therapist ID
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => onEdit(user)}>Edit details</DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={toggleActive} className={user.is_active ? "text-red-600" : "text-green-600"}>
               {user.is_active ? "Suspend Therapist" : "Activate Therapist"}
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       )
     },
   },
 ]
