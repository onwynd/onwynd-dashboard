"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import { Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { SubscriptionSettings } from "@/components/admin-dashboard/settings/subscription-settings";
import { MailSettings } from "@/components/admin-dashboard/settings/mail-settings";
import { IPProtectionSettings } from "@/components/admin-dashboard/settings/ip-protection-settings";
import { IPProtectionLogs } from "@/components/admin-dashboard/ip-protection-logs";
import { BrandingSettings } from "@/components/admin-dashboard/settings/branding-settings";
import type { AppSettings } from "@/lib/api/settings";
import client from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";

interface PayoutSetting {
  id: number;
  role: string;
  payout_day: number;
  minimum_amount_kobo: number;
  currency: string;
  provider: string;
  auto_process: boolean;
}

function SettingsContent() {
  const { settings, isLoading, fetchSettings, updateSettings, fetchPlans, quotaDefaults, quotaOverview, fetchQuotaDefaults, updateQuotaDefaults, fetchQuotaOverview, deviceFingerprints, fetchDeviceFingerprints } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(settings);
  const [localQuotas, setLocalQuotas] = useState(quotaDefaults);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = (searchParams.get("tab") ?? "").toLowerCase();
  const availableTabs = ["general", "financial", "subscriptions", "features", "ai", "security", "env", "quotas", "navigation", "commission", "documents", "mail", "sms", "protection", "branding", "payouts", "geo", "gateways"];
  const initialTab = availableTabs.includes(tabParam) ? tabParam : "general";

  const [userRole, setUserRole] = useState<'admin' | 'ceo' | 'coo'>('admin');

  // SMS + WhatsApp settings state
  const [smsSettings, setSmsSettings] = useState({
    sms_enabled: true,
    termii_api_key: '',
    termii_sender_id: 'ONWYND',
    otp_expiry_mins: 10,
    otp_length: 6,
    event_otp: true,
    event_session_reminder: true,
    event_appointment: true,
    event_group_reminder: false,
    event_payment_confirmation: false,
    whatsapp_enabled: false,
    whatsapp_provider: 'qr' as 'qr' | 'meta' | 'termii',
    whatsapp_phone_number_id: '',
    meta_wa_phone_number_id: '',
    meta_wa_access_token: '',
    wa_event_session_reminder: false,
    wa_event_appointment: false,
    wa_event_group_reminder: false,
    wa_event_payment_confirmation: false,
  });

  // WhatsApp QR/status state
  const [waStatus, setWaStatus] = useState<{
    status?: string; phone?: string; pushName?: string; hasQr?: boolean;
    qr_status?: string; qr_hint?: string;
    termii_configured?: boolean;
    connected?: boolean; display_name?: string; quality?: string;
    phone_number_id_set?: boolean; access_token_set?: boolean; reason?: string;
  } | null>(null);
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);

  const fetchWaStatus = async () => {
    setWaLoading(true);
    try {
      const res = await client.get('/api/v1/admin/whatsapp/status');
      setWaStatus(res.data?.data ?? null);
    } catch { /* silent */ } finally { setWaLoading(false); }
  };

  const fetchWaQr = async () => {
    try {
      const res = await client.get('/api/v1/admin/whatsapp/qr');
      setWaQr(res.data?.data?.qr ?? null);
    } catch { setWaQr(null); }
  };

  const handleWaDisconnect = async () => {
    try {
      await client.post('/api/v1/admin/whatsapp/disconnect');
      toast({ title: 'WhatsApp disconnected' });
      fetchWaStatus();
      setWaQr(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to disconnect', variant: 'destructive' });
    }
  };
  const [smsTemplates, setSmsTemplates] = useState({
    otp:                  "Your {app_name} verification code is {code}. Valid for {expiry_mins} minutes. Do not share this code.",
    session_reminder:     "Hi {name}, reminder: therapy session with {therapist_name} at {session_time}. Log in via {app_name}.",
    appointment:          "Hi {name}, appointment with {therapist_name} confirmed for {date} at {time}. — {app_name}.",
    group_reminder:       "Hi {name}, group session \"{session_title}\" starts at {time}. Join via {app_name} dashboard.",
    payment_confirmation: "Hi {name}, payment of {amount} {currency} for {plan_name} was successful. — {app_name}.",
  });
  const [smsTemplatesSaving, setSmsTemplatesSaving] = useState(false);
  const [smsSaving, setSmsSaving] = useState(false);

  const handleSaveSms = async () => {
    setSmsSaving(true);
    try {
      await client.put('/api/v1/admin/settings/sms', smsSettings);
      toast({ title: 'SMS settings saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save SMS settings', variant: 'destructive' });
    } finally {
      setSmsSaving(false);
    }
  };

  const handleSaveSmsTemplates = async () => {
    setSmsTemplatesSaving(true);
    try {
      await client.put('/api/v1/admin/settings/sms_templates', smsTemplates);
      toast({ title: 'SMS templates saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save SMS templates', variant: 'destructive' });
    } finally {
      setSmsTemplatesSaving(false);
    }
  };

  // Gateway settings state — flat key/value map: {name}_enabled, {name}_mode, {name}_{mode}_key…
  type GatewaySettings = Record<string, boolean | string>;
  type GatewayId = 'paystack' | 'flutterwave' | 'klump' | 'stripe' | 'dodopayments';
  type LiveValidationState = 'idle' | 'valid' | 'invalid';
  const buildDefaultGateways = (): GatewaySettings => {
    const out: GatewaySettings = {};
    const defaultsOn = ['paystack', 'dodopayments'];
    for (const gw of ['paystack', 'flutterwave', 'klump', 'stripe', 'dodopayments']) {
      out[`${gw}_enabled`]         = defaultsOn.includes(gw);
      out[`${gw}_mode`]            = 'test';
      out[`${gw}_test_public_key`] = '';
      out[`${gw}_test_secret_key`] = '';
      out[`${gw}_live_public_key`] = '';
      out[`${gw}_live_secret_key`] = '';
    }
    return out;
  };
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>(buildDefaultGateways());
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gatewayLiveValidation, setGatewayLiveValidation] = useState<Record<GatewayId, LiveValidationState>>({
    paystack: 'idle',
    flutterwave: 'idle',
    klump: 'idle',
    stripe: 'idle',
    dodopayments: 'idle',
  });
  const [gatewayLiveValidationMessage, setGatewayLiveValidationMessage] = useState<Record<GatewayId, string>>({
    paystack: '',
    flutterwave: '',
    klump: '',
    stripe: '',
    dodopayments: '',
  });

  const getGatewayLiveValidationError = useCallback((id: GatewayId, state: GatewaySettings): string | null => {
    const livePublic = String(state[`${id}_live_public_key`] ?? '').trim();
    const liveSecret = String(state[`${id}_live_secret_key`] ?? '').trim();

    if (!livePublic || !liveSecret) {
      return 'Live public and secret keys are required.';
    }

    if (id === 'paystack') {
      if (!livePublic.startsWith('pk_live_') || !liveSecret.startsWith('sk_live_')) {
        return 'Paystack live keys must start with pk_live_ and sk_live_.';
      }
    }

    if (id === 'stripe') {
      if (!livePublic.startsWith('pk_live_') || !liveSecret.startsWith('sk_live_')) {
        return 'Stripe live keys must start with pk_live_ and sk_live_.';
      }
    }

    if (id === 'flutterwave') {
      const pubOk = livePublic.toUpperCase().startsWith('FLWPUBK_LIVE');
      const secOk = liveSecret.toUpperCase().startsWith('FLWSECK_LIVE');
      if (!pubOk || !secOk) {
        return 'Flutterwave live keys must start with FLWPUBK_LIVE and FLWSECK_LIVE.';
      }
    }

    return null;
  }, []);

  const validateLiveGateway = useCallback((id: GatewayId, state: GatewaySettings) => {
    const error = getGatewayLiveValidationError(id, state);
    if (error) {
      setGatewayLiveValidation((prev) => ({ ...prev, [id]: 'invalid' }));
      setGatewayLiveValidationMessage((prev) => ({ ...prev, [id]: error }));
      return false;
    }

    setGatewayLiveValidation((prev) => ({ ...prev, [id]: 'valid' }));
    setGatewayLiveValidationMessage((prev) => ({ ...prev, [id]: 'Live keys validated.' }));
    return true;
  }, [getGatewayLiveValidationError]);

  // Geo settings state
  const [geoSettings, setGeoSettings] = useState({
    auto_detect: true,
    regional_testimonials: true,
    regional_pricing: true,
    regional_phone: true,
    regional_payment_gateway: true,
    international_gateway: "dodopayments" as "dodopayments" | "stripe" | "flutterwave",
    stripe_paused: true,
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSaving, setGeoSaving] = useState(false);

  // Payout settings state
  const [payoutSettings, setPayoutSettings] = useState<PayoutSetting[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [savingPayout, setSavingPayout] = useState<string | null>(null);

  const fetchPayoutSettings = useCallback(async () => {
    setPayoutLoading(true);
    try {
      const res = await client.get("/api/v1/admin/payout-settings");
      const d = res.data?.data ?? res.data;
      setPayoutSettings(Array.isArray(d) ? d : []);
    } catch {
      toast({ title: "Error", description: "Failed to load payout settings", variant: "destructive" });
    } finally {
      setPayoutLoading(false);
    }
  }, []);

  const savePayoutSetting = async (setting: PayoutSetting) => {
    setSavingPayout(setting.role);
    try {
      await client.patch(`/api/v1/admin/payout-settings/${setting.role}`, setting);
      toast({ title: "Saved", description: `Payout settings for ${setting.role} updated.` });
    } catch {
      toast({ title: "Error", description: "Failed to save payout setting", variant: "destructive" });
    } finally {
      setSavingPayout(null);
    }
  };

  const updatePayoutField = (role: string, field: keyof PayoutSetting, value: unknown) => {
    setPayoutSettings((prev: PayoutSetting[]) => prev.map((s: PayoutSetting) => s.role === role ? { ...s, [field]: value } : s));
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role?.slug || user.role || 'admin';
        setUserRole(role);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchPlans();
    fetchQuotaDefaults();
    fetchQuotaOverview();
    fetchDeviceFingerprints();
    fetchPayoutSettings();
  }, [fetchSettings, fetchPlans, fetchQuotaDefaults, fetchQuotaOverview, fetchDeviceFingerprints, fetchPayoutSettings]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setLocalQuotas(quotaDefaults);
  }, [quotaDefaults]);

  // Gateway + SMS settings fetch
  useEffect(() => {
    setGatewayLoading(true);
    client.get("/api/v1/admin/settings")
      .then((res) => {
        const d = res.data?.data ?? res.data ?? {};
        const gw = d.gateways ?? {};
        if (Object.keys(gw).length) setGatewaySettings((prev) => ({ ...prev, ...gw }));
        const sms = d.sms ?? {};
        if (Object.keys(sms).length) setSmsSettings((prev) => ({ ...prev, ...sms }));
        const tmpl = d.sms_templates ?? {};
        if (Object.keys(tmpl).length) setSmsTemplates((prev) => ({ ...prev, ...tmpl }));
      })
      .catch(() => {})
      .finally(() => setGatewayLoading(false));
  }, []);

  const handleSaveGateways = async () => {
    setGatewaySaving(true);
    try {
      for (const id of ['paystack', 'flutterwave', 'klump', 'stripe', 'dodopayments'] as GatewayId[]) {
        const enabled = Boolean(gatewaySettings[`${id}_enabled`]);
        const mode = (gatewaySettings[`${id}_mode`] ?? 'test') as 'test' | 'live';
        if (enabled && mode === 'live' && !validateLiveGateway(id, gatewaySettings)) {
          toast({
            title: "Live validation required",
            description: `${id} must pass live key validation before saving in LIVE mode.`,
            variant: "destructive",
          });
          setGatewaySaving(false);
          return;
        }
      }

      await client.put("/api/v1/admin/settings/gateways", gatewaySettings);
      toast({ title: "Gateway settings saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save gateway settings", variant: "destructive" });
    } finally {
      setGatewaySaving(false);
    }
  };

  // Geo settings fetch + save
  useEffect(() => {
    setGeoLoading(true);
    client.get("/api/v1/config")
      .then((res) => {
        const geo = res.data?.data?.geo ?? res.data?.geo ?? {};
        if (Object.keys(geo).length) setGeoSettings((prev) => ({ ...prev, ...geo }));
      })
      .catch(() => {})
      .finally(() => setGeoLoading(false));
  }, []);

  const handleSaveGeo = async () => {
    setGeoSaving(true);
    try {
      await client.put("/api/v1/admin/settings/geo", geoSettings);
      toast({ title: "Geo settings saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save geo settings", variant: "destructive" });
    } finally {
      setGeoSaving(false);
    }
  };

  const handleSaveQuotas = async () => {
    if (!localQuotas) return;
    await updateQuotaDefaults(localQuotas);
  };

  const updateLocalQuota = (key: string, value: number) => {
    setLocalQuotas((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async (section: keyof AppSettings) => {
    if (!localSettings) return;
    await updateSettings(section, localSettings[section]);
  };

  const updateLocal = (section: string, key: string, value: unknown) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;

      return ({
      ...prev,
      [section]: {
        ...((prev as unknown as Record<string, unknown>)[section] as Record<string, unknown>),
        [key]: value
      }
      });
    });
  };

  if (!localSettings) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage application configuration.</p>
      </div>

      <Tabs defaultValue={initialTab} className="w-full" onValueChange={(val) => router.replace(`/admin/settings?tab=${val}`)}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent border-none">
          <TabsTrigger value="general" className="data-[state=active]:bg-muted">General</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-muted">Financial</TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-muted">Plans</TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-muted">Features</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-muted">AI</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-muted">Security</TabsTrigger>
          <TabsTrigger value="env" className="data-[state=active]:bg-muted">Keys</TabsTrigger>
          <TabsTrigger value="quotas" className="data-[state=active]:bg-muted">Quotas</TabsTrigger>
          <TabsTrigger value="navigation" className="data-[state=active]:bg-muted">Navigation</TabsTrigger>
          <TabsTrigger value="commission" className="data-[state=active]:bg-muted">Commission</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-muted">Documents</TabsTrigger>
          <TabsTrigger value="mail" className="data-[state=active]:bg-muted">Mail</TabsTrigger>
          <TabsTrigger value="protection" className="data-[state=active]:bg-muted">IP Protection</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-muted">Branding</TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-muted">Payouts</TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-muted">SMS</TabsTrigger>
          <TabsTrigger value="geo" className="data-[state=active]:bg-muted">Geo & Localization</TabsTrigger>
          <TabsTrigger value="gateways" className="data-[state=active]:bg-muted">Gateways</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic application information and defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={localSettings.general.siteName} 
                  onChange={(e) => updateLocal('general', 'siteName', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email" 
                  value={localSettings.general.supportEmail} 
                  onChange={(e) => updateLocal('general', 'supportEmail', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Select 
                  value={localSettings.general.baseCurrency} 
                  onValueChange={(val) => updateLocal('general', 'baseCurrency', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">Disable access for non-admins</div>
                </div>
                <Switch 
                  checked={localSettings.general.maintenanceMode} 
                  onCheckedChange={(checked) => updateLocal('general', 'maintenanceMode', checked)} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('general')} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Financial Settings — DB3 */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Commission rates, platform fees, and payout thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Therapist Commission Rate (%)</Label>
                <div className="text-sm text-muted-foreground">Percentage of each session fee retained by the platform.</div>
                <Input
                  id="commissionRate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={Number((localSettings.financial as Record<string, unknown> | undefined)?.commission_rate ?? 20)}
                  onChange={(e) => updateLocal('financial', 'commission_rate', parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingFee">Platform Booking Fee ({localSettings.general.baseCurrency})</Label>
                <div className="text-sm text-muted-foreground">Flat fee charged per booking transaction.</div>
                <Input
                  id="bookingFee"
                  type="number"
                  min={0}
                  step={100}
                  value={Number((localSettings.financial as Record<string, unknown> | undefined)?.platform_booking_fee ?? 0)}
                  onChange={(e) => updateLocal('financial', 'platform_booking_fee', parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPayout">Minimum Payout Amount ({localSettings.general.baseCurrency})</Label>
                <div className="text-sm text-muted-foreground">Minimum balance a therapist must have before requesting a payout.</div>
                <Input
                  id="minPayout"
                  type="number"
                  min={0}
                  step={500}
                  value={Number((localSettings.financial as Record<string, unknown> | undefined)?.minimum_payout_amount ?? 5000)}
                  onChange={(e) => updateLocal('financial', 'minimum_payout_amount', parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <div className="text-sm text-muted-foreground">
                  Applied to (session fee + platform fee) at checkout. Set to 0 to disable VAT.
                </div>
                <Input
                  id="vatRate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={Number((localSettings.financial as Record<string, unknown> | undefined)?.vat_rate ?? 0)}
                  onChange={(e) => updateLocal('financial', 'vat_rate', parseFloat(e.target.value || '0'))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('financial' as keyof AppSettings)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Financial Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Subscription Plans */}
        <TabsContent value="subscriptions">
          <SubscriptionSettings />
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable system features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">AI Companion Hard-Limit Windows</Label>
                  <div className="text-sm text-muted-foreground">Apply hard-limit windows to AI companion usage</div>
                </div>
                <Switch
                  checked={Boolean((localSettings.features as Record<string, unknown>)?.['ai_companion_hard_limit_windows'])}
                  onCheckedChange={(checked) => updateLocal('features', 'ai_companion_hard_limit_windows', checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">AI Companion Hard-Limit Window Duration (days)</Label>
                  <div className="text-sm text-muted-foreground">Number of days for the window</div>
                </div>
                <Input
                  type="number"
                  value={Number((localSettings.features as Record<string, unknown>)?.['ai_companion_hard_limit_duration'] ?? 0)}
                  onChange={(e) => updateLocal('features', 'ai_companion_hard_limit_duration', parseInt(e.target.value || '0', 10))}
                  className="w-24"
                />
              </div>
              {Object.entries(localSettings.features)
                .filter(([key]) => key !== 'ai_companion_hard_limit_windows' && key !== 'ai_companion_hard_limit_duration')
                .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base capitalize">{key.replace(/_/g, ' ')}</Label>
                  </div>
                  <Switch 
                    checked={value as boolean} 
                    onCheckedChange={(checked) => updateLocal('features', key, checked)} 
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('features')} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Manage AI models and API keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Default Model</Label>
                <Select 
                  value={localSettings.ai.model} 
                  onValueChange={(val) => updateLocal('ai', 'model', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <Input 
                  id="openaiKey" 
                  type="password"
                  value={localSettings.ai.openaiKey} 
                  onChange={(e) => updateLocal('ai', 'openaiKey', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anthropicKey">Anthropic API Key</Label>
                <Input 
                  id="anthropicKey" 
                  type="password"
                  value={localSettings.ai.anthropicKey} 
                  onChange={(e) => updateLocal('ai', 'anthropicKey', e.target.value)} 
                />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Live AI Features</Label>
                  <div className="text-sm text-muted-foreground">Enable real-time AI processing</div>
                </div>
                <Switch 
                  checked={localSettings.ai.isLive} 
                  onCheckedChange={(checked) => updateLocal('ai', 'isLive', checked)} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('ai')} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Password policies and session management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Select 
                  value={localSettings.security.passwordPolicy} 
                  onValueChange={(val) => updateLocal('security', 'passwordPolicy', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (8+ chars)</SelectItem>
                    <SelectItem value="strong">Strong (Symbols, Numbers, Mixed Case)</SelectItem>
                    <SelectItem value="strict">Strict (12+ chars, rotating)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number"
                  value={localSettings.security.sessionTimeout} 
                  onChange={(e) => updateLocal('security', 'sessionTimeout', parseInt(e.target.value))} 
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Enforce MFA</Label>
                  <div className="text-sm text-muted-foreground">Require Multi-Factor Authentication for all admins</div>
                </div>
                <Switch 
                  checked={localSettings.security.mfaEnabled} 
                  onCheckedChange={(checked) => updateLocal('security', 'mfaEnabled', checked)} 
                />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold">Device Fingerprints</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor known devices per user to flag unusual access patterns.
                </p>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Device Activity</CardTitle>
                    <CardDescription>
                      {deviceFingerprints
                        ? `${deviceFingerprints.summary.total_users} users • ${deviceFingerprints.summary.multi_device_users} with multiple devices`
                        : "Loading device data"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!deviceFingerprints ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : deviceFingerprints.devices.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No device fingerprints in the last 30 days.</div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Devices</TableHead>
                              <TableHead>Fingerprints</TableHead>
                              <TableHead>Last Active</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deviceFingerprints.devices.map((row) => (
                              <TableRow key={row.user_id}>
                                <TableCell className="font-medium">{row.name || `User #${row.user_id}`}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.role || "-"}</TableCell>
                                <TableCell>{row.device_count}</TableCell>
                                <TableCell className="space-x-1">
                                  {row.fingerprints.map((fp, idx) => (
                                    <Badge key={`${row.user_id}-${idx}`} variant="outline">{fp}</Badge>
                                  ))}
                                </TableCell>
                                <TableCell>{row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : "-"}</TableCell>
                                <TableCell>
                                  <Badge variant={row.online ? "secondary" : "outline"}>
                                    {row.online ? "Online" : "Offline"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('security')} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Keys / Env */}
        <TabsContent value="env">
          <Card>
            <CardHeader>
              <CardTitle>API Keys & Environment Variables</CardTitle>
              <CardDescription>Manage third-party service credentials. Values are masked.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800 mb-2">
                Payment gateway keys (Paystack, Flutterwave, Klump, Stripe, DodoPayments) are managed in the <strong>Gateways</strong> tab with full test/live mode support.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="klumpPublicKey">Klump Public Key <span className="text-xs text-muted-foreground">(legacy env override)</span></Label>
                  <Input
                    id="klumpPublicKey"
                    value={localSettings.env.klumpPublicKey}
                    onChange={(e) => updateLocal('env', 'klumpPublicKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="klumpSecretKey">Klump Secret Key <span className="text-xs text-muted-foreground">(legacy env override)</span></Label>
                  <Input
                    id="klumpSecretKey"
                    type="password"
                    value={localSettings.env.klumpSecretKey}
                    onChange={(e) => updateLocal('env', 'klumpSecretKey', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sentryDsn">Sentry DSN</Label>
                  <Input
                    id="sentryDsn"
                    value={localSettings.env.sentryDsn}
                    onChange={(e) => updateLocal('env', 'sentryDsn', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('env')} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Quotas */}
        <TabsContent value="quotas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quota Defaults</CardTitle>
                <CardDescription>Set the global free-tier limits for all users. Changes take effect immediately (cache busted on save).</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Free Daily Activities</Label>
                  <Input
                    type="number"
                    min={0}
                    value={localQuotas?.free_daily_activities ?? ""}
                    onChange={(e) => updateLocalQuota("free_daily_activities", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free AI Messages / day</Label>
                  <Input
                    type="number"
                    min={0}
                    value={localQuotas?.free_ai_messages ?? ""}
                    onChange={(e) => updateLocalQuota("free_ai_messages", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New User AI Messages / day</Label>
                  <p className="text-xs text-muted-foreground">Applies for the first N days (see below)</p>
                  <Input
                    type="number"
                    min={0}
                    value={localQuotas?.new_user_ai_messages ?? ""}
                    onChange={(e) => updateLocalQuota("new_user_ai_messages", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New User Grace Period (days)</Label>
                  <p className="text-xs text-muted-foreground">How many days after signup a user is &quot;new&quot;</p>
                  <Input
                    type="number"
                    min={1}
                    value={localQuotas?.new_user_days ?? ""}
                    onChange={(e) => updateLocalQuota("new_user_days", e.target.value === "" ? 1 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Distress Extension Messages</Label>
                  <p className="text-xs text-muted-foreground">Extra messages added when high-distress signals are detected</p>
                  <Input
                    type="number"
                    min={0}
                    value={localQuotas?.distress_extension_messages ?? ""}
                    onChange={(e) => updateLocalQuota("distress_extension_messages", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abuse Cap Messages</Label>
                  <p className="text-xs text-muted-foreground">Hard limit applied when rapid-fire / spam patterns are detected</p>
                  <Input
                    type="number"
                    min={1}
                    value={localQuotas?.abuse_cap_messages ?? ""}
                    onChange={(e) => updateLocalQuota("abuse_cap_messages", e.target.value === "" ? 1 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 border-t pt-4">
                  <Label className="text-base font-semibold">Corporate / Institutional Grace Period</Label>
                  <p className="text-xs text-muted-foreground">
                    Default number of days after a corporate subscription expires before the paywall is enforced.
                    Individual organizations can override this in their settings. Currently hard-coded default was 14 days.
                  </p>
                  <Input
                    type="number"
                    min={0}
                    className="max-w-xs"
                    value={localQuotas?.corporate_grace_period_days ?? ""}
                    onChange={(e) => updateLocalQuota("corporate_grace_period_days", e.target.value === "" ? 14 : parseInt(e.target.value))}
                  />
                </div>
              </div>
              <CardFooter className="px-0 pb-0">
                <Button onClick={handleSaveQuotas} disabled={isLoading || !localQuotas}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Save Quota Defaults
                </Button>
              </CardFooter>
              <div className="border rounded-md mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Daily Activities</TableHead>
                      <TableHead>AI Messages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotaOverview?.plans?.map((p) => {
                      const features = (p.features || {}) as Record<string, unknown>;
                      const daily = features['daily_activity_limit'] as number | string | undefined;
                      const ai = features['ai_message_limit'] as number | string | undefined;
                      return (
                        <TableRow key={String(p.id)}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.billing_interval || "-"}</TableCell>
                          <TableCell>{daily ?? "unlimited"}</TableCell>
                          <TableCell>{ai ?? "unlimited"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="text-sm text-muted-foreground">
                Today: AI 429s {quotaOverview?.stats?.ai_429_today ?? 0} • AI msgs {quotaOverview?.stats?.ai_messages_today ?? 0} • Activities {quotaOverview?.stats?.activities_today ?? 0}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Controls</CardTitle>
              <CardDescription>Disable specific sidebar links per role. Disabled items will be hidden from sidebars.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const roles = [
                  { key: "admin", label: "Admin" },
                  { key: "ceo", label: "CEO" },
                  { key: "manager", label: "Manager" },
                  { key: "institution_admin", label: "Institutional Admin" },
                  { key: "therapist", label: "Therapist" },
                ] as const;
                const routes: Record<string, { href: string; label: string }[]> = {
                  admin: [
                    { href: "/admin/dashboard", label: "Admin Dashboard" },
                    { href: "/admin/users", label: "Users" },
                    { href: "/admin/approvals/subscription-upgrades", label: "Approvals" },
                    { href: "/admin/finance/revenue", label: "Revenue" },
                    { href: "/admin/finance/payouts", label: "Payouts" },
                    { href: "/admin/finance/subscriptions", label: "Subscriptions" },
                    { href: "/admin/student-subscriptions", label: "Student Subscriptions" },
                    { href: "/admin/audit-log", label: "Audit Log" },
                    { href: "/admin/analytics", label: "Analytics" },
                    { href: "/admin/settings", label: "Settings" },
                    { href: "/admin/support", label: "Support" },
                  ],
                  ceo: [
                    { href: "/ceo/dashboard", label: "CEO Dashboard" },
                    { href: "/ceo/emails", label: "CEO Emails" },
                  ],
                  manager: [
                    { href: "/manager/dashboard", label: "Manager Dashboard" },
                    { href: "/manager/team", label: "Team" },
                    { href: "/manager/reports", label: "Reports" },
                    { href: "/manager/inventory", label: "Inventory" },
                    { href: "/manager/inventory/sounds", label: "Sounds" },
                    { href: "/manager/schedule", label: "Schedule" },
                  ],
                  institution_admin: [
                    { href: "/institutional/dashboard", label: "Institution Dashboard" },
                    { href: "/institutional/members", label: "Members" },
                    { href: "/institutional/at-risk", label: "At-Risk" },
                    { href: "/institutional/reports", label: "Reports" },
                    { href: "/institutional/quota", label: "Quota" },
                    { href: "/institutional/billing", label: "Billing" },
                    { href: "/institutional/referrals", label: "Referrals" },
                    { href: "/institutional/documents", label: "Documents" },
                    { href: "/institutional/subscription", label: "Subscription" },
                  ],
                  therapist: [
                    { href: "/therapist/dashboard", label: "Therapist Dashboard" },
                    { href: "/therapist/profile", label: "My Profile" },
                    { href: "/therapist/appointments", label: "Appointments" },
                    { href: "/therapist/availability", label: "Availability" },
                    { href: "/therapist/patients", label: "Patients" },
                    { href: "/therapist/sessions", label: "Sessions" },
                    { href: "/therapist/notes", label: "Notes" },
                    { href: "/therapist/earnings", label: "Earnings" },
                    { href: "/therapist/settings", label: "Settings" },
                  ],
                };
                const disabledMap = (localSettings.navigation?.disabled_routes ?? {}) as Record<string, string[]>;
                const count = (role: string) => (disabledMap[role]?.length ?? 0);
                const toggle = (role: string, href: string, checked: boolean) => {
                  const current = new Set(disabledMap[role] ?? []);
                  if (checked) current.add(href);
                  else current.delete(href);
                  const next = { ...disabledMap, [role]: Array.from(current) };
                  updateLocal("navigation", "disabled_routes", next);
                };
                return (
                  <div className="space-y-6">
                    {roles.map(({ key, label }) => (
                      <div key={key} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-muted-foreground">
                            Disabled: <span className="inline-flex items-center px-2 py-0.5 rounded-md border">{count(key)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {routes[key].map((r) => {
                            const list = disabledMap[key] ?? [];
                            const isDisabled = list.includes(r.href);
                            return (
                              <label key={r.href} className="flex items-center justify-between border rounded-md px-3 py-2">
                                <span className="text-sm">{r.label}</span>
                                <input
                                  type="checkbox"
                                  checked={isDisabled}
                                  onChange={(e) => toggle(key, r.href, e.target.checked)}
                                  className="w-4 h-4"
                                  aria-label={`Disable ${r.label}`}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('navigation' as keyof AppSettings)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Navigation Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Commission */}
        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Therapist Commission Structure</CardTitle>
              <CardDescription>Configure tiered therapist keep percentages and founding therapist discount.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Founding Discount Enabled</Label>
                  <div className="text-sm text-muted-foreground">Add founding discount to therapist keep within duration window</div>
                </div>
                <Switch
                  checked={Boolean((localSettings as any)?.commission?.founding_enabled ?? true)}
                  onCheckedChange={(checked) => updateLocal('commission', 'founding_enabled', checked)}
                />
              </div>
              <div className="rounded-md border p-4">
                <div className="text-sm font-medium mb-3">Tiers</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  {(localSettings as any)?.commission?.tiers?.map((t: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 items-end">
                      <div>
                        <Label>Min (₦)</Label>
                        <Input
                          type="number"
                          value={t.min ?? ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || "0", 10);
                            const tiers = [...(localSettings as any).commission.tiers];
                            tiers[idx] = { ...tiers[idx], min: val };
                            updateLocal("commission", "tiers", tiers);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Max (₦)</Label>
                        <Input
                          type="number"
                          placeholder="null = no max"
                          value={t.max ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const val = raw === "" ? null : parseInt(raw, 10);
                            const tiers = [...(localSettings as any).commission.tiers];
                            tiers[idx] = { ...tiers[idx], max: val };
                            updateLocal("commission", "tiers", tiers);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Therapist Keep (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={t.therapist_keep_percent ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value || "0");
                            const tiers = [...(localSettings as any).commission.tiers];
                            tiers[idx] = { ...tiers[idx], therapist_keep_percent: val };
                            updateLocal("commission", "tiers", tiers);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="col-span-full">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const tiers = [ ...(localSettings as any).commission.tiers, { min: 0, max: null, therapist_keep_percent: 80 } ];
                        updateLocal("commission", "tiers", tiers);
                      }}
                    >
                      Add Tier
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Founding Discount (% add to keep)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={(localSettings as any)?.commission?.founding_discount_percent ?? 3}
                    onChange={(e) => updateLocal("commission", "founding_discount_percent", parseFloat(e.target.value || "0"))}
                    disabled={!((localSettings as any)?.commission?.founding_enabled ?? true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Founding Duration (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={(localSettings as any)?.commission?.founding_duration_months ?? 24}
                    onChange={(e) => updateLocal("commission", "founding_duration_months", parseInt(e.target.value || "0", 10))}
                    disabled={!((localSettings as any)?.commission?.founding_enabled ?? true)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('commission' as any)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Commission Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Therapist Terms (Markdown)</CardTitle>
              <CardDescription>Public therapist terms page and signup modal will reflect this content. Tables are rendered from live commission settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="therapist_terms_md">Markdown</Label>
                <textarea
                  id="therapist_terms_md"
                  value={(localSettings as any)?.documents?.therapist_terms_md ?? ""}
                  onChange={(e) => updateLocal("documents", "therapist_terms_md", e.target.value)}
                  className="min-h-[360px] w-full rounded-md border p-3 font-mono text-sm"
                  placeholder="# Therapist Pricing, Commission & Earnings"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('documents' as any)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Mail Settings */}
        <TabsContent value="mail">
          <MailSettings />
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <BrandingSettings mode="admin" />
        </TabsContent>

        {/* IP Protection Settings */}
        <TabsContent value="protection">
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Protection</CardTitle>
              <CardDescription>
                Raise the barrier for copying platform UI and business data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IPProtectionSettings userRole={userRole} />
              {(userRole === 'admin' || userRole === 'ceo') && (
                <IPProtectionLogs />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Settings */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout Schedule Settings</CardTitle>
              <CardDescription>
                Configure automatic payout schedules, minimum thresholds, and payment providers for each role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {payoutLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin" />
                </div>
              ) : payoutSettings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No payout settings found.</p>
              ) : (
                payoutSettings.map((setting: PayoutSetting) => (
                  <div key={setting.role} className="border rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize text-base">{setting.role} Payouts</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Auto-process</span>
                        <input
                          type="checkbox"
                          checked={setting.auto_process}
                          onChange={(e) => updatePayoutField(setting.role, 'auto_process', e.target.checked)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label>Payout Day of Month</Label>
                        <input
                          type="number"
                          min={1}
                          max={28}
                          value={setting.payout_day}
                          onChange={(e) => updatePayoutField(setting.role, 'payout_day', parseInt(e.target.value || '1'))}
                          className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Day 1–28 of each month</p>
                      </div>
                      <div className="space-y-1">
                        <Label>Minimum Amount (kobo)</Label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={setting.minimum_amount_kobo}
                          onChange={(e) => updatePayoutField(setting.role, 'minimum_amount_kobo', parseInt(e.target.value || '0'))}
                          className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          ≈ ₦{(setting.minimum_amount_kobo / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label>Currency</Label>
                        <select
                          value={setting.currency}
                          onChange={(e) => updatePayoutField(setting.role, 'currency', e.target.value)}
                          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                        >
                          <option value="NGN">NGN (₦)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>Payment Provider</Label>
                        <select
                          value={setting.provider}
                          onChange={(e) => updatePayoutField(setting.role, 'provider', e.target.value)}
                          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                        >
                          <option value="paystack">Paystack</option>
                          <option value="flutterwave">Flutterwave</option>
                          <option value="lenco">Lenco</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => savePayoutSetting(setting)}
                        disabled={savingPayout === setting.role}
                      >
                        {savingPayout === setting.role ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save {setting.role} Settings
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* SMS + WhatsApp — unified channel config */}
        <TabsContent value="sms" className="space-y-4">

          {/* ── Card 1: Channel Setup ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure SMS and WhatsApp delivery. Both channels share the same message templates and event settings below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SMS channel row */}
              <div className="rounded-xl border divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      SMS <span className="text-[10px] bg-muted border rounded px-1.5 py-0.5 text-muted-foreground font-normal">via Termii</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">One-way text messages to any phone. Required for OTP delivery.</div>
                  </div>
                  <Switch
                    checked={smsSettings.sms_enabled}
                    onCheckedChange={(v) => setSmsSettings((p) => ({ ...p, sms_enabled: v }))}
                  />
                </div>
                {smsSettings.sms_enabled && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="termii_api_key" className="text-xs">Termii API Key</Label>
                      <Input id="termii_api_key" type="password" placeholder="TL…" value={smsSettings.termii_api_key}
                        onChange={(e) => setSmsSettings((p) => ({ ...p, termii_api_key: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="termii_sender_id" className="text-xs">Sender ID <span className="text-muted-foreground font-normal">(max 11 chars, Termii-approved)</span></Label>
                      <Input id="termii_sender_id" maxLength={11} placeholder="ONWYND" value={smsSettings.termii_sender_id}
                        onChange={(e) => setSmsSettings((p) => ({ ...p, termii_sender_id: e.target.value.toUpperCase().slice(0, 11) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="otp_expiry_mins" className="text-xs">OTP Expiry (mins)</Label>
                        <Input id="otp_expiry_mins" type="number" min={1} max={60} value={smsSettings.otp_expiry_mins}
                          onChange={(e) => setSmsSettings((p) => ({ ...p, otp_expiry_mins: parseInt(e.target.value || '10') }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="otp_length" className="text-xs">OTP Length (digits)</Label>
                        <Input id="otp_length" type="number" min={4} max={8} value={smsSettings.otp_length}
                          onChange={(e) => setSmsSettings((p) => ({ ...p, otp_length: parseInt(e.target.value || '6') }))} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp channel row */}
              <div className="rounded-xl border divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      WhatsApp
                      {smsSettings.whatsapp_provider === 'qr'
                        ? <span className="text-[10px] bg-green-100 text-green-700 border rounded px-1.5 py-0.5 font-normal">linked device · free</span>
                        : <span className="text-[10px] bg-blue-100 text-blue-700 border rounded px-1.5 py-0.5 font-normal">Termii API · paid</span>
                      }
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Rich notifications direct to WhatsApp. Runs alongside SMS — uses the same templates.</div>
                  </div>
                  <Switch
                    checked={smsSettings.whatsapp_enabled}
                    onCheckedChange={(v) => setSmsSettings((p) => ({ ...p, whatsapp_enabled: v }))}
                  />
                </div>
                {smsSettings.whatsapp_enabled && (
                  <div className="p-4 space-y-4 bg-muted/20">
                    {/* Provider selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { value: 'qr',     label: 'QR Linked Device',        tag: 'free',     tagColor: 'bg-green-100 text-green-700', desc: 'Scan once with your phone. Works like WhatsApp Web. No fees.' },
                        { value: 'meta',   label: 'Meta / Facebook Business', tag: 'official', tagColor: 'bg-blue-100 text-blue-700',  desc: 'Meta Cloud API via approved Business Account. Best for templates & scale.' },
                        { value: 'termii', label: 'Termii API',               tag: 'managed',  tagColor: 'bg-purple-100 text-purple-700', desc: 'Termii\'s WhatsApp Business channel. Same API key as SMS.' },
                      ] as const).map(({ value, label, tag, tagColor, desc }) => (
                        <button key={value} type="button"
                          onClick={() => setSmsSettings((p) => ({ ...p, whatsapp_provider: value }))}
                          className={`rounded-xl border-2 p-3 text-left transition-colors ${smsSettings.whatsapp_provider === value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}
                        >
                          <div className="font-semibold text-xs flex items-center gap-2">
                            {label} <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${tagColor}`}>{tag}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">{desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* QR provider: connection status */}
                    {smsSettings.whatsapp_provider === 'qr' && (
                      <div className="rounded-lg border p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold">Device Connection</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {waLoading ? 'checking…' : waStatus ? (
                                <>
                                  <span className={`font-medium ${waStatus.qr_status === 'connected' ? 'text-green-700' : waStatus.qr_status === 'qr' ? 'text-amber-700' : 'text-muted-foreground'}`}>
                                    {waStatus.qr_status ?? 'unknown'}
                                  </span>
                                  {waStatus.phone && <span className="ml-2 text-green-700">+{waStatus.phone}{waStatus.pushName ? ` · ${waStatus.pushName}` : ''}</span>}
                                </>
                              ) : 'not checked yet'}
                            </div>
                            {waStatus?.qr_hint && <div className="text-[11px] text-amber-700 mt-1 font-mono bg-amber-50 rounded px-2 py-1">{waStatus.qr_hint}</div>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={fetchWaStatus} disabled={waLoading} className="text-xs h-7">
                              {waLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Check Status'}
                            </Button>
                            {waStatus?.qr_status === 'connected' && (
                              <Button size="sm" variant="destructive" onClick={handleWaDisconnect} className="text-xs h-7">Disconnect</Button>
                            )}
                          </div>
                        </div>

                        {waStatus?.qr_status === 'qr' && (
                          <div className="space-y-3 border-t pt-3">
                            <div className="text-xs text-muted-foreground">QR code is ready — scan it with WhatsApp on your phone (Settings → Linked Devices → Link a Device).</div>
                            {waQr ? (
                              <div className="flex flex-col items-center gap-2">
                                <Image src={waQr} alt="WhatsApp QR" width={176} height={176} unoptimized className="h-44 w-44 rounded-xl border shadow-sm" />
                                <div className="text-[11px] text-amber-700">QR expires every 20 seconds. Click &quot;Load QR&quot; again if scan fails.</div>
                                <Button size="sm" variant="outline" onClick={fetchWaQr} className="text-xs h-7">Refresh QR</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={fetchWaQr} className="text-xs h-7">Load QR Code</Button>
                            )}
                          </div>
                        )}

                        {waStatus?.qr_status === 'connected' && (
                          <div className="flex items-center gap-2 text-green-700 text-xs font-medium border-t pt-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            Connected — WhatsApp messages will be sent via this linked device.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta / Facebook Cloud API panel */}
                    {smsSettings.whatsapp_provider === 'meta' && (
                      <div className="rounded-lg border p-3 space-y-4 bg-blue-50/30">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold">Meta Cloud API</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Connection: {waStatus ? (
                                waStatus.connected
                                  ? <span className="text-green-700 font-medium">✓ Connected{waStatus.display_name ? ` · ${waStatus.display_name}` : ''}{waStatus.phone ? ` · +${waStatus.phone}` : ''}</span>
                                  : <span className="text-red-600 font-medium">✗ {waStatus.reason ?? 'Not connected'}</span>
                              ) : 'not checked'}
                            </div>
                            {waStatus?.quality && <div className="text-[11px] text-muted-foreground mt-0.5">Quality rating: <span className="font-medium">{waStatus.quality}</span></div>}
                          </div>
                          <Button size="sm" variant="outline" onClick={fetchWaStatus} disabled={waLoading} className="text-xs h-7 shrink-0">
                            {waLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test Connection'}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="meta_wa_phone_number_id" className="text-xs">Phone Number ID</Label>
                            <Input id="meta_wa_phone_number_id" placeholder="1234567890123456"
                              value={smsSettings.meta_wa_phone_number_id}
                              onChange={(e) => setSmsSettings((p) => ({ ...p, meta_wa_phone_number_id: e.target.value }))} />
                            <div className="text-[11px] text-muted-foreground">Found in Meta Business Manager → WhatsApp → Phone Numbers.</div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="meta_wa_access_token" className="text-xs">Permanent Access Token</Label>
                            <Input id="meta_wa_access_token" type="password" placeholder="EAAxxxxx…"
                              value={smsSettings.meta_wa_access_token}
                              onChange={(e) => setSmsSettings((p) => ({ ...p, meta_wa_access_token: e.target.value }))} />
                            <div className="text-[11px] text-muted-foreground">Use a System User token (not a page token) for uninterrupted access. Create in Business Settings → System Users.</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Termii provider: phone number */}
                    {smsSettings.whatsapp_provider === 'termii' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="wa_phone_number_id" className="text-xs">WhatsApp Sender Number <span className="text-muted-foreground font-normal">(registered in Termii dashboard)</span></Label>
                        <Input id="wa_phone_number_id" placeholder="2348012345678" value={smsSettings.whatsapp_phone_number_id}
                          onChange={(e) => setSmsSettings((p) => ({ ...p, whatsapp_phone_number_id: e.target.value }))} />
                        <div className="text-[11px] text-muted-foreground">Uses the Termii API Key configured in the SMS section above.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSms} disabled={smsSaving}>
                {smsSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Channel Settings
              </Button>
            </CardFooter>
          </Card>

          {/* ── Card 2: Events & Channels (unified table) ────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Events &amp; Channels</CardTitle>
              <CardDescription>
                Choose which events fire notifications and through which channels.
                SMS and WhatsApp use the <strong>same message template</strong> per event — edit templates in the card below.
                Users can opt out of non-critical events; OTP is always sent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_5rem_5rem] gap-3 px-3 pb-2">
                <div className="text-xs font-semibold text-muted-foreground">Event</div>
                <div className="text-xs font-semibold text-muted-foreground text-center">SMS</div>
                <div className="text-xs font-semibold text-muted-foreground text-center">WhatsApp</div>
              </div>
              <div className="space-y-2">
                {([
                  {
                    label: 'OTP / Phone Verification',
                    desc:  'Security codes for login and phone verification.',
                    smsKey: 'event_otp',
                    waKey:  null as null,
                    locked: true as const,
                  },
                  {
                    label: 'Session Reminders',
                    desc:  'Reminder before an upcoming 1:1 therapy session.',
                    smsKey: 'event_session_reminder',
                    waKey:  'wa_event_session_reminder' as const,
                    locked: false as const,
                  },
                  {
                    label: 'Appointment Confirmations',
                    desc:  'Sent when a session is booked or rescheduled.',
                    smsKey: 'event_appointment',
                    waKey:  'wa_event_appointment' as const,
                    locked: false as const,
                  },
                  {
                    label: 'Group Session Reminders',
                    desc:  'Reminder before a group therapy session.',
                    smsKey: 'event_group_reminder',
                    waKey:  'wa_event_group_reminder' as const,
                    locked: false as const,
                  },
                  {
                    label: 'Payment Confirmation',
                    desc:  'Sent after a successful subscription payment.',
                    smsKey: 'event_payment_confirmation',
                    waKey:  'wa_event_payment_confirmation' as const,
                    locked: false as const,
                  },
                ] as const).map(({ label, desc, smsKey, waKey, locked }) => {
                  const smsOn = Boolean(smsSettings[smsKey as keyof typeof smsSettings]);
                  const waOn  = waKey ? Boolean(smsSettings[waKey as keyof typeof smsSettings]) : null;
                  const smsActive = smsSettings.sms_enabled && smsOn;
                  const waActive  = waKey ? smsSettings.whatsapp_enabled && Boolean(waOn) : false;
                  return (
                    <div key={smsKey} className={`grid grid-cols-[1fr_5rem_5rem] gap-3 items-center rounded-lg border px-3 py-3 ${locked ? 'bg-blue-50/50' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {label}
                          {locked && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">security</span>}
                          {(smsActive || waActive) && (
                            <span className="text-[10px] text-green-700 font-normal">
                              → {[smsActive && 'SMS', waActive && 'WA'].filter(Boolean).join(' + ')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                      </div>
                      {/* SMS toggle */}
                      <div className="flex justify-center">
                        <Switch
                          checked={smsOn}
                          disabled={locked}
                          onCheckedChange={(v) => setSmsSettings((p) => ({ ...p, [smsKey]: v }))}
                        />
                      </div>
                      {/* WhatsApp toggle */}
                      <div className="flex justify-center">
                        {waKey ? (
                          <Switch
                            checked={Boolean(waOn)}
                            disabled={!smsSettings.whatsapp_enabled}
                            onCheckedChange={(v) => setSmsSettings((p) => ({ ...p, [waKey]: v }))}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSms} disabled={smsSaving}>
                {smsSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Event Settings
              </Button>
            </CardFooter>
          </Card>

          {/* ── Card 3: Message Templates (shared by SMS + WhatsApp) */}
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                One template per event — used by <strong>both SMS and WhatsApp</strong> when enabled above.
                Use <code className="text-xs bg-muted px-1 rounded">{`{placeholder}`}</code> tokens — replaced at send-time.
                <span className="block mt-1 text-xs text-amber-700">Termii generic channel sends free-form text. Keep messages concise — 160 chars = 1 SMS credit.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'otp' as const,                  label: 'OTP / Verification Code',      vars: ['{code}', '{expiry_mins}', '{app_name}', '{name}'],                           smsKey: 'event_otp',                  waKey: null },
                { key: 'session_reminder' as const,     label: 'Session Reminder',             vars: ['{name}', '{therapist_name}', '{date}', '{time}', '{app_name}'],              smsKey: 'event_session_reminder',     waKey: 'wa_event_session_reminder' },
                { key: 'appointment' as const,          label: 'Appointment Confirmation',     vars: ['{name}', '{therapist_name}', '{date}', '{time}', '{app_name}'],              smsKey: 'event_appointment',          waKey: 'wa_event_appointment' },
                { key: 'group_reminder' as const,       label: 'Group Session Reminder',       vars: ['{name}', '{session_title}', '{date}', '{time}', '{app_name}'],              smsKey: 'event_group_reminder',       waKey: 'wa_event_group_reminder' },
                { key: 'payment_confirmation' as const, label: 'Payment Confirmation',         vars: ['{name}', '{amount}', '{currency}', '{plan_name}', '{app_name}'],             smsKey: 'event_payment_confirmation', waKey: 'wa_event_payment_confirmation' },
              ] as const).map(({ key, label, vars, smsKey, waKey }) => {
                const smsActive = smsSettings.sms_enabled && Boolean(smsSettings[smsKey as keyof typeof smsSettings]);
                const waActive  = waKey ? smsSettings.whatsapp_enabled && Boolean(smsSettings[waKey as keyof typeof smsSettings]) : false;
                const charLen   = smsTemplates[key].length;
                return (
                  <div key={key} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold">{label}</Label>
                          {smsActive && <span className="text-[10px] bg-muted border rounded px-1.5 py-0.5">SMS</span>}
                          {waActive  && <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 rounded px-1.5 py-0.5">WhatsApp</span>}
                          {!smsActive && !waActive && <span className="text-[10px] text-muted-foreground">not sending on any channel</span>}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {vars.map((v) => (
                            <code key={v} className="text-[10px] bg-muted border rounded px-1.5 py-0.5 cursor-pointer select-all" title="Click to copy">{v}</code>
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[72px] resize-y"
                      value={smsTemplates[key]}
                      onChange={(e) => setSmsTemplates((p) => ({ ...p, [key]: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className={charLen > 320 ? 'text-red-600 font-medium' : charLen > 160 ? 'text-amber-600' : ''}>
                        {charLen} chars{charLen > 320 ? ' · 3+ SMS credits' : charLen > 160 ? ' · 2 SMS credits' : charLen > 0 ? ' · 1 SMS credit' : ''}
                      </div>
                      <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${charLen > 320 ? 'bg-red-500' : charLen > 160 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (charLen / 320) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSmsTemplates} disabled={smsTemplatesSaving}>
                {smsTemplatesSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Templates
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Geo & Localization */}
        <TabsContent value="geo">
          <Card>
            <CardHeader>
              <CardTitle>Geo & Localization</CardTitle>
              <CardDescription>
                Control auto-detection and what content changes based on visitor location.
                Affects testimonials, pricing, phone numbers, and payment gateway.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {geoLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : (
                <>
                  {/* Master toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div>
                      <Label className="text-base font-semibold">Auto-detect visitor location</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Uses edge headers (Cloudflare/Vercel) + IP lookup fallback. Disable to treat all visitors as Nigerian.</p>
                    </div>
                    <Switch checked={geoSettings.auto_detect} onCheckedChange={(v) => setGeoSettings((p) => ({ ...p, auto_detect: v }))} />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">What changes for international visitors</Label>

                    {[
                      { key: "regional_testimonials", label: "Testimonials", desc: "Show English-named testimonials with same photos for non-Nigerian visitors" },
                      { key: "regional_pricing", label: "Pricing display", desc: "Hide ₦ NGN for foreign users — show USD only. Nigerian users always see NGN." },
                      { key: "regional_phone", label: "Phone numbers", desc: "Show local Nigerian number (+234) for NG, international number for others" },
                      { key: "regional_payment_gateway", label: "Payment gateway", desc: "Route NGN → Paystack, USD → DodoPayments (or Stripe when configured)" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          checked={(geoSettings as any)[key]}
                          onCheckedChange={(v) => setGeoSettings((p) => ({ ...p, [key]: v }))}
                          disabled={!geoSettings.auto_detect}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Payment gateway config */}
                  <div className="space-y-3 pt-2 border-t">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">International Payment Gateway</Label>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20">
                      <div>
                        <p className="text-sm font-medium">Pause Stripe for USD payments</p>
                        <p className="text-xs text-muted-foreground">When paused, DodoPayments handles all USD transactions. Enable Stripe once approved.</p>
                      </div>
                      <Switch checked={geoSettings.stripe_paused} onCheckedChange={(v) => setGeoSettings((p) => ({ ...p, stripe_paused: v }))} />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Primary gateway for USD users</Label>
                      <Select
                        value={geoSettings.international_gateway}
                        onValueChange={(v) => setGeoSettings((p) => ({ ...p, international_gateway: v as any }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dodopayments">DodoPayments (active — submit application first)</SelectItem>
                          <SelectItem value="stripe">Stripe (requires approved account + keys)</SelectItem>
                          <SelectItem value="flutterwave">Flutterwave</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        DodoPayments sandbox mode is active until <code className="bg-muted px-1 rounded">DODOPAYMENTS_SECRET_KEY</code> is set in .env.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeo} disabled={geoSaving || geoLoading}>
                {geoSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Geo Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payment Gateways */}
        <TabsContent value="gateways">
          <div className="space-y-6">
            {gatewayLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading gateway settings…
              </div>
            )}

            {(
              [
                { id: 'paystack',     label: 'Paystack',     currency: 'NGN', type: 'Standard', subtitle: 'NGN card & bank payments — Nigeria' },
                { id: 'flutterwave',  label: 'Flutterwave',  currency: 'NGN', type: 'Standard', subtitle: 'NGN alternative gateway — Nigeria' },
                { id: 'klump',        label: 'Klump',        currency: 'NGN', type: 'BNPL',     subtitle: 'Buy Now Pay Later — Nigerian users' },
                { id: 'stripe',       label: 'Stripe',       currency: 'USD', type: 'Standard', subtitle: 'USD card payments — International' },
                { id: 'dodopayments', label: 'DodoPayments', currency: 'USD', type: 'Standard', subtitle: 'USD payments — International (active)' },
              ] as const
            ).map(({ id, label, currency, type, subtitle }) => {
              const enabled = Boolean(gatewaySettings[`${id}_enabled`]);
              const mode    = (gatewaySettings[`${id}_mode`] ?? 'test') as 'test' | 'live';
              const updateStr = (field: string, value: string) => {
                setGatewaySettings((prev) => ({ ...prev, [`${id}_${field}`]: value }));
                setGatewayLiveValidation((prev) => ({ ...prev, [id]: 'idle' }));
                setGatewayLiveValidationMessage((prev) => ({ ...prev, [id]: '' }));
              };

              return (
                <Card key={id} className={enabled ? '' : 'opacity-60'}>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {label}
                            <Badge variant="outline" className="text-xs">{currency}</Badge>
                            {type === 'BNPL' && <Badge variant="secondary" className="text-xs">BNPL</Badge>}
                            {enabled
                              ? <Badge className={`text-xs ${mode === 'live' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>{mode === 'live' ? 'LIVE' : 'TEST'}</Badge>
                              : <Badge variant="secondary" className="text-xs text-muted-foreground">INACTIVE</Badge>
                            }
                          </CardTitle>
                          <CardDescription>{subtitle}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Active toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              setGatewaySettings((prev) => ({ ...prev, [`${id}_enabled`]: checked }))
                            }
                          />
                        </div>
                        {/* Test / Live mode toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Test</span>
                          <Switch
                            checked={mode === 'live'}
                            disabled={!enabled}
                            onCheckedChange={(checked) => {
                              if (checked && !validateLiveGateway(id, gatewaySettings)) {
                                toast({
                                  title: "Cannot switch to LIVE",
                                  description: gatewayLiveValidationMessage[id] || "Validate live keys first.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setGatewaySettings((prev) => ({ ...prev, [`${id}_mode`]: checked ? 'live' : 'test' }));
                            }}
                          />
                          <span className="text-sm text-muted-foreground">Live</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Test keys */}
                      <div className={`space-y-3 rounded-lg border border-dashed p-4 ${mode === 'test' && enabled ? 'border-yellow-400 bg-yellow-50/30' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300">TEST</Badge>
                          <span className="text-sm font-medium text-muted-foreground">Test Keys</span>
                          {mode === 'test' && enabled && <span className="text-xs text-yellow-700 font-medium">← active</span>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${id}_test_pk`}>Public Key</Label>
                          <Input id={`${id}_test_pk`} placeholder="pk_test_…" value={String(gatewaySettings[`${id}_test_public_key`] ?? '')} onChange={(e) => updateStr('test_public_key', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${id}_test_sk`}>Secret Key</Label>
                          <Input id={`${id}_test_sk`} type="password" placeholder="sk_test_…" value={String(gatewaySettings[`${id}_test_secret_key`] ?? '')} onChange={(e) => updateStr('test_secret_key', e.target.value)} />
                        </div>
                      </div>

                      {/* Live keys */}
                      <div className={`space-y-3 rounded-lg border border-dashed p-4 ${mode === 'live' && enabled ? 'border-green-400 bg-green-50/30' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-green-600 text-white">LIVE</Badge>
                          <span className="text-sm font-medium text-muted-foreground">Live Keys</span>
                          {mode === 'live' && enabled && <span className="text-xs text-green-700 font-medium">← active</span>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${id}_live_pk`}>Public Key</Label>
                          <Input id={`${id}_live_pk`} placeholder="pk_live_…" value={String(gatewaySettings[`${id}_live_public_key`] ?? '')} onChange={(e) => updateStr('live_public_key', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${id}_live_sk`}>Secret Key</Label>
                          <Input id={`${id}_live_sk`} type="password" placeholder="sk_live_…" value={String(gatewaySettings[`${id}_live_secret_key`] ?? '')} onChange={(e) => updateStr('live_secret_key', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const ok = validateLiveGateway(id, gatewaySettings);
                              const validationError = getGatewayLiveValidationError(id, gatewaySettings);
                              toast({
                                title: ok ? "Live keys validated" : "Live key validation failed",
                                description: ok ? `${label} is ready for LIVE mode.` : (validationError || "Invalid live keys."),
                                variant: ok ? "default" : "destructive",
                              });
                            }}
                          >
                            Validate Live Keys
                          </Button>
                          {gatewayLiveValidation[id] === 'valid' && (
                            <span className="text-xs text-green-700">Validated for LIVE</span>
                          )}
                          {gatewayLiveValidation[id] === 'invalid' && (
                            <span className="text-xs text-red-700">{gatewayLiveValidationMessage[id]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-end">
              <Button onClick={handleSaveGateways} disabled={gatewaySaving || gatewayLoading}>
                {gatewaySaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save Gateway Settings
              </Button>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

