"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import client from "@/lib/api/client";

interface HRSettings {
  annual_leave_days: number;
  sick_leave_days: number;
  maternity_leave_days: number;
  paternity_leave_days: number;
  require_manager_approval: boolean;
  payroll_cycle: string;
  payroll_processing_day: number;
  auto_process_payroll: boolean;
  notify_leave_request: boolean;
  notify_job_application: boolean;
  notify_payroll_processed: boolean;
}

const DEFAULTS: HRSettings = {
  annual_leave_days: 21,
  sick_leave_days: 10,
  maternity_leave_days: 84,
  paternity_leave_days: 14,
  require_manager_approval: true,
  payroll_cycle: "monthly",
  payroll_processing_day: 25,
  auto_process_payroll: false,
  notify_leave_request: true,
  notify_job_application: true,
  notify_payroll_processed: true,
};

export default function HRSettingsPage() {
  const [settings, setSettings] = useState<HRSettings>(DEFAULTS);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    client.get("/api/v1/admin/settings").then((res) => {
      const hr = res.data?.hr;
      if (hr) setSettings((prev) => ({ ...prev, ...hr }));
    }).catch(() => {});
  }, []);

  const patch = (key: keyof HRSettings, value: unknown) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const saveSection = async (section: "leave" | "payroll" | "notifications") => {
    setSaving(section);
    try {
      const payload = section === "leave"
        ? {
            annual_leave_days: settings.annual_leave_days,
            sick_leave_days: settings.sick_leave_days,
            maternity_leave_days: settings.maternity_leave_days,
            paternity_leave_days: settings.paternity_leave_days,
            require_manager_approval: settings.require_manager_approval,
          }
        : section === "payroll"
        ? {
            payroll_cycle: settings.payroll_cycle,
            payroll_processing_day: settings.payroll_processing_day,
            auto_process_payroll: settings.auto_process_payroll,
          }
        : {
            notify_leave_request: settings.notify_leave_request,
            notify_job_application: settings.notify_job_application,
            notify_payroll_processed: settings.notify_payroll_processed,
          };

      await client.put("/api/v1/admin/settings/hr", payload);
      toast({ title: "Saved", description: "HR settings updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">HR Settings</h1>
        <p className="text-muted-foreground">Configure HR policies and system preferences.</p>
      </div>

      {/* Leave Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policy</CardTitle>
          <CardDescription>Set default leave entitlements and approval workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Annual Leave (days)</Label>
              <Input
                type="number"
                min={0}
                value={settings.annual_leave_days}
                onChange={(e) => patch("annual_leave_days", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Sick Leave (days)</Label>
              <Input
                type="number"
                min={0}
                value={settings.sick_leave_days}
                onChange={(e) => patch("sick_leave_days", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Maternity Leave (days)</Label>
              <Input
                type="number"
                min={0}
                value={settings.maternity_leave_days}
                onChange={(e) => patch("maternity_leave_days", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Paternity Leave (days)</Label>
              <Input
                type="number"
                min={0}
                value={settings.paternity_leave_days}
                onChange={(e) => patch("paternity_leave_days", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Require Manager Approval</Label>
              <p className="text-xs text-muted-foreground">Leave requests require manager sign-off.</p>
            </div>
            <Switch
              checked={settings.require_manager_approval}
              onCheckedChange={(v) => patch("require_manager_approval", v)}
            />
          </div>
          <Separator />
          <Button onClick={() => saveSection("leave")} disabled={saving === "leave"}>
            {saving === "leave" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Leave Policy
          </Button>
        </CardContent>
      </Card>

      {/* Payroll Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Settings</CardTitle>
          <CardDescription>Configure payroll cycle and payment preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Payroll Cycle</Label>
            <Select value={settings.payroll_cycle} onValueChange={(v) => patch("payroll_cycle", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Payroll Processing Day</Label>
            <Input
              type="number"
              min={1}
              max={31}
              placeholder="Day of month"
              value={settings.payroll_processing_day}
              onChange={(e) => patch("payroll_processing_day", parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-process Payroll</Label>
              <p className="text-xs text-muted-foreground">Automatically process on the set date.</p>
            </div>
            <Switch
              checked={settings.auto_process_payroll}
              onCheckedChange={(v) => patch("auto_process_payroll", v)}
            />
          </div>
          <Separator />
          <Button onClick={() => saveSection("payroll")} disabled={saving === "payroll"}>
            {saving === "payroll" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Payroll Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure HR notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "notify_leave_request" as const,    label: "New leave request",   desc: "Notify HR when a leave request is submitted." },
            { key: "notify_job_application" as const,  label: "New job application", desc: "Notify HR when a candidate applies." },
            { key: "notify_payroll_processed" as const,label: "Payroll processed",   desc: "Notify when payroll run completes." },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label>{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={settings[key] as boolean}
                onCheckedChange={(v) => patch(key, v)}
              />
            </div>
          ))}
          <Separator />
          <Button onClick={() => saveSection("notifications")} disabled={saving === "notifications"}>
            {saving === "notifications" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
