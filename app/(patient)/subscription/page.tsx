"use client";

import { useEffect, useState } from "react";
import { subscriptionService, Subscription } from "@/lib/api/subscription";
import { SubscriptionPlan } from "@/lib/api/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS: Record<string, string> = {
  active: "border-green-500 text-green-700",
  trialing: "border-blue-500 text-blue-700",
  cancelled: "border-red-500 text-red-600",
  expired: "border-orange-500 text-orange-600",
  pending: "border-yellow-500 text-yellow-600",
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | number | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsPageLoading(true);
      setFetchError(false);
      try {
        const [plansRaw, subRaw] = await Promise.all([
          subscriptionService.getPlans(),
          subscriptionService.getCurrentSubscription().catch(() => null),
        ]);

        const plansData = plansRaw?.data ?? plansRaw ?? [];
        const subData = subRaw?.data ?? subRaw ?? null;

        setPlans(Array.isArray(plansData) ? plansData : []);
        setCurrentSubscription(subData);
      } catch {
        setFetchError(true);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
          variant: "destructive",
        });
        setPlans([]);
      } finally {
        setIsPageLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  const isCurrentPlan = (plan: SubscriptionPlan): boolean =>
    currentSubscription != null && String(currentSubscription.plan_id) === String(plan.id);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (loadingPlanId !== null) return;
    setLoadingPlanId(plan.id);
    try {
      const isSwitch = currentSubscription != null && !isCurrentPlan(plan);
      const response = isSwitch
        ? await subscriptionService.changePlan(plan.id)
        : await subscriptionService.subscribe(plan.id);

      const paymentUrl =
        response?.payment_url ??
        response?.data?.payment_url ??
        response?.checkout_url ??
        null;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast({
          title: "Success",
          description: isSwitch
            ? `Switched to ${plan.name} successfully.`
            : `Subscribed to ${plan.name} successfully.`,
        });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process subscription. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const formatPrice = (plan: SubscriptionPlan): string => {
    if (plan.price_ngn != null && plan.price_ngn > 0)
      return `₦${plan.price_ngn.toLocaleString()}`;
    if (plan.price != null && plan.price > 0)
      return `${plan.currency ?? "NGN"} ${plan.price.toLocaleString()}`;
    if (plan.price_usd != null && plan.price_usd > 0) return `$${plan.price_usd}`;
    return "Free";
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

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const statusKey = currentSubscription?.status ?? "";
  const statusColor = STATUS_COLORS[statusKey] ?? "border-gray-400 text-gray-600";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the perfect plan for your mental health journey
        </p>
      </div>

      {currentSubscription && (
        <div className="mb-8">
          <Card className={`border-2 ${statusColor.split(" ")[0]}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Subscription
                <Badge variant="outline" className={statusColor}>
                  {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {currentSubscription.plan?.name
                  ? `You are subscribed to the ${currentSubscription.plan.name} plan.`
                  : "You have an active subscription."}
                {currentSubscription.next_billing_date && statusKey === "active" && (
                  <span className="block mt-1">
                    Next billing date:{" "}
                    {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                  </span>
                )}
                {currentSubscription.end_date && statusKey !== "active" && (
                  <span className="block mt-1">
                    Ends:{" "}
                    {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {fetchError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Failed to load plans. Please refresh the page.</p>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subscription plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan);
            const isLoadingThis = loadingPlanId === plan.id;
            const isAnyLoading = loadingPlanId !== null;
            const features = getFeatureList(plan);
            const hasSwitch = currentSubscription != null && !isCurrent;

            return (
              <Card key={plan.id} className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      /{" "}
                      <span className="capitalize">{formatInterval(plan)}</span>
                    </span>
                    {plan.price_usd != null && plan.price_usd > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        or ${plan.price_usd} USD
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan)}
                    disabled={isAnyLoading || isCurrent}
                    variant={isCurrent ? "outline" : "default"}
                  >
                    {isLoadingThis ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : hasSwitch ? (
                      "Switch to this Plan"
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
