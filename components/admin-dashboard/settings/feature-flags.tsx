"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function FeatureFlags() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Management</CardTitle>
          <CardDescription>Enable or disable platform features globally.</CardDescription>
        </CardHeader>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    );
  }
  return <FeatureFlagsInner isLoading={isLoading} updateSettings={updateSettings} features={settings.features ?? {}} />;
}

function FeatureFlagsInner({
  isLoading,
  updateSettings,
  features
}: {
  isLoading: boolean;
  updateSettings: (section: "features", data: unknown) => Promise<void>;
  features: Record<string, unknown>;
}) {
  const initialState: Record<string, boolean> = Object.fromEntries(
    Object.entries(features).map(([k, v]) => [k, !!v])
  );
  const [formData, setFormData] = useState<Record<string, boolean>>(initialState);

  useEffect(() => {
    setFormData(Object.fromEntries(Object.entries(features).map(([k, v]) => [k, !!v])));
  }, [features]);

  const handleSave = async () => {
    await updateSettings("features", formData);
  };

  const featuresList = [
    { key: 'eprescriptions', label: 'E-Prescriptions', description: 'Enable digital prescription management.' },
    { key: 'secure_documents', label: 'Secure Documents', description: 'Allow encrypted document sharing.' },
    { key: 'ai_chat', label: 'AI Chat Assistant', description: 'Enable AI-powered therapy assistant.' },
    { key: 'video_calls', label: 'Video Consultations', description: 'Enable HIPAA-compliant video calls.' },
    { key: 'gamification', label: 'Gamification', description: 'Enable achievements and progress tracking.' },
    { key: 'klump_gateway', label: 'Klump Payment Gateway', description: 'Enable Klump Buy Now Pay Later (PAYG) payment option.' },
    { key: 'ai_chat_hard_limit_short', label: 'AI Hard Limit: Short Window', description: 'Apply 3–5 day window before AI chat hard limit.' },
    { key: 'ai_chat_hard_limit_long', label: 'AI Hard Limit: Long Window', description: 'Apply 7–14 day window before AI chat hard limit.' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Management</CardTitle>
        <CardDescription>Enable or disable platform features globally.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {featuresList.map((feature) => (
          <div key={feature.key} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">{feature.label}</Label>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch 
              checked={formData[feature.key] || false}
              onCheckedChange={c => {
                const next = { ...formData, [feature.key]: c };
                if (feature.key === 'ai_chat_hard_limit_short' && c) {
                  next['ai_chat_hard_limit_long'] = false;
                }
                if (feature.key === 'ai_chat_hard_limit_long' && c) {
                  next['ai_chat_hard_limit_short'] = false;
                }
                setFormData(next);
              }}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={isLoading} className="mt-4">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Features
        </Button>
      </CardContent>
    </Card>
  );
}
