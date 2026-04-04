"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettingsStore } from "@/store/settings-store";
import { Loader2, Save, Mail, ShieldAlert, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import client from "@/lib/api/client";

export function MailSettings() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState<any>(settings?.mail || {
    mail_provider: 'zoho_imap',
    mail_imap_host: 'imap.zoho.com',
    mail_imap_port: 993,
    mail_imap_username: '',
    mail_imap_password: '',
    mail_aapanel_host: '127.0.0.1',
    mail_aapanel_port: 993,
    mail_aapanel_username: '',
    mail_aapanel_password: '',
    mail_google_account: '',
    mail_google_client_id: '',
    mail_google_client_secret: '',
    mail_google_refresh_token: '',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (settings?.mail) {
      setFormData(settings.mail);
    }
  }, [settings]);

  const handleSave = async () => {
    if (testStatus !== 'success') {
      toast({ 
        title: "Connection test required", 
        description: "Please test the connection successfully before saving.", 
        variant: "destructive" 
      });
      return;
    }
    await updateSettings("mail", formData);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage("");
    try {
      const response = await client.post('/api/v1/admin/mail/test-connection', formData);
      if (response.data.success) {
        setTestStatus('success');
        setTestMessage(response.data.message);
      } else {
        setTestStatus('failed');
        setTestMessage(response.data.message);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(err.response?.data?.message || err.message || "Connection failed");
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setTestStatus('idle'); // Reset test status on change
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Mail Provider
          </CardTitle>
          <CardDescription>
            Select and configure the mail provider for the embedded webmail interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Active Provider</Label>
            <RadioGroup 
              value={formData.mail_provider} 
              onValueChange={(val) => updateField('mail_provider', val)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="zoho_imap" id="zoho" className="peer sr-only" />
                <Label
                  htmlFor="zoho"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-semibold">Zoho Mail (IMAP)</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="gmail" id="gmail" className="peer sr-only" />
                <Label
                  htmlFor="gmail"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-semibold">Google Workspace / Gmail</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="aapanel" id="aapanel" className="peer sr-only" />
                <Label
                  htmlFor="aapanel"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-semibold">aaPanel Self-Hosted</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium">Connection Settings</h3>
            
            {formData.mail_provider === 'zoho_imap' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zoho_host">IMAP Host</Label>
                  <Input 
                    id="zoho_host" 
                    value={formData.mail_imap_host} 
                    onChange={(e) => updateField('mail_imap_host', e.target.value)}
                    placeholder="imap.zoho.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoho_port">IMAP Port</Label>
                  <Input 
                    id="zoho_port" 
                    type="number" 
                    value={formData.mail_imap_port} 
                    onChange={(e) => updateField('mail_imap_port', parseInt(e.target.value))}
                    placeholder="993" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoho_user">Username</Label>
                  <Input 
                    id="zoho_user" 
                    value={formData.mail_imap_username} 
                    onChange={(e) => updateField('mail_imap_username', e.target.value)}
                    placeholder="hello@onwynd.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoho_pass">App Password</Label>
                  <Input 
                    id="zoho_pass" 
                    type="password" 
                    value={formData.mail_imap_password} 
                    onChange={(e) => updateField('mail_imap_password', e.target.value)}
                    placeholder="••••••••••••••••" 
                  />
                </div>
                <div className="col-span-2 flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Zoho IMAP requires Mail Lite or higher plan.</p>
                    <p className="opacity-90">Free plan does not support IMAP. Ensure you use an App Password, not your account password.</p>
                  </div>
                </div>
              </div>
            )}

            {formData.mail_provider === 'gmail' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gmail_id">Client ID</Label>
                  <Input 
                    id="gmail_id" 
                    value={formData.mail_google_client_id} 
                    onChange={(e) => updateField('mail_google_client_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmail_secret">Client Secret</Label>
                  <Input 
                    id="gmail_secret" 
                    type="password" 
                    value={formData.mail_google_client_secret} 
                    onChange={(e) => updateField('mail_google_client_secret', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmail_token">Refresh Token</Label>
                  <Input 
                    id="gmail_token" 
                    type="password" 
                    value={formData.mail_google_refresh_token} 
                    onChange={(e) => updateField('mail_google_refresh_token', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmail_account">Mail Account</Label>
                  <Input 
                    id="gmail_account" 
                    value={formData.mail_google_account} 
                    onChange={(e) => updateField('mail_google_account', e.target.value)}
                    placeholder="hello@onwynd.com"
                  />
                </div>
                <div className="col-span-2 flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">How to get these credentials:</p>
                    <ol className="list-decimal ml-4 mt-1 space-y-1 opacity-90">
                      <li>Go to console.cloud.google.com</li>
                      <li>Create a project & Enable Gmail API</li>
                      <li>Create OAuth2 credentials</li>
                      <li>Generate refresh token for your account</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {formData.mail_provider === 'aapanel' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aa_host">IMAP Host</Label>
                  <Input 
                    id="aa_host" 
                    value={formData.mail_aapanel_host} 
                    onChange={(e) => updateField('mail_aapanel_host', e.target.value)}
                    placeholder="127.0.0.1" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aa_port">IMAP Port</Label>
                  <Input 
                    id="aa_port" 
                    type="number" 
                    value={formData.mail_aapanel_port} 
                    onChange={(e) => updateField('mail_aapanel_port', parseInt(e.target.value))}
                    placeholder="993" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aa_user">Username</Label>
                  <Input 
                    id="aa_user" 
                    value={formData.mail_aapanel_username} 
                    onChange={(e) => updateField('mail_aapanel_username', e.target.value)}
                    placeholder="hello@onwynd.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aa_pass">Password</Label>
                  <Input 
                    id="aa_pass" 
                    type="password" 
                    value={formData.mail_aapanel_password} 
                    onChange={(e) => updateField('mail_aapanel_password', e.target.value)}
                    placeholder="••••••••••••••••" 
                  />
                </div>
                <div className="col-span-2 flex items-start gap-2 p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 text-sm">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Ensure aaPanel Mail Server module is installed and the mailbox exists.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={handleTestConnection} 
              disabled={testStatus === 'testing'}
              className="gap-2"
            >
              {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
              Test Connection
            </Button>
            
            {testStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" />
                ✓ Connected to {formData.mail_provider.replace('_imap', '').toUpperCase()}
              </div>
            )}
            
            {testStatus === 'failed' && (
              <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-4 h-4" />
                ✗ {testMessage}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <p className="text-xs text-muted-foreground">
            Changes take effect immediately after saving. Always test connection first.
          </p>
          <Button onClick={handleSave} disabled={isLoading || testStatus !== 'success'} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
