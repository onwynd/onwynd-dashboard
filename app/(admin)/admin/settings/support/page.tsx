"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { adminService } from "@/lib/api/admin";

const supportSettingsSchema = z.object({
  provider: z.enum(["ai_internal", "chatwoot", "intercom"]),
  chatwoot_url: z.string().optional(),
  chatwoot_website_token: z.string().optional(),
  intercom_app_id: z.string().optional(),
});

type SupportSettingsFormValues = z.infer<typeof supportSettingsSchema>;

export default function SupportSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<SupportSettingsFormValues>({
    resolver: zodResolver(supportSettingsSchema),
    defaultValues: {
      provider: "ai_internal",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await adminService.getSettings();
        if (settings.support) {
          form.reset(settings.support);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load settings",
          description: "Could not retrieve current support settings from the server.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: SupportSettingsFormValues) => {
    try {
      await adminService.updateSettings("support", data);
      toast({
        title: "Settings Saved",
        description: "Support settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save support settings. Please try again.",
      });
    }
  };

  const provider = form.watch("provider");

  if (loading) {
    return <div>Loading...</div>; // Replace with a proper skeleton loader
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Live Support Configuration</CardTitle>
          <CardDescription>
            Choose the provider for the customer support chat widget.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Controller
            name="provider"
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Label className="flex flex-col items-start space-y-2 border rounded-md p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="ai_internal" />
                    <span className="font-bold">Internal AI Support</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Use the built-in AI companion for initial support queries.
                  </p>
                </Label>
                <Label className="flex flex-col items-start space-y-2 border rounded-md p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="chatwoot" />
                    <span className="font-bold">Chatwoot</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Integrate with a self-hosted or cloud Chatwoot instance.
                  </p>
                </Label>
                <Label className="flex flex-col items-start space-y-2 border rounded-md p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="intercom" />
                    <span className="font-bold">Intercom</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Use the Intercom messenger widget for live support.
                  </p>
                </Label>
              </RadioGroup>
            )}
          />

          {provider === "chatwoot" && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Chatwoot Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="chatwoot_url">Chatwoot URL</Label>
                <Input
                  id="chatwoot_url"
                  placeholder="https://chat.yourdomain.com"
                  {...form.register("chatwoot_url")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chatwoot_website_token">Website Token</Label>
                <Input
                  id="chatwoot_website_token"
                  type="password"
                  placeholder="****************"
                  {...form.register("chatwoot_website_token")}
                />
              </div>
            </div>
          )}

          {provider === "intercom" && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Intercom Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="intercom_app_id">App ID</Label>
                <Input
                  id="intercom_app_id"
                  placeholder="Your Intercom App ID"
                  {...form.register("intercom_app_id")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
