"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/components/ui/use-toast";
import {
  Heart, Shield, DollarSign, Plane, BookOpen, Plus,
  Pencil, Trash2, Loader2, RefreshCw,
  Users, Briefcase, Star, Gift, Coffee, Zap, Globe, Music,
} from "lucide-react";
import { hrService } from "@/lib/api/hr";

// Map icon name strings (stored in DB) → lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Heart, Shield, DollarSign, Plane, BookOpen,
  Users, Briefcase, Star, Gift, Coffee, Zap, Globe, Music,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

interface Benefit {
  id: number;
  title: string;
  description: string | null;
  icon: string;
  status: "active" | "inactive";
  enrolled_count: number;
}

const emptyForm = { title: "", description: "", icon: "Heart", status: "active" as "active" | "inactive", enrolled_count: 0 };

export default function HRBenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Benefit | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hrService.getBenefits() as any;
      setBenefits(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      toast({ description: "Failed to load benefits.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(b: Benefit) {
    setEditTarget(b);
    setForm({ title: b.title, description: b.description ?? "", icon: b.icon, status: b.status, enrolled_count: b.enrolled_count });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ description: "Title is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await hrService.updateBenefit(editTarget.id, form);
        toast({ description: "Benefit updated." });
      } else {
        await hrService.createBenefit(form);
        toast({ description: "Benefit added." });
      }
      setDialogOpen(false);
      load();
    } catch {
      toast({ description: "Failed to save benefit.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b: Benefit) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await hrService.deleteBenefit(b.id);
      toast({ description: `"${b.title}" removed.` });
      load();
    } catch {
      toast({ description: "Failed to delete benefit.", variant: "destructive" });
    }
  }

  async function toggleStatus(b: Benefit) {
    const next = b.status === "active" ? "inactive" : "active";
    try {
      await hrService.updateBenefit(b.id, { status: next });
      toast({ description: `${b.title} marked ${next}.` });
      load();
    } catch {
      toast({ description: "Failed to update status.", variant: "destructive" });
    }
  }

  const totalEnrolled = benefits.reduce((s, b) => s + b.enrolled_count, 0);
  const activeBenefits = benefits.filter((b) => b.status === "active").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Benefits</h1>
          <p className="text-muted-foreground">Manage and configure benefit plans for employees.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Benefit
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{benefits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeBenefits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEnrolled.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Benefit cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : benefits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No benefits configured yet. Click <strong>Add Benefit</strong> to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = ICON_MAP[benefit.icon] ?? Heart;
            return (
              <Card key={benefit.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{benefit.title}</CardTitle>
                    </div>
                    <Badge
                      variant={benefit.status === "active" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(benefit)}
                    >
                      {benefit.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{benefit.enrolled_count.toLocaleString()} enrolled</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(benefit)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(benefit)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Health Insurance"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the benefit"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((p) => ({ ...p, icon: v ?? "" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((name) => {
                      const Ic = ICON_MAP[name];
                      return (
                        <SelectItem key={name} value={name}>
                          <span className="flex items-center gap-2">
                            <Ic className="h-4 w-4" /> {name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v !== null && setForm((p) => ({ ...p, status: v as "active" | "inactive" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Enrolled Count</Label>
              <Input
                type="number"
                min={0}
                value={form.enrolled_count}
                onChange={(e) => setForm((p) => ({ ...p, enrolled_count: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Add Benefit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
