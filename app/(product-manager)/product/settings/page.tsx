"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureFlags } from "@/components/admin-dashboard/settings/feature-flags";
import { SubscriptionSettings } from "@/components/admin-dashboard/settings/subscription-settings";
import { useSettingsStore } from "@/store/settings-store";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PMSettingsPage() {
  const { fetchSettings, fetchPlans, isLoading } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
    fetchPlans();
  }, [fetchSettings, fetchPlans]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Product Settings</h2>
      </div>
      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="space-y-4">
          <FeatureFlags />
        </TabsContent>
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
