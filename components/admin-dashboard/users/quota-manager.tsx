"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, Settings, BarChart3 } from "lucide-react";
import { User, UserQuota, usersService } from "@/lib/api/users";

interface QuotaManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onRefresh: () => void;
}

export function QuotaManager({ open, onOpenChange, user, onRefresh }: QuotaManagerProps) {
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form state
  const [customAiMessages, setCustomAiMessages] = useState<string>("");
  const [customDailyActivities, setCustomDailyActivities] = useState<string>("");
  const [gracePeriodDays, setGracePeriodDays] = useState<string>("");
  const [hasUnlimitedQuota, setHasUnlimitedQuota] = useState(false);
  const [quotaOverrideExpiresAt, setQuotaOverrideExpiresAt] = useState<string>("");

  useEffect(() => {
    if (open && user) {
      loadQuota(user.id);
    }
  }, [open, user]);

  const loadQuota = async (userId: number) => {
    try {
      setLoading(true);
      const quotaData = await usersService.getUserQuota(userId);
      setQuota(quotaData);
      setCustomAiMessages(quotaData.user.custom_ai_messages?.toString() || "");
      setCustomDailyActivities(quotaData.user.custom_daily_activities?.toString() || "");
      setGracePeriodDays(quotaData.user.grace_period_days?.toString() || "0");
      setHasUnlimitedQuota(quotaData.user.has_unlimited_quota || false);
      setQuotaOverrideExpiresAt(quotaData.user.quota_override_expires_at?.split("T")[0] || "");
    } catch (error) {
      console.error("Failed to load quota:", error);
      toast({ title: "Error", description: "Failed to load user quota information", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const quotaData = {
        custom_ai_messages: customAiMessages ? parseInt(customAiMessages) : null,
        custom_daily_activities: customDailyActivities ? parseInt(customDailyActivities) : null,
        grace_period_days: parseInt(gracePeriodDays) || 0,
        has_unlimited_quota: hasUnlimitedQuota,
        quota_override_expires_at: quotaOverrideExpiresAt ? `${quotaOverrideExpiresAt}T23:59:59` : null,
      };
      await usersService.updateUserQuota(user.id, quotaData);
      toast({ title: "Success", description: "User quota updated successfully" });
      await loadQuota(user.id);
      onRefresh();
    } catch (error) {
      console.error("Failed to update quota:", error);
      toast({ title: "Error", description: "Failed to update user quota", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetQuota = async () => {
    if (!user) return;
    try {
      setResetting(true);
      await usersService.resetUserQuota(user.id);
      toast({ title: "Success", description: "User quota reset successfully" });
      await loadQuota(user.id);
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Failed to reset quota:", error);
      toast({ title: "Error", description: "Failed to reset user quota", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Quota — {user?.name ?? "User"}
          </DialogTitle>
          <DialogDescription>
            Configure custom quota limits and view usage for this user.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !quota ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Failed to load quota information.</p>
            {user && (
              <Button onClick={() => loadQuota(user.id)} className="mt-4">
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Current Usage Overview
                </CardTitle>
                <CardDescription>Today&apos;s quota usage for {user?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">AI Messages Today</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{quota.usage.ai_messages_today}</span>
                      {quota.user.has_unlimited_quota && <Badge variant="outline">Unlimited</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Activities Today</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{quota.usage.activities_today}</span>
                      {quota.user.has_unlimited_quota && <Badge variant="outline">Unlimited</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quota Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Quota Settings
                </CardTitle>
                <CardDescription>Configure custom quota limits for this user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="unlimited-quota">Unlimited Quota</Label>
                    <p className="text-sm text-muted-foreground">Grant unlimited access to all features</p>
                  </div>
                  <Switch id="unlimited-quota" checked={hasUnlimitedQuota} onCheckedChange={setHasUnlimitedQuota} />
                </div>

                {!hasUnlimitedQuota && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="custom-ai-messages">Custom AI Messages Limit</Label>
                      <Input
                        id="custom-ai-messages"
                        type="number"
                        min="0"
                        placeholder={`Global default: ${quota.global_defaults.free_ai_messages}`}
                        value={customAiMessages}
                        onChange={(e) => setCustomAiMessages(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty to use global default.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-daily-activities">Custom Daily Activities Limit</Label>
                      <Input
                        id="custom-daily-activities"
                        type="number"
                        min="0"
                        placeholder={`Global default: ${quota.global_defaults.free_daily_activities}`}
                        value={customDailyActivities}
                        onChange={(e) => setCustomDailyActivities(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty to use global default.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grace-period-days">Additional Grace Period Days</Label>
                      <Input
                        id="grace-period-days"
                        type="number"
                        min="0"
                        value={gracePeriodDays}
                        onChange={(e) => setGracePeriodDays(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quota-expires">Quota Override Expires</Label>
                      <Input
                        id="quota-expires"
                        type="date"
                        value={quotaOverrideExpiresAt}
                        onChange={(e) => setQuotaOverrideExpiresAt(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for no expiration.</p>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={resetting}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Today&apos;s Usage
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Defaults Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Global Defaults</CardTitle>
                <CardDescription>Current system-wide quota settings for reference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    ["Free AI Messages", quota.global_defaults.free_ai_messages],
                    ["Free Daily Activities", quota.global_defaults.free_daily_activities],
                    ["New User AI Messages", quota.global_defaults.new_user_ai_messages],
                    ["New User Days", quota.global_defaults.new_user_days],
                    ["Distress Extension", quota.global_defaults.distress_extension_messages],
                    ["Abuse Cap", quota.global_defaults.abuse_cap_messages],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset User Quota</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset {user?.name}&apos;s daily quota counters? This will clear their usage for today.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button onClick={handleResetQuota} disabled={resetting}>
                {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Quota
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
