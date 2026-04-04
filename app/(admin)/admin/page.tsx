 "use client";
 
 import Link from "next/link";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Settings, LayoutDashboard, ToggleLeft, Users, CheckSquare } from "lucide-react";
 
 export default function AdminHomePage() {
   return (
     <div className="p-6 space-y-6">
       <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
       <p className="text-muted-foreground">
         Quick access to key admin areas.
       </p>
 
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <LayoutDashboard className="h-5 w-5" />
               Dashboard
             </CardTitle>
             <CardDescription>View platform metrics and status.</CardDescription>
           </CardHeader>
           <CardContent>
             <p>Open the admin dashboard overview.</p>
           </CardContent>
           <CardFooter>
             <Button asChild>
               <Link href="/admin/dashboard">Open Dashboard</Link>
             </Button>
           </CardFooter>
         </Card>
 
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>Manage users, roles, and subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View all users, change roles, and upgrade plans.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/users">Open Users</Link>
            </Button>
          </CardFooter>
        </Card>
 
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Approvals
            </CardTitle>
            <CardDescription>Review manager requests requiring admin approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Approve or deny subscription upgrade requests.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/approvals/subscription-upgrades">Open Approvals</Link>
            </Button>
          </CardFooter>
        </Card>

         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Settings className="h-5 w-5" />
               Settings
             </CardTitle>
             <CardDescription>Manage application configuration.</CardDescription>
           </CardHeader>
           <CardContent>
             <p>Update general, AI, security, and environment settings.</p>
           </CardContent>
           <CardFooter>
             <Button asChild>
               <Link href="/admin/settings">Open Settings</Link>
             </Button>
           </CardFooter>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <ToggleLeft className="h-5 w-5" />
               Feature Flags
             </CardTitle>
             <CardDescription>Enable or disable system features.</CardDescription>
           </CardHeader>
           <CardContent>
             <p>Control feature availability including AI companion limits.</p>
           </CardContent>
           <CardFooter>
             <Button asChild>
               <Link href="/admin/settings#features">Manage Features</Link>
             </Button>
           </CardFooter>
         </Card>
       </div>
     </div>
   );
 }
