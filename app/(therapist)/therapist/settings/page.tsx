"use client";

import { useEffect, useRef, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Upload, FileText, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProfileForm {
  full_name: string;
  phone: string;
  bio: string;
  specialization: string;
  qualification: string;
  years_of_experience: string;
  hourly_rate: string;
  is_accepting_clients: boolean;
  has_35min_slot: boolean;
  rate_35min: string;
}

export default function TherapistSettingsPage() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    bio: "",
    specialization: "",
    qualification: "",
    years_of_experience: "",
    hourly_rate: "",
    is_accepting_clients: true,
    has_35min_slot: false,
    rate_35min: "",
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await therapistService.getProfile();
      const profile = data as any;
      setEmail(profile?.email ?? "");
      setHasCertificate(profile?.verification?.has_certificate ?? false);
      setVerificationStatus(profile?.verification?.status ?? null);
      setForm({
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        bio: profile?.bio ?? "",
        specialization: profile?.specialization ?? "",
        qualification: profile?.qualification ?? "",
        years_of_experience: String(profile?.years_of_experience ?? ""),
        hourly_rate: String(profile?.hourly_rate ?? ""),
        is_accepting_clients: profile?.is_accepting_clients ?? true,
        has_35min_slot: profile?.has_35min_slot ?? false,
        rate_35min: profile?.rate_35min ? String(profile.rate_35min) : "",
      });
    } catch (error: any) {
      console.error("Profile load failed:", error);
      
      // More specific error messages based on error type
      if (error?.response?.status === 401) {
        toast({ title: "Authentication Error", description: "Please log in again", variant: "destructive" });
      } else if (error?.response?.status === 403) {
        toast({ title: "Permission Error", description: "You don't have permission to view this profile", variant: "destructive" });
      } else if (error?.response?.status === 404) {
        // No profile yet — new therapist. Show empty form silently.
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.full_name.trim()) {
      toast({ title: "Validation Error", description: "Full name is required", variant: "destructive" });
      return;
    }
    
    if (form.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.phone)) {
      toast({ title: "Validation Error", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    
    if (form.years_of_experience && (isNaN(Number(form.years_of_experience)) || Number(form.years_of_experience) < 0)) {
      toast({ title: "Validation Error", description: "Years of experience must be a positive number", variant: "destructive" });
      return;
    }
    
    if (form.hourly_rate && (isNaN(Number(form.hourly_rate)) || Number(form.hourly_rate) <= 0)) {
      toast({ title: "Validation Error", description: "Hourly rate must be a positive number", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      await therapistService.updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        years_of_experience: form.years_of_experience,
        hourly_rate: form.hourly_rate,
        has_35min_slot: form.has_35min_slot,
        rate_35min: form.has_35min_slot && form.rate_35min ? Number(form.rate_35min) : null,
      });
      toast({ title: "Saved", description: "Your profile has been updated." });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      
      // More specific error messages based on error type
      if (error?.response?.status === 400) {
        const message = error?.response?.data?.message || "Invalid data provided";
        toast({ title: "Validation Error", description: message, variant: "destructive" });
      } else if (error?.response?.status === 401) {
        toast({ title: "Authentication Error", description: "Please log in again", variant: "destructive" });
      } else if (error?.response?.status === 403) {
        toast({ title: "Permission Error", description: "You don't have permission to update this profile", variant: "destructive" });
      } else if (error?.response?.status >= 500) {
        toast({ title: "Server Error", description: "Server error occurred. Please try again later", variant: "destructive" });
      } else if (error?.message?.includes("Network")) {
        toast({ title: "Network Error", description: "Network connection failed. Please check your internet", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to save profile. Please try again", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

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
    
    setIsUploading(true);
    try {
      await therapistService.uploadCertificate(file);
      toast({ title: "Certificate Uploaded", description: "Your certificate has been submitted for re-review." });
      setHasCertificate(true);
      setVerificationStatus("pending");
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
      setIsUploading(false);
    }
  };

  const setField = (field: keyof ProfileForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const verificationBadge = () => {
    if (!verificationStatus) return null;
    const styles: Record<string, string> = {
      approved: "bg-green-50 text-green-700 border-green-200",
      pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    const labels: Record<string, string> = { approved: "Verified", pending: "Pending Review", rejected: "Rejected" };
    return (
      <Badge variant="outline" className={`text-xs ${styles[verificationStatus] ?? ""}`}>
        {labels[verificationStatus] ?? verificationStatus}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your profile, documents and availability preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your professional details visible to patients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} placeholder="Dr. Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" disabled value={email} className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+234 800 000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} placeholder="Clinical Psychologist" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" value={form.qualification} onChange={(e) => setField("qualification", e.target.value)} placeholder="Ph.D., MSc" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input id="years_of_experience" type="number" min={0} value={form.years_of_experience} onChange={(e) => setField("years_of_experience", e.target.value)} placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (NGN)</Label>
                <Input id="hourly_rate" type="number" min={0} value={form.hourly_rate} onChange={(e) => setField("hourly_rate", e.target.value)} placeholder="15000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setField("bio", e.target.value)} placeholder="Tell patients about yourself, your approach and experience." />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* 35-Minute Corporate Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>35-Minute Corporate Sessions</CardTitle>
            <CardDescription>
              Opt in to offer shorter sessions for employees on corporate wellness plans.
              Corporate clients default to therapists in this pool. Your 35-minute rate is
              independent — set it freely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Offer 35-minute sessions</Label>
                <p className="text-xs text-muted-foreground">
                  Makes you visible to corporate employees booking with employer credits.
                </p>
              </div>
              <Switch
                checked={form.has_35min_slot}
                onCheckedChange={(v) => setField("has_35min_slot", v)}
              />
            </div>

            {form.has_35min_slot && (
              <div className="space-y-3 rounded-lg bg-muted/40 p-4">
                <div className="space-y-2">
                  <Label htmlFor="rate_35min">Your 35-minute rate (NGN)</Label>
                  <Input
                    id="rate_35min"
                    type="number"
                    min={0}
                    value={form.rate_35min}
                    onChange={(e) => setField("rate_35min", e.target.value)}
                    placeholder="8000"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sessions at or below ₦15,000 are fully covered by the employer — employees pay
                    nothing. Sessions above ₦15,000 charge the employee the difference.
                  </p>
                </div>

                {form.rate_35min && Number(form.rate_35min) > 0 && (
                  <div className="rounded-md border bg-background p-3 text-sm space-y-1">
                    <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Indicative Earnings per Session
                    </p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your rate</span>
                      <span className="font-medium">
                        ₦{Number(form.rate_35min).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform commission (15%)</span>
                      <span>− ₦{Math.round(Number(form.rate_35min) * 0.15).toLocaleString()}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>You keep</span>
                      <span>₦{Math.round(Number(form.rate_35min) * 0.85).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Founding therapists retain 88% instead of 85%. Your exact rate depends on
                      your agreement with Onwynd.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Professional Certificate</CardTitle>
                <CardDescription>Upload or replace your verification document.</CardDescription>
              </div>
              {verificationBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <span className="text-sm">{hasCertificate ? "Certificate on file" : "No certificate uploaded"}</span>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => certRef.current?.click()}>
                {isUploading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
                {hasCertificate ? "Replace" : "Upload"}
              </Button>
              <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCertificateUpload(f); }} />
            </div>
            <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG · Max 10 MB. Uploading a new certificate resets verification to pending review.</p>
          </CardContent>
        </Card>

        {/* Notification preferences */}
        <Link href="/therapist/settings/notifications" className="block">
          <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Notification preferences</p>
                  <p className="text-xs text-muted-foreground">Control which alerts reach you and how.</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        {/* Availability preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Preferences</CardTitle>
            <CardDescription>Control your booking availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Accepting New Patients</Label>
                <p className="text-xs text-muted-foreground">Allow new patients to book sessions with you.</p>
              </div>
              <Switch checked={form.is_accepting_clients} onCheckedChange={(v) => setField("is_accepting_clients", v)} />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              For detailed time-slot management, visit the{" "}
              <a href="/therapist/appointments" className="underline text-primary">Appointments</a> page.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
