"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function GeneralSettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    site_name: "Onwynd",
    support_email: "support@onwynd.com",
    contact_phone: "",
    address: "",
  });

  useEffect(() => {
    if (settings?.general) {
      // eslint-disable-next-line
      setFormData(prev => ({ ...prev, ...settings.general }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings("general", formData);
      toast({ title: "Settings saved", description: "General settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage site identity and contact information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input 
            id="site_name" 
            value={formData.site_name} 
            onChange={(e) => setFormData({...formData, site_name: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="support_email">Support Email</Label>
          <Input 
            id="support_email" 
            value={formData.support_email} 
            onChange={(e) => setFormData({...formData, support_email: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input 
            id="contact_phone" 
            value={formData.contact_phone} 
            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            value={formData.address} 
            onChange={(e) => setFormData({...formData, address: e.target.value})} 
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
