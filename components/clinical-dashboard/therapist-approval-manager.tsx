"use client";

import { useEffect, useState } from "react";
import { clinicalService } from "@/lib/api/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Loader2,
  Eye
} from "lucide-react";

interface PendingTherapist {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  specializations?: string[];
  experience_years?: number;
  hourly_rate?: number;
  bio?: string;
  license_number?: string;
  qualifications?: string[];
  verification_documents?: any[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
  submitted_at?: string;
}

export function TherapistApprovalManager() {
  const [therapists, setTherapists] = useState<PendingTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingTherapists = async () => {
    try {
      setLoading(true);
      // Fetch all therapists and filter for pending status on client side
      const response = await clinicalService.getPendingTherapists();
      const allTherapists = response?.data || [];
      // Filter for pending status to ensure we only show pending therapists
      const pendingTherapists = allTherapists.filter((t: PendingTherapist) => t.status === 'pending');
      setTherapists(pendingTherapists);
    } catch (error) {
      console.error("Failed to fetch pending therapists:", error);
      toast({
        title: "Error",
        description: "Failed to load pending therapists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (therapistId: string) => {
    try {
      setProcessingId(therapistId);
      await clinicalService.approveTherapist(therapistId, "Approved by clinical advisor");
      
      setTherapists(prev => prev.filter(t => t.id !== therapistId));
      
      toast({
        title: "Success",
        description: "Therapist approved successfully",
      });
    } catch (error) {
      console.error("Failed to approve therapist:", error);
      toast({
        title: "Error",
        description: "Failed to approve therapist",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (therapistId: string) => {
    try {
      setProcessingId(therapistId);
      await clinicalService.rejectTherapist(therapistId, "Profile does not meet requirements");
      
      setTherapists(prev => prev.filter(t => t.id !== therapistId));
      
      toast({
        title: "Success",
        description: "Therapist rejected successfully",
      });
    } catch (error) {
      console.error("Failed to reject therapist:", error);
      toast({
        title: "Error",
        description: "Failed to reject therapist",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchPendingTherapists();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading pending therapists...</span>
        </CardContent>
      </Card>
    );
  }

  if (therapists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Therapist Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No pending therapist applications</p>
            <p className="text-xs text-gray-500 mt-1">
              All therapist applications have been reviewed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Therapist Approvals ({therapists.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Therapist</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {therapists.map((therapist) => (
                <TableRow key={therapist.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(therapist.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{therapist.full_name}</p>
                        {therapist.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {therapist.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{therapist.email}</p>
                      {therapist.phone && (
                        <p className="text-xs text-muted-foreground">{therapist.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {therapist.experience_years ? (
                        <p>{therapist.experience_years} years</p>
                      ) : (
                        <p className="text-muted-foreground">Not specified</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specializations?.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {therapist.specializations && therapist.specializations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{therapist.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      ₦{therapist.hourly_rate?.toLocaleString() || "Not set"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {therapist.submitted_at ? formatDate(therapist.submitted_at) : formatDate(therapist.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={therapist.verification_documents?.length ? "default" : "secondary"}>
                        <FileText className="h-3 w-3 mr-1" />
                        {therapist.verification_documents?.length || 0} docs
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/therapist/profile/${therapist.id}`, '_blank')}
                        title="View full profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(therapist.id)}
                        disabled={processingId === therapist.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Approve"
                      >
                        {processingId === therapist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(therapist.id)}
                        disabled={processingId === therapist.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Reject"
                      >
                        {processingId === therapist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}