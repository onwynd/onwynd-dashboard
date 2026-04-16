"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  X,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// ── Types ───────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
  id: number;
  uuid?: string;
  name: string;
  slug: string;
  description?: string;
  plan_type: "d2c" | "b2b_corporate" | "b2b_university" | "b2b_faith_ngo";
  price: number;
  price_ngn: number;
  price_usd: number;
  setup_fee_ngn?: number;
  setup_fee_usd?: number;
  currency: string;
  billing_interval: "monthly" | "quarterly" | "yearly" | "one_time";
  features: {
    feature_list?: string[];
    daily_activity_limit?: number;
    ai_message_limit?: number;
    [key: string]: unknown;
  } | null;
  max_sessions?: number;
  trial_days?: number;
  is_active: boolean;
  is_popular: boolean;
  is_recommended: boolean;
  best_for?: string;
  conversion_target?: number;
  sort_order?: number;
  active_subscribers?: number;
  total_subscribers?: number;
}

type PlanFormData = Omit<SubscriptionPlan, "id" | "uuid" | "slug" | "active_subscribers" | "total_subscribers"> & {
  daily_activity_limit?: number | null;
  ai_message_limit?: number | null;
};

// ── Constants ───────────────────────────────────────────────────────────────

const PLAN_TYPES = [
  { value: "d2c",              label: "Individual (D2C)" },
  { value: "b2b_corporate",   label: "Corporate (B2B)" },
  { value: "b2b_university",  label: "University" },
  { value: "b2b_faith_ngo",   label: "Faith & NGO" },
];

const INTERVALS = [
  { value: "monthly",   label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly" },
  { value: "one_time",  label: "One Time" },
];

const EMPTY_FORM: PlanFormData = {
  name: "",
  description: "",
  plan_type: "d2c",
  price: 0,
  price_ngn: 0,
  price_usd: 0,
  setup_fee_ngn: 0,
  setup_fee_usd: 0,
  currency: "NGN",
  billing_interval: "monthly",
  features: { feature_list: [] },
  max_sessions: 0,
  trial_days: 0,
  is_active: true,
  is_popular: false,
  is_recommended: false,
  best_for: "",
  conversion_target: undefined,
  sort_order: 0,
  daily_activity_limit: null,
  ai_message_limit: null,
};

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load plans.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const filtered = filterType === "all"
    ? plans
    : plans.filter((p) => p.plan_type === filterType);

  const totalActive = plans.filter((p) => p.is_active).length;
  const totalSubscribers = plans.reduce((s, p) => s + (p.active_subscribers ?? 0), 0);
  const totalRevenue = plans.reduce((s, p) => {
    const subs = p.active_subscribers ?? 0;
    return s + subs * (p.price_ngn ?? p.price ?? 0);
  }, 0);

  const handleToggle = async (plan: SubscriptionPlan) => {
    setToggling(plan.id);
    try {
      await adminService.toggleSubscriptionPlanActive(plan.id);
      setPlans((prev) =>
        prev.map((p) => p.id === plan.id ? { ...p, is_active: !p.is_active } : p)
      );
      toast({ title: plan.is_active ? "Plan deactivated" : "Plan activated" });
    } catch {
      toast({ title: "Error", description: "Failed to toggle plan.", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    setSaving(true);
    try {
      await adminService.deleteSubscriptionPlan(deletingPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      toast({ title: "Plan deleted successfully." });
      setDeletingPlan(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to delete plan.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage pricing tiers, benefits, and plan availability.
          </p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Plans",          value: plans.length,       icon: CreditCard, color: "text-primary" },
          { label: "Active Plans",         value: totalActive,         icon: TrendingUp, color: "text-green-600" },
          { label: "Active Subscribers",   value: totalSubscribers,    icon: Users,       color: "text-blue-600" },
          { label: "Est. Monthly Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color} shrink-0`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Type Filter */}
      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {PLAN_TYPES.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center text-muted-foreground">
          No plans in this category. Create one to get started.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              toggling={toggling === plan.id}
              onToggle={() => handleToggle(plan)}
              onEdit={() => { setEditingPlan(plan); setIsFormOpen(true); }}
              onDelete={() => setDeletingPlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Plan Form Dialog */}
      <PlanFormDialog
        open={isFormOpen}
        plan={editingPlan}
        onClose={() => setIsFormOpen(false)}
        onSaved={(updated) => {
          setPlans((prev) =>
            editingPlan
              ? prev.map((p) => p.id === updated.id ? updated : p)
              : [updated, ...prev]
          );
          setIsFormOpen(false);
        }}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingPlan} onOpenChange={(o) => !o && setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deletingPlan?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan. Plans with active subscribers cannot be deleted — deactivate them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  toggling,
  onToggle,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlan;
  toggling: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const featureList: string[] = Array.isArray(plan.features?.feature_list)
    ? plan.features!.feature_list!
    : [];

  const planTypeLabel = PLAN_TYPES.find((t) => t.value === plan.plan_type)?.label ?? plan.plan_type;
  const intervalLabel = INTERVALS.find((i) => i.value === plan.billing_interval)?.label ?? plan.billing_interval;

  return (
    <Card className={`flex flex-col transition-all ${!plan.is_active ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-base truncate">{plan.name}</CardTitle>
              {plan.is_popular && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                  <Star className="h-2.5 w-2.5 mr-0.5" />Popular
                </Badge>
              )}
              {plan.is_recommended && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{planTypeLabel} · {intervalLabel}</p>
          </div>
          {/* Active Toggle */}
          <Switch
            checked={plan.is_active}
            onCheckedChange={onToggle}
            disabled={toggling}
            className="shrink-0"
          />
        </div>

        {/* Prices */}
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="text-sm">
            <span className="text-muted-foreground text-xs">NGN</span>
            <span className="font-bold ml-1">₦{(plan.price_ngn ?? 0).toLocaleString()}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground text-xs">USD</span>
            <span className="font-bold ml-1">${(plan.price_usd ?? 0).toFixed(2)}</span>
          </div>
          {(plan.setup_fee_ngn ?? 0) > 0 && (
            <div className="text-xs text-muted-foreground">
              +₦{plan.setup_fee_ngn?.toLocaleString()} setup
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-0">
        {plan.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
        )}

        {plan.best_for && (
          <p className="text-xs bg-muted rounded-md px-2 py-1">
            <span className="font-medium">Best for:</span> {plan.best_for}
          </p>
        )}

        {/* Key limits */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {plan.max_sessions !== undefined && plan.max_sessions !== null && (
            <span>{plan.max_sessions === 0 ? "Unlimited" : plan.max_sessions} sessions/mo</span>
          )}
          {plan.trial_days != null && plan.trial_days > 0 && (
            <span>{plan.trial_days}-day trial</span>
          )}
          {plan.features?.ai_message_limit != null && (
            <span>{plan.features.ai_message_limit} AI msgs/day</span>
          )}
        </div>

        {/* Benefits list */}
        {featureList.length > 0 && (
          <ul className="space-y-1">
            {featureList.slice(0, 4).map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
            {featureList.length > 4 && (
              <li className="text-xs text-muted-foreground pl-4">
                +{featureList.length - 4} more
              </li>
            )}
          </ul>
        )}

        {/* Subscriber stats */}
        {(plan.active_subscribers ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
            <Users className="h-3 w-3" />
            <span>{plan.active_subscribers} active subscriber{plan.active_subscribers !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            disabled={(plan.active_subscribers ?? 0) > 0}
            title={(plan.active_subscribers ?? 0) > 0 ? "Cannot delete: has active subscribers" : "Delete plan"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Plan Form Dialog ─────────────────────────────────────────────────────────

function PlanFormDialog({
  open,
  plan,
  onClose,
  onSaved,
}: {
  open: boolean;
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSaved: (plan: SubscriptionPlan) => void;
}) {
  const [form, setForm] = useState<PlanFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newBenefit, setNewBenefit] = useState("");

  useEffect(() => {
    if (plan) {
      const feats = plan.features ?? {};
      setForm({
        name:                 plan.name,
        description:          plan.description ?? "",
        plan_type:            plan.plan_type ?? "d2c",
        price:                plan.price ?? 0,
        price_ngn:            plan.price_ngn ?? 0,
        price_usd:            plan.price_usd ?? 0,
        setup_fee_ngn:        plan.setup_fee_ngn ?? 0,
        setup_fee_usd:        plan.setup_fee_usd ?? 0,
        currency:             plan.currency ?? "NGN",
        billing_interval:     plan.billing_interval ?? "monthly",
        features:             { ...feats, feature_list: feats.feature_list ?? [] },
        max_sessions:         plan.max_sessions ?? 0,
        trial_days:           plan.trial_days ?? 0,
        is_active:            plan.is_active ?? true,
        is_popular:           plan.is_popular ?? false,
        is_recommended:       plan.is_recommended ?? false,
        best_for:             plan.best_for ?? "",
        conversion_target:    plan.conversion_target,
        sort_order:           plan.sort_order ?? 0,
        daily_activity_limit: (feats.daily_activity_limit as number | undefined) ?? null,
        ai_message_limit:     (feats.ai_message_limit as number | undefined) ?? null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setNewBenefit("");
  }, [plan, open]);

  const set = <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const featureList: string[] = form.features?.feature_list ?? [];

  const addBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;
    set("features", { ...form.features, feature_list: [...featureList, trimmed] });
    setNewBenefit("");
  };

  const removeBenefit = (idx: number) =>
    set("features", {
      ...form.features,
      feature_list: featureList.filter((_, i) => i !== idx),
    });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Plan name is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: {
          ...form.features,
          ...(form.daily_activity_limit != null ? { daily_activity_limit: form.daily_activity_limit } : {}),
          ...(form.ai_message_limit != null      ? { ai_message_limit: form.ai_message_limit }      : {}),
        },
      };
      // Remove top-level limit keys from payload (they belong inside features)
      delete (payload as Record<string, unknown>).daily_activity_limit;
      delete (payload as Record<string, unknown>).ai_message_limit;

      let saved: SubscriptionPlan;
      if (plan) {
        const res = await adminService.updateSubscriptionPlan(plan.id, payload);
        saved = ((res as any)?.data ?? res) as unknown as SubscriptionPlan;
      } else {
        const res = await adminService.createSubscriptionPlan(payload);
        saved = ((res as any)?.data ?? res) as unknown as SubscriptionPlan;
      }

      toast({ title: plan ? "Plan updated." : "Plan created." });
      onSaved(saved);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to save plan.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? `Edit: ${plan.name}` : "Create New Plan"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Basic Info */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Plan Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Premium" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  placeholder="Short description shown on pricing page"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Plan Type</Label>
                <Select value={form.plan_type} onValueChange={(v: string | null) => set("plan_type", (v ?? "d2c") as PlanFormData["plan_type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Billing Interval</Label>
                <Select value={form.billing_interval} onValueChange={(v: string | null) => set("billing_interval", (v ?? "monthly") as PlanFormData["billing_interval"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Best For <span className="text-muted-foreground text-xs">(shown on pricing page)</span></Label>
                <Input value={form.best_for ?? ""} onChange={(e) => set("best_for", e.target.value)} placeholder="e.g. Individuals seeking full mental health support" />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price NGN (₦)</Label>
                <Input type="number" min="0" step="100" value={form.price_ngn ?? 0} onChange={(e) => set("price_ngn", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Price USD ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.price_usd ?? 0} onChange={(e) => set("price_usd", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Setup Fee NGN <span className="text-muted-foreground text-xs">(0 if none)</span></Label>
                <Input type="number" min="0" step="100" value={form.setup_fee_ngn ?? 0} onChange={(e) => set("setup_fee_ngn", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Setup Fee USD <span className="text-muted-foreground text-xs">(0 if none)</span></Label>
                <Input type="number" min="0" step="0.01" value={form.setup_fee_usd ?? 0} onChange={(e) => set("setup_fee_usd", parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </section>

          {/* Plan Limits */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan Limits</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Therapy Sessions/Month <span className="text-muted-foreground text-xs">(0 = unlimited)</span></Label>
                <Input type="number" min="0" value={form.max_sessions ?? 0} onChange={(e) => set("max_sessions", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Trial Days <span className="text-muted-foreground text-xs">(0 = none)</span></Label>
                <Input type="number" min="0" value={form.trial_days ?? 0} onChange={(e) => set("trial_days", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>AI Messages/Day <span className="text-muted-foreground text-xs">(blank = unlimited)</span></Label>
                <Input
                  type="number"
                  min="0"
                  value={form.ai_message_limit ?? ""}
                  onChange={(e) => set("ai_message_limit", e.target.value === "" ? null : parseInt(e.target.value))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Daily Activity Limit <span className="text-muted-foreground text-xs">(blank = unlimited)</span></Label>
                <Input
                  type="number"
                  min="0"
                  value={form.daily_activity_limit ?? ""}
                  onChange={(e) => set("daily_activity_limit", e.target.value === "" ? null : parseInt(e.target.value))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </section>

          {/* Benefits / Features */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Benefits & Features <span className="normal-case font-normal text-muted-foreground">(shown on pricing page)</span>
            </h3>
            <div className="space-y-2">
              {featureList.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2">
                  <span className="text-green-500 text-sm shrink-0">✓</span>
                  <span className="flex-1 text-sm">{benefit}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeBenefit(idx)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Unlimited AI check-ins"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                className="flex-1"
              />
              <Button variant="outline" onClick={addBenefit} disabled={!newBenefit.trim()} className="gap-1 shrink-0">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or click Add to add each benefit one by one.</p>
          </section>

          {/* Visibility & Flags */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visibility & Display</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: "is_active",      label: "Active",         desc: "Visible on pricing page and available for purchase" },
                { key: "is_popular",     label: "Most Popular",   desc: "Shows 'Most Popular' badge and highlights this plan" },
                { key: "is_recommended", label: "Recommended",    desc: "Shows 'Recommended' badge for this plan" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={form[key as keyof PlanFormData] as boolean}
                    onCheckedChange={(c) => set(key as keyof PlanFormData, c as never)}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sort Order <span className="text-muted-foreground text-xs">(lower = first)</span></Label>
                <Input type="number" min="0" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Conversion Target % <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.conversion_target ?? ""}
                  onChange={(e) => set("conversion_target", e.target.value === "" ? undefined : parseInt(e.target.value))}
                  placeholder="e.g. 30"
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : plan ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
