"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function PaymentSettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState<Record<string, string>>(
    (settings?.env as Record<string, string>) || {}
  );

  useEffect(() => {
    setFormData((settings?.env as Record<string, string>) || {});
  }, [settings]);

  const handleSave = async () => {
    await updateSettings("env", formData);
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Integration Keys</CardTitle>
        <CardDescription>Manage API keys for payment gateways and external services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Paystack Public Key</Label>
          <Input 
            type="password"
            value={formData.paystackPublicKey || ""} 
            onChange={e => setFormData({...formData, paystackPublicKey: e.target.value})} 
            placeholder="pk_..."
          />
        </div>
        <div className="space-y-2">
          <Label>Paystack Secret Key</Label>
          <Input 
            type="password"
            value={formData.paystackSecretKey || ""} 
            onChange={e => setFormData({...formData, paystackSecretKey: e.target.value})} 
            placeholder="sk_..."
          />
        </div>
        <div className="space-y-2">
          <Label>Flutterwave Public Key</Label>
          <Input 
            type="password"
            value={formData.flutterwavePublicKey || ""} 
            onChange={e => setFormData({...formData, flutterwavePublicKey: e.target.value})} 
            placeholder="FLWPUBK-..."
          />
        </div>
        <div className="space-y-2">
          <Label>Flutterwave Secret Key</Label>
          <Input 
            type="password"
            value={formData.flutterwaveSecretKey || ""} 
            onChange={e => setFormData({...formData, flutterwaveSecretKey: e.target.value})} 
            placeholder="FLWSECK-..."
          />
        </div>
        <div className="space-y-2">
          <Label>Stripe Public Key</Label>
          <Input 
            type="password"
            value={formData.stripePublicKey || ""} 
            onChange={e => setFormData({...formData, stripePublicKey: e.target.value})} 
            placeholder="pk_test_..."
          />
        </div>
        <div className="space-y-2">
          <Label>Stripe Secret Key</Label>
          <Input 
            type="password"
            value={formData.stripeSecretKey || ""} 
            onChange={e => setFormData({...formData, stripeSecretKey: e.target.value})} 
            placeholder="sk_test_..."
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Payment Settings
        </Button>
      </CardContent>
    </Card>
  );
}
