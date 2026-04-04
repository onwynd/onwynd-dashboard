"use client";

import { useEffect, useState } from "react";
import { User, usersService } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Eye, Mail, School, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function StudentVerificationsPage() {
  const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await usersService.getStudentVerifications({ status: 'pending' });
      const data = response.data || response;
      setPendingVerifications(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch pending verifications", error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch pending student verifications", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId: number, status: 'approved' | 'rejected') => {
    try {
      const user = pendingVerifications.find(u => u.id === userId);
      if (!user) return;

      await usersService.verifyStudent(userId, {
        student_verification_status: status,
        student_email: user.student_email,
        institution_name: user.institution_name
      });

      if (status === 'approved') {
        toast({ 
          title: "Student Approved", 
          description: `${user.name}'s student verification has been approved.` 
        });
      } else {
        toast({ 
          title: "Student Rejected", 
          description: `${user.name}'s student verification has been rejected.` 
        });
      }

      // Remove from pending list
      setPendingVerifications(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Verification failed", error);
      toast({ 
        title: "Error", 
        description: "Failed to process student verification", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading student verifications...</div>
      </div>
    );
  }

  if (pendingVerifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <School className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Pending Verifications</h3>
          <p className="text-muted-foreground">All student verifications are up to date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Verifications</h1>
          <p className="text-muted-foreground">
            Review and approve student verification requests
          </p>
        </div>
        <Badge variant="secondary" className="text-lg">
          {pendingVerifications.length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {pendingVerifications.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending Review
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Student Email:</span>
                    <span className="text-muted-foreground">{user.student_email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Institution:</span>
                    <span className="text-muted-foreground">{user.institution_name || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Applied:</span>
                    <span className="text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Role:</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleVerification(user.id, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Student
                </Button>
                <Button
                  onClick={() => handleVerification(user.id, 'rejected')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}