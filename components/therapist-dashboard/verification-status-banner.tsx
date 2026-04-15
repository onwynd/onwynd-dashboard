
// filepath: components/therapist-dashboard/verification-status-banner.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface VerificationStatusBannerProps {
  status: "approved" | "pending_approval" | "suspended" | "rejected" | string;
}

export function VerificationStatusBanner({ status }: VerificationStatusBannerProps) {
  switch (status) {
    case "approved":
      return (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Profile Approved</AlertTitle>
          <AlertDescription>
            Your profile is live and visible to patients.
          </AlertDescription>
        </Alert>
      );
    case "pending_approval":
      return (
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
          <Clock className="h-4 w-4" />
          <AlertTitle>Profile Pending Approval</AlertTitle>
          <AlertDescription>
            Your profile is under review. We will notify you once it's approved.
          </AlertDescription>
        </Alert>
      );
    case "rejected":
    case "suspended":
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required: Profile {status}</AlertTitle>
          <AlertDescription>
            Your profile has been {status}. Please check your email or contact support for more information.
          </AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
}
