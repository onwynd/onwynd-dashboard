"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BrandingSettings } from "@/components/admin-dashboard/settings/branding-settings";
import { Loader2, Save, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { partnerService } from "@/lib/api/partner";
import client from "@/lib/api/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrgProfile {
  name: string;
  email: string;
  phone: string;
}

export default function PartnerSettingsPage() {
  const [org, setOrg] = useState<OrgProfile>({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await partnerService.getProfile();
      if (data) {
        const d = data as Record<string, unknown>;
        setOrg({
          name: (d.name as string) ?? "",
          email: (d.email as string) ?? "",
          phone: (d.phone as string) ?? "",
        });
      }
    } catch {
      // keep current state
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await client.post("/api/v1/partner/leave-organization");
      toast({ title: "Left organization", description: "Your account is now a regular user. Please log out and sign back in." });
      setLeaveOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to leave organization.", variant: "destructive" });
    } finally {
      setLeaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await partnerService.updateProfile({
        name: org.name,
        email: org.email,
        phone: org.phone,
      });
      await loadProfile();
      toast({ title: "Saved", description: "Organization profile updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your partner account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update your organization details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Organization Name</Label>
            <Input
              placeholder="Your company name"
              value={org.name}
              onChange={(e) => setOrg((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Contact Email</Label>
            <Input
              type="email"
              placeholder="contact@company.com"
              value={org.email}
              onChange={(e) => setOrg((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="+234..."
              value={org.phone}
              onChange={(e) => setOrg((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <Separator />
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize how the dashboard looks for your organization members.</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingSettings />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Leaving your organization is permanent. Your account will become a regular user account and you will lose access to corporate features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setLeaveOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave Organization
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave organization?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be removed from your organization and your account will be downgraded to a regular user. This action cannot be undone. You will need to be re-invited to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={leaving}
              onClick={handleLeave}
            >
              {leaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, leave organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
