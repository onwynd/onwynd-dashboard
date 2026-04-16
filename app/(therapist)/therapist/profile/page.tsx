"use client";

import { useEffect, useRef, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  Loader2,
  Star,
  Users,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Verification {
  status: "pending" | "approved" | "rejected" | null;
  is_verified: boolean;
  rejection_reason: string | null;
  rejected_at: string | null;
  verified_at: string | null;
  has_certificate: boolean;
}

interface Profile {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  specialization: string | null;
  qualification: string | null;
  years_of_experience: number | null;
  license_number: string | null;
  hourly_rate: number | null;
  currency: string;
  status: string | null;
  avatar_url: string | null;
  certificate_url: string | null;
  languages: string[];
  areas_of_focus: string[];
  verification: Verification | null;
  stats: {
    total_sessions: number;
    completed_sessions: number;
    average_rating: number;
    total_reviews: number;
  };
  created_at: string;
}

function VerificationStatusCard({ verification, onUpload, uploading }: {
  verification: Verification | null;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!verification || !verification.status) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-yellow-600 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-200">Profile Not Submitted</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                Your therapist profile has not been submitted for verification. Upload your certificate to begin.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-fit border-yellow-400 text-yellow-800"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
            Upload Certificate
          </Button>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        </CardContent>
      </Card>
    );
  }

  if (verification.status === "approved") {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="rounded-full bg-green-100 p-3">
            <ShieldCheck className="size-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900 dark:text-green-200">Verified Therapist</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
              Your profile and credentials have been verified by the Onwynd team.
              {verification.verified_at && (
                <> Approved on {new Date(verification.verified_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (verification.status === "rejected") {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-3 shrink-0">
              <ShieldAlert className="size-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">Documents Rejected</p>
              {verification.rejected_at && (
                <p className="text-xs text-red-500 mt-0.5">
                  Rejected on {new Date(verification.rejected_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              )}
              {verification.rejection_reason && (
                <div className="mt-2 rounded-md border border-red-200 bg-white/60 px-3 py-2 text-sm text-red-800 leading-relaxed">
                  <span className="font-medium">Reason: </span>{verification.rejection_reason}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-700">Please address the issue above and re-upload your certificate.</p>
            <Button
              variant="destructive"
              size="sm"
              className="w-fit"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RefreshCw className="size-4 mr-2" />}
              Re-upload Certificate
            </Button>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        </CardContent>
      </Card>
    );
  }

  // pending
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="rounded-full bg-yellow-100 p-3 shrink-0">
          <Clock className="size-6 text-yellow-600 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-yellow-900 dark:text-yellow-200">Verification Pending</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
            Your documents have been submitted and are currently under review by the Onwynd team.
            This typically takes 1–3 business days.
          </p>
          {verification.has_certificate && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              <FileText className="size-3" /> Certificate uploaded ✓
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await therapistService.getProfile();
      const data = (res as any)?.data ?? res;
      setProfile(data as Profile | null);
    } catch (error: any) {
      console.error("Profile load failed:", error);
      
      // More specific error messages based on error type
      if (error?.response?.status === 401) {
        toast({ title: "Authentication Error", description: "Please log in again", variant: "destructive" });
      } else if (error?.response?.status === 403) {
        toast({ title: "Permission Error", description: "You don't have permission to view this profile", variant: "destructive" });
      } else if (error?.response?.status === 404) {
        toast({ title: "Profile Not Found", description: "Profile could not be found", variant: "destructive" });
      } else if (error?.response?.status >= 500) {
        toast({ title: "Server Error", description: "Server error occurred. Please try again later", variant: "destructive" });
      } else if (error?.message?.includes("Network")) {
        toast({ title: "Network Error", description: "Network connection failed. Please check your internet", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to load profile. Please try again", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCertificateUpload = async (file: File) => {
    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid File", description: "Only PDF, JPG, JPEG, and PNG files are allowed", variant: "destructive" });
      return;
    }
    
    if (file.size > maxSize) {
      toast({ title: "File Too Large", description: "File size must be less than 10MB", variant: "destructive" });
      return;
    }
    
    setUploading(true);
    try {
      await therapistService.uploadCertificate(file);
      toast({ title: "Certificate Uploaded", description: "Your certificate has been submitted for review." });
      load();
    } catch (error: any) {
      console.error("Certificate upload failed:", error);
      
      // More specific error messages based on error type
      if (error?.response?.status === 400) {
        const message = error?.response?.data?.message || "Invalid file format or size";
        toast({ title: "Upload Failed", description: message, variant: "destructive" });
      } else if (error?.response?.status === 413) {
        toast({ title: "File Too Large", description: "File size exceeds server limit", variant: "destructive" });
      } else if (error?.response?.status === 401) {
        toast({ title: "Authentication Error", description: "Please log in again", variant: "destructive" });
      } else if (error?.response?.status >= 500) {
        toast({ title: "Server Error", description: "Server error occurred. Please try again later", variant: "destructive" });
      } else if (error?.message?.includes("Network")) {
        toast({ title: "Network Error", description: "Network connection failed. Please check your internet", variant: "destructive" });
      } else {
        toast({ title: "Upload Failed", description: "Could not upload certificate. Please try again", variant: "destructive" });
      }
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const v = profile.verification;
  const verificationBadge = () => {
    if (!v || !v.status) return <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-500">Not Submitted</Badge>;
    if (v.status === "approved") return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Verified</Badge>;
    if (v.status === "rejected") return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground text-sm">View your professional profile and verification status.</p>
        </div>
      </div>

      {/* Verification Status — always at top */}
      <VerificationStatusCard
        verification={v}
        onUpload={handleCertificateUpload}
        uploading={uploading}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions",  value: profile.stats.total_sessions,    icon: Calendar },
          { label: "Completed",       value: profile.stats.completed_sessions, icon: Users    },
          { label: "Avg Rating",      value: profile.stats.average_rating.toFixed(1) + " ★", icon: Star },
          { label: "Reviews",         value: profile.stats.total_reviews,      icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5" />{label}
              </div>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Professional Details</CardTitle>
            {verificationBadge()}
          </div>
          <CardDescription>Your information as visible to patients and the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <InfoRow label="Full Name"   value={profile.full_name} />
            <InfoRow label="Email"       value={profile.email} />
            <InfoRow label="Phone"       value={profile.phone} />
            <InfoRow label="Specialization" value={profile.specialization} />
            <InfoRow label="Qualification"  value={profile.qualification} />
            <InfoRow label="Experience"  value={profile.years_of_experience ? `${profile.years_of_experience} years` : null} />
            <InfoRow label="License No." value={profile.license_number} />
            <InfoRow label="Hourly Rate" value={profile.hourly_rate ? `${profile.currency} ${Number(profile.hourly_rate).toLocaleString()}` : null} />
          </div>

          {profile.bio && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bio</p>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </div>
            </>
          )}

          {profile.languages?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {profile.areas_of_focus?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Areas of Focus</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.areas_of_focus.map((a) => (
                    <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Document section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Your uploaded professional documents and their verification status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border rounded-lg px-4">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Professional Certificate</p>
                <p className="text-xs text-muted-foreground">
                  {v?.has_certificate ? "Certificate on file" : "No certificate uploaded"}
                </p>
              </div>
            </div>
            {verificationBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Accepted formats: PDF, JPG, PNG. To update your certificate, go to{" "}
            <a href="/therapist/settings" className="underline text-primary">Settings</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="font-medium">{value ?? <span className="text-muted-foreground font-normal">—</span>}</p>
    </div>
  );
}
