"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function SecuritySettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    require_2fa: false,
    password_expiry_days: "90",
    max_login_attempts: "5",
    session_timeout_minutes: "30",
  });

  useEffect(() => {
    if (settings?.security) {
      // eslint-disable-next-line
      setFormData(prev => ({
        ...prev,
        ...settings.security,
        require_2fa: settings.security.require_2fa === 'true' || settings.security.require_2fa === true
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings("security", {
        ...formData,
        require_2fa: formData.require_2fa ? 'true' : 'false'
      });
      toast({ title: "Settings saved", description: "Security settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage security policies and access controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="require_2fa">Require Two-Factor Authentication</Label>
          <Switch 
            id="require_2fa" 
            checked={formData.require_2fa} 
            onCheckedChange={(checked) => setFormData({...formData, require_2fa: checked})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password_expiry_days">Password Expiry (Days)</Label>
          <Input 
            id="password_expiry_days" 
            type="number"
            value={formData.password_expiry_days} 
            onChange={(e) => setFormData({...formData, password_expiry_days: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
          <Input 
            id="max_login_attempts" 
            type="number"
            value={formData.max_login_attempts} 
            onChange={(e) => setFormData({...formData, max_login_attempts: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="session_timeout_minutes">Session Timeout (Minutes)</Label>
          <Input 
            id="session_timeout_minutes" 
            type="number"
            value={formData.session_timeout_minutes} 
            onChange={(e) => setFormData({...formData, session_timeout_minutes: e.target.value})} 
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
