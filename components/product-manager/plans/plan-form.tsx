import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
import { SubscriptionPlan } from "@/lib/api/settings";
import { useToast } from "@/components/ui/use-toast";

const planSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  plan_type: z.enum(["individual", "corporate", "institutional", "therapist"]).default("individual"),
  price: z.coerce.number().min(0),
  price_ngn: z.coerce.number().min(0).optional(),
  price_usd: z.coerce.number().min(0).optional(),
  currency: z.string().default("NGN"),
  billing_interval: z.enum(["monthly", "quarterly", "yearly", "one_time"]),
  features: z.string(),
  is_active: z.boolean().default(true),
  max_sessions: z.coerce.number().optional(),
  trial_days: z.coerce.number().optional(),
});

type PlanFormValues = z.input<typeof planSchema>;

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: unknown) => Promise<void>;
}

export function PlanForm({ open, onOpenChange, plan, onSubmit }: PlanFormProps) {
  const { toast } = useToast();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      plan_type: "individual" as const,
      price: 0,
      price_ngn: 0,
      price_usd: 0,
      currency: "NGN",
      billing_interval: "monthly",
      features: "",
      is_active: true,
      max_sessions: 0,
      trial_days: 0,
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        slug: plan.slug || "",
        description: plan.description || "",
        plan_type: (plan as any).plan_type || "individual",
        price: plan.price,
        price_ngn: (plan as any).price_ngn ?? 0,
        price_usd: (plan as any).price_usd ?? 0,
        currency: plan.currency || "NGN",
        billing_interval: plan.billing_interval,
        features: Array.isArray(plan.features) ? plan.features.join('\n') : (typeof plan.features === 'string' ? plan.features : ""),
        is_active: plan.is_active,
        max_sessions: plan.max_sessions || 0,
        trial_days: plan.trial_days || 0,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        plan_type: "individual" as const,
        price: 0,
        price_ngn: 0,
        price_usd: 0,
        currency: "NGN",
        billing_interval: "monthly",
        features: "",
        is_active: true,
        max_sessions: 0,
        trial_days: 0,
      });
    }
  }, [plan, form]);

  const handleSubmit = async (data: PlanFormValues) => {
    try {
      // Convert features string back to array
      const formattedData = {
        ...data,
        price: Number(data.price ?? 0),
        price_ngn: data.price_ngn != null ? Number(data.price_ngn) : undefined,
        price_usd: data.price_usd != null ? Number(data.price_usd) : undefined,
        max_sessions: data.max_sessions != null ? Number(data.max_sessions) : undefined,
        trial_days: data.trial_days != null ? Number(data.trial_days) : undefined,
        features: String(data.features || '').split('\n').filter((f) => f.trim() !== ''),
      };
      await onSubmit(formattedData);
      onOpenChange(false);
      form.reset();
      toast({
        title: "Success",
        description: plan ? "Plan updated successfully." : "Plan created successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {plan ? "Update subscription plan details." : "Add a new subscription plan."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pro Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="pro-plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Plan description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="institutional">Institutional</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_ngn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price NGN (₦)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">For Nigerian users</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price USD ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">For international users</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trial_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (one per line)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Feature 1&#10;Feature 2&#10;Feature 3" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_sessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Sessions (0 for unlimited)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Activate or deactivate this plan
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
