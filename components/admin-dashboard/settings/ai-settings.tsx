"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function AISettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    openai_key: "",
    anthropic_key: "",
    model_preference: "gpt-4",
  });

  useEffect(() => {
    if (settings?.ai) {
      // eslint-disable-next-line
      setFormData(prev => ({ ...prev, ...settings.ai }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings("ai", formData);
      toast({ title: "Settings saved", description: "AI settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>Manage AI service provider keys and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="openai_key">OpenAI API Key</Label>
          <Input 
            id="openai_key" 
            type="password"
            value={formData.openai_key} 
            onChange={(e) => setFormData({...formData, openai_key: e.target.value})} 
            placeholder="sk-..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="anthropic_key">Anthropic API Key</Label>
          <Input 
            id="anthropic_key" 
            type="password"
            value={formData.anthropic_key} 
            onChange={(e) => setFormData({...formData, anthropic_key: e.target.value})} 
            placeholder="sk-ant-..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="model_preference">Default Model</Label>
          <Input 
            id="model_preference" 
            value={formData.model_preference} 
            onChange={(e) => setFormData({...formData, model_preference: e.target.value})} 
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
