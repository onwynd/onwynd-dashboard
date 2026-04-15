"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import client from "@/lib/api/client";

interface SupportSettings {
  sla_high_hours: number;
  sla_medium_hours: number;
  sla_low_hours: number;
  default_priority: string;
  auto_assign: boolean;
  ai_first: boolean;
  email_notify: boolean;
  closed_message: string;
}

const DEFAULTS: SupportSettings = {
  sla_high_hours: 4,
  sla_medium_hours: 8,
  sla_low_hours: 24,
  default_priority: "medium",
  auto_assign: true,
  ai_first: true,
  email_notify: true,
  closed_message: "Your support ticket has been resolved. If you need further assistance, please open a new ticket.",
};

export default function SupportSettingsPage() {
  const [s, setS] = useState<SupportSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await client.get("/api/v1/admin/settings");
      const support = res.data?.support;
      if (support) {
        setS((prev) => ({ ...prev, ...support }));
      }
    } catch {
      // Keep defaults/UI state if load fails
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const patch = (key: keyof SupportSettings, value: unknown) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await client.put("/api/v1/admin/settings/support", s);
      const saved = res.data?.data;
      if (saved && typeof saved === "object") {
        setS((prev) => ({ ...prev, ...(saved as Partial<SupportSettings>) }));
      } else {
        await loadSettings();
      }
      toast({ title: "Saved", description: "Support settings updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure support portal behaviour and notifications.</p>
      </div>

      {/* SLA Targets */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Targets</CardTitle>
          <CardDescription>Maximum response time (hours) per priority level.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>High Priority (hrs)</Label>
              <Input type="number" min="1" value={s.sla_high_hours}
                onChange={(e) => patch("sla_high_hours", parseInt(e.target.value) || 4)} />
            </div>
            <div className="space-y-1">
              <Label>Medium Priority (hrs)</Label>
              <Input type="number" min="1" value={s.sla_medium_hours}
                onChange={(e) => patch("sla_medium_hours", parseInt(e.target.value) || 8)} />
            </div>
            <div className="space-y-1">
              <Label>Low Priority (hrs)</Label>
              <Input type="number" min="1" value={s.sla_low_hours}
                onChange={(e) => patch("sla_low_hours", parseInt(e.target.value) || 24)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Defaults */}
      <Card>
        <CardHeader><CardTitle>Ticket Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Default Priority</Label>
            <Select value={s.default_priority} onValueChange={(v) => v && patch("default_priority", v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Auto-Close Message</Label>
            <Textarea rows={3} value={s.closed_message}
              onChange={(e) => patch("closed_message", e.target.value)} />
            <p className="text-xs text-muted-foreground">Sent to the customer when a ticket is resolved.</p>
          </div>
        </CardContent>
      </Card>

      {/* Behaviour */}
      <Card>
        <CardHeader><CardTitle>Behaviour</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-assign tickets</p>
              <p className="text-xs text-muted-foreground">Round-robin assignment to available agents.</p>
            </div>
            <Switch checked={s.auto_assign} onCheckedChange={(v) => patch("auto_assign", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">AI-first responses</p>
              <p className="text-xs text-muted-foreground">Let the AI attempt to resolve tickets before routing to an agent.</p>
            </div>
            <Switch checked={s.ai_first} onCheckedChange={(v) => patch("ai_first", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email on new ticket</p>
              <p className="text-xs text-muted-foreground">Send agent an email when a new ticket is assigned.</p>
            </div>
            <Switch checked={s.email_notify} onCheckedChange={(v) => patch("email_notify", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
