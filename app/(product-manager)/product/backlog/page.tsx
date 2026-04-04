"use client";

import { useEffect, useState } from "react";
import { pmService } from "@/lib/api/pm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { BacklogTable } from "@/components/pm-dashboard/backlog-table";
import { FeatureForm } from "@/components/product-manager/features/feature-form";
import type { FeatureFormValues } from "@/components/product-manager/features/feature-form";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type FeatureItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  quarter: string;
  target_date: string;
  created_at: string;
};

export default function PMBacklogPage() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await pmService.getFeaturesList();
      // API might return { data: [...] } or just [...]
      const data = response.data || response;
      const list = Array.isArray(data) ? data : [];
      const normalized = (list as unknown[]).map((f) => {
        const obj = f as Record<string, unknown>;
        return {
          id: String(obj.id ?? ""),
          title: String(obj.title ?? ""),
          description: String(obj.description ?? ""),
          status: String(obj.status ?? "backlog"),
          priority: String(obj.priority ?? "medium"),
          quarter: String(obj.quarter ?? ""),
          target_date: String(obj.target_date ?? ""),
          created_at: String(obj.created_at ?? ""),
        };
      });
      setFeatures(normalized);
    } catch (error) {
      console.error("Failed to fetch features", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleCreate = async (data: FeatureFormValues) => {
    try {
      await pmService.createFeature(data);
      toast({ title: "Success", description: "Feature created successfully" });
      fetchFeatures();
      setIsCreateOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to create feature", variant: "destructive" });
    } finally {
    }
  };

  if (isLoading && features.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Product Backlog</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Feature</DialogTitle>
            </DialogHeader>
            <FeatureForm onSubmit={handleCreate} onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <BacklogTable data={features} onUpdate={fetchFeatures} />
    </div>
  );
}
