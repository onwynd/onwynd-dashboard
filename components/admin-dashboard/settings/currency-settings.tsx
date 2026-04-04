"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function CurrencySettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    default_currency: "USD",
    exchange_rate_eur: "0.85",
    exchange_rate_gbp: "0.73",
  });

  useEffect(() => {
    if (settings?.currency) {
      // eslint-disable-next-line
      setFormData(prev => ({ ...prev, ...settings.currency }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings("currency", formData);
      toast({ title: "Settings saved", description: "Currency settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>Manage default currency and exchange rates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="default_currency">Default Currency</Label>
          <Input 
            id="default_currency" 
            value={formData.default_currency} 
            onChange={(e) => setFormData({...formData, default_currency: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exchange_rate_eur">Exchange Rate (USD to EUR)</Label>
          <Input 
            id="exchange_rate_eur" 
            value={formData.exchange_rate_eur} 
            onChange={(e) => setFormData({...formData, exchange_rate_eur: e.target.value})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exchange_rate_gbp">Exchange Rate (USD to GBP)</Label>
          <Input 
            id="exchange_rate_gbp" 
            value={formData.exchange_rate_gbp} 
            onChange={(e) => setFormData({...formData, exchange_rate_gbp: e.target.value})} 
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
