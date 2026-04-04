"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function EnvSettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings?.env) {
      // eslint-disable-next-line
      setFormData(settings.env as Record<string, string>);
    } else {
      // Default structure if empty
      setFormData({
        paystackPublicKey: "",
        paystackSecretKey: "",
        flutterwavePublicKey: "",
        flutterwaveSecretKey: "",
        stripePublicKey: "",
        stripeSecretKey: "",
        sentryDsn: "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings("env", formData);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderKeyInput = (label: string, key: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input 
          type={showKeys[key] ? "text" : "password"}
          value={formData[key] || ""} 
          onChange={e => setFormData({...formData, [key]: e.target.value})}
          className="pr-10"
          placeholder={(settings?.env as Record<string, string>)?.[key] ? "********" : "Enter key"}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => toggleShowKey(key)}
        >
          {showKeys[key] ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );

  if (!settings && !isLoading) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Manage API keys for payment providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Paystack</h3>
              {renderKeyInput("Public Key", "paystackPublicKey")}
              {renderKeyInput("Secret Key", "paystackSecretKey")}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Flutterwave</h3>
              {renderKeyInput("Public Key", "flutterwavePublicKey")}
              {renderKeyInput("Secret Key", "flutterwaveSecretKey")}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Stripe</h3>
              {renderKeyInput("Public Key", "stripePublicKey")}
              {renderKeyInput("Secret Key", "stripeSecretKey")}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Klump (PAYG)</h3>
              {renderKeyInput("Public Key", "klumpPublicKey")}
              {renderKeyInput("Secret Key", "klumpSecretKey")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring & Services</CardTitle>
          <CardDescription>Configuration for external services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderKeyInput("Sentry DSN", "sentryDsn")}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Environment Settings
        </Button>
      </div>
    </div>
  );
}
