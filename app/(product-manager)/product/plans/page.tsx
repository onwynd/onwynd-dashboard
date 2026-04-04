"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { pmService } from "@/lib/api/pm";
import { SubscriptionPlan } from "@/lib/api/settings";
import { useToast } from "@/components/ui/use-toast";
import { PlanForm } from "@/components/product-manager/plans/plan-form";
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
import { downloadCSV } from "@/lib/export-utils";

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const { toast } = useToast();

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await pmService.getPlans();
      // Ensure we handle both direct array and wrapped response
      setPlans(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch plans", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    plan.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await pmService.deletePlan(String(deleteId));
      toast({ title: "Success", description: "Plan deleted successfully" });
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: unknown) => {
    try {
      if (selectedPlan) {
        const update = (data as Partial<SubscriptionPlan>) || {};
        await pmService.updatePlan(String(selectedPlan.id), update);
        toast({ title: "Success", description: "Plan updated successfully" });
      } else {
        const create = (data as Omit<SubscriptionPlan, 'id'>) || ({} as Omit<SubscriptionPlan, 'id'>);
        await pmService.createPlan(create);
        toast({ title: "Success", description: "Plan created successfully" });
      }
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
      throw error;
    }
  };

  const getPlanPrice = (p: SubscriptionPlan): string => {
    if (p.price_ngn != null && p.price_ngn > 0) return `₦${p.price_ngn.toLocaleString()}`;
    if (p.price != null && p.price > 0) {
      const currency = p.currency ?? 'NGN';
      return `${currency} ${p.price.toLocaleString()}`;
    }
    if (p.price_usd != null && p.price_usd > 0) return `$${p.price_usd}`;
    return '—';
  };

  const getPlanInterval = (p: SubscriptionPlan): string => {
    const raw = p.billing_interval ?? p.interval ?? '';
    return raw.replace(/_/g, ' ');
  };

  const handleExport = () => {
    const headers = ["Name", "Slug", "Price (NGN)", "Price (USD)", "Interval", "Max Sessions", "Active"];
    const rows = plans.map((p) => ({
      Name: p.name,
      Slug: p.slug ?? '',
      "Price (NGN)": p.price_ngn ?? p.price ?? 0,
      "Price (USD)": p.price_usd ?? 0,
      Interval: getPlanInterval(p),
      "Max Sessions": p.max_sessions ?? '',
      Active: p.is_active ? 'Yes' : 'No',
    }));
    downloadCSV("plans_export.csv", headers, rows);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, pricing, and features.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>
            A list of all available subscription plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No plans found. Create one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Max Sessions</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>{plan.name}</div>
                      <div className="text-xs text-muted-foreground">{plan.slug}</div>
                    </TableCell>
                    <TableCell>
                      {getPlanPrice(plan)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {getPlanInterval(plan)}
                    </TableCell>
                    <TableCell>
                      {plan.max_sessions === 0 ? "Unlimited" : plan.max_sessions}
                    </TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PlanForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={selectedPlan}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscription plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
