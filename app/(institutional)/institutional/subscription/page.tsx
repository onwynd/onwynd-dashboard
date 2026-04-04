"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paystackService } from "@/lib/services/paystack";
import { stripeService } from "@/lib/services/stripe";
import { AppConfig } from "@/lib/config";
import { institutionalService } from "@/lib/api/institutional";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionPlan } from "@/lib/api/settings";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | number | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const { toast } = useToast();

  /** Pull the authenticated user's email from localStorage (set at login) */
  const getUserEmail = (): string => {
    if (typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const parsed = JSON.parse(raw) as { email?: string };
      return parsed?.email ?? "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    async function fetchPlans() {
      setIsLoadingPlans(true);
      setFetchError(false);
      try {
        const data = await institutionalService.getPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch {
        setFetchError(true);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
          variant: "destructive",
        });
        setPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, [toast]);

  const handleUpgradeNGN = async (plan: SubscriptionPlan) => {
    if (loading !== null) return;
    const email = getUserEmail();
    if (!email) {
      toast({
        title: "Error",
        description: "Your account email could not be determined. Please log out and log back in.",
        variant: "destructive",
      });
      return;
    }
    setLoading(plan.id);
    try {
      const url = await paystackService.initializePayment({
        amount: plan.price_ngn ?? plan.price ?? 0,
        email,
        planUuid: plan.uuid ?? undefined,
      });
      window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment initialization failed.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleUpgradeUSD = async (plan: SubscriptionPlan) => {
    if (loading !== null) return;
    const priceId = AppConfig.getStripePriceId(plan.slug ?? "");
    if (!priceId) {
      toast({
        title: "USD payments unavailable",
        description: "Stripe pricing for this plan is not yet configured. Please use the NGN option or contact support.",
        variant: "destructive",
      });
      return;
    }
    setLoading(`${plan.id}-usd`);
    try {
      const successUrl = AppConfig.getSuccessUrl("/institutional/subscription/success");
      const cancelUrl = AppConfig.getSuccessUrl("/institutional/subscription");
      const url = await stripeService.checkout({ priceId, successUrl, cancelUrl });
      window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Stripe checkout failed.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (plan: SubscriptionPlan): string => {
    if (plan.price_ngn != null && plan.price_ngn > 0)
      return `₦${plan.price_ngn.toLocaleString()}`;
    if (plan.price != null && plan.price > 0)
      return `${plan.currency ?? "NGN"} ${plan.price.toLocaleString()}`;
    return "Contact us";
  };

  const formatInterval = (plan: SubscriptionPlan): string =>
    (plan.billing_interval ?? plan.interval ?? "").replace(/_/g, " ");

  const getFeatureList = (plan: SubscriptionPlan): string[] => {
    if (Array.isArray(plan.features)) return plan.features as string[];
    if (plan.features && typeof plan.features === "object") {
      const f = plan.features as Record<string, unknown>;
      if (Array.isArray(f.feature_list)) return f.feature_list as string[];
    }
    return [];
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
      </div>

      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : fetchError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Could not retrieve subscription plans. Please check your connection and try again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFetchError(false);
                setIsLoadingPlans(true);
                institutionalService
                  .getPlans()
                  .then((data) => setPlans(Array.isArray(data) ? data : []))
                  .catch(() => setFetchError(true))
                  .finally(() => setIsLoadingPlans(false));
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Plans Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Subscription plans are not available at the moment. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const features = getFeatureList(plan);
            const isLoadingThis =
              loading === plan.id || loading === `${plan.id}-usd`;
            const stripeAvailable = !!AppConfig.getStripePriceId(plan.slug ?? "");

            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {formatInterval(plan)}
                    </Badge>
                  </div>
                  <CardDescription>
                    <span className="text-2xl font-bold">{formatPrice(plan)}</span>
                    {plan.price_usd != null && plan.price_usd > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        / ${plan.price_usd} USD
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features.length > 0 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {features.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpgradeNGN(plan)}
                        disabled={isLoadingThis}
                        className="flex-1"
                      >
                        {loading === plan.id && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Pay (NGN)
                      </Button>
                      {stripeAvailable && (
                        <Button
                          variant="outline"
                          onClick={() => handleUpgradeUSD(plan)}
                          disabled={isLoadingThis}
                          className="flex-1"
                        >
                          {loading === `${plan.id}-usd` && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Pay (USD)
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

