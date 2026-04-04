 "use client";
 
 import { useState, useEffect } from "react";
 import { useRouter } from "next/navigation";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Plus, Edit, Trash2, Eye } from "lucide-react";
 import { toast } from "@/components/ui/use-toast";
 import { adminService } from "@/lib/api/admin";
 
 interface Center {
   id: string;
   name: string;
   address: string;
   phone: string;
   email: string;
   manager_id?: string;
   manager_name?: string;
   status: string;
   created_at: string;
 }
 
 export default function AdminCentersPage() {
   const router = useRouter();
   const [centers, setCenters] = useState<Center[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchCenters();
   }, []);
 
   const fetchCenters = async () => {
     setLoading(true);
     try {
       const data = await adminService.getCenters();
      setCenters(Array.isArray(data) ? data : []);
     } catch {
      toast({
        title: "Error",
        description: "Failed to fetch centers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
   };
 
   const handleDelete = async (id: string) => {
     if (!confirm("Are you sure you want to delete this center?")) {
       return;
     }
 
     try {
       await adminService.deleteCenter(id);
       toast({
         title: "Success",
         description: "Center deleted successfully",
       });
       fetchCenters();
     } catch {
       toast({
         title: "Error",
         description: "Failed to delete center",
         variant: "destructive",
       });
     }
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold">Centers Management</h1>
         <Button onClick={() => router.push("/admin/centers/create")}>
           <Plus className="w-4 h-4 mr-2" />
           Create Center
         </Button>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle>All Centers</CardTitle>
         </CardHeader>
         <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Name</TableHead>
                 <TableHead>Address</TableHead>
                 <TableHead>Phone</TableHead>
                 <TableHead>Email</TableHead>
                 <TableHead>Manager</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Created</TableHead>
                 <TableHead>Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {centers.map((center) => (
                 <TableRow key={center.id}>
                   <TableCell className="font-medium">{center.name}</TableCell>
                   <TableCell>{center.address}</TableCell>
                   <TableCell>{center.phone}</TableCell>
                   <TableCell>{center.email}</TableCell>
                   <TableCell>{center.manager_name || "No Manager"}</TableCell>
                   <TableCell>
                     <span className={`px-2 py-1 rounded-full text-xs ${
                       center.status === "active" 
                         ? "bg-green-100 text-green-800" 
                         : "bg-red-100 text-red-800"
                     }`}>
                       {center.status}
                     </span>
                   </TableCell>
                   <TableCell>
                     {new Date(center.created_at).toLocaleDateString()}
                   </TableCell>
                   <TableCell>
                     <div className="flex space-x-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => router.push(`/admin/centers/${center.id}`)}
                       >
                         <Eye className="w-4 h-4" />
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => router.push(`/admin/centers/${center.id}/edit`)}
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDelete(center.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
 
           {centers.length === 0 && (
             <div className="text-center py-8 text-muted-foreground">
               No centers found. Create your first center to get started.
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
