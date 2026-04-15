"use client";

import { useEffect, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, UsersRound, AlertCircle } from "lucide-react";
import { SESSION_MODES, ORG_MODES, INDIVIDUAL_MODES } from "@/lib/constants/groupSessionModes";

interface GroupSettingsForm {
  group_session_ready: boolean;
  enabled_session_modes: string[];
  group_session_bio: string;
}

export default function TherapistGroupSettingsPage() {
  const [form, setForm] = useState<GroupSettingsForm>({
    group_session_ready: false,
    enabled_session_modes: [],
    group_session_bio: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await therapistService.getProfile() as any;
        setForm({
          group_session_ready: data?.group_session_ready ?? false,
          enabled_session_modes: data?.enabled_session_modes ?? [],
          group_session_bio: data?.group_session_bio ?? "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const toggleMode = (modeId: string) => {
    setForm((prev) => ({
      ...prev,
      enabled_session_modes: prev.enabled_session_modes.includes(modeId)
        ? prev.enabled_session_modes.filter((m) => m !== modeId)
        : [...prev.enabled_session_modes, modeId],
    }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await therapistService.updateProfile(form as any);
      toast({ title: "Saved", description: "Group session settings updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <UsersRound className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Group Settings</h2>
      </div>

      {/* Availability toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Group Session Availability</CardTitle>
          <CardDescription>
            Let patients and organisations book group sessions with you.
            Turn this off to pause new group bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Accept group sessions</Label>
              <p className="text-xs text-muted-foreground">
                {form.group_session_ready
                  ? "You are visible to group session organisers."
                  : "You are hidden from group session bookings."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!form.group_session_ready && (
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
                  <AlertCircle size={10} className="mr-1" />
                  Not accepting
                </Badge>
              )}
              <Switch
                checked={form.group_session_ready}
                onCheckedChange={(v) => setForm((p) => ({ ...p, group_session_ready: v }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enabled session modes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Modes</CardTitle>
          <CardDescription>
            Choose which types of group sessions you offer. Organisers will only see modes you enable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Individual / Family
            </p>
            <div className="grid gap-3">
              {INDIVIDUAL_MODES.map((mode) => (
                <div key={mode.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mode.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.enabled_session_modes.includes(mode.id)}
                    onCheckedChange={() => toggleMode(mode.id)}
                    disabled={!form.group_session_ready}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Organisational
            </p>
            <div className="grid gap-3">
              {ORG_MODES.map((mode) => (
                <div key={mode.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mode.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.enabled_session_modes.includes(mode.id)}
                    onCheckedChange={() => toggleMode(mode.id)}
                    disabled={!form.group_session_ready}
                  />
                </div>
              ))}
            </div>
          </div>

          {!form.group_session_ready && (
            <p className="text-xs text-muted-foreground">
              Enable group sessions above to configure modes.
            </p>
          )}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <Loader2 size={14} className="mr-2 animate-spin" />
        ) : (
          <Save size={14} className="mr-2" />
        )}
        Save Settings
      </Button>
    </div>
  );
}
