"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cooService } from "@/lib/api/coo";
import {
  Target,
  Plus,
  TrendingUp,
  RefreshCw,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const CAMPAIGN_TYPES = ["social", "email", "seo", "paid", "content", "partnership", "event", "other"];
const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"];

const EMPTY_FORM = {
  name: "",
  type: "social",
  status: "draft",
  budget: "",
  start_date: "",
  end_date: "",
};

export default function MarketingPage() {
  const [funnel, setFunnel] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [funnelRes, campaignsRes] = await Promise.all([
        cooService.getMarketingFunnel(),
        cooService.getMarketingCampaigns()
      ]);
      setFunnel(funnelRes.data.data);
      setCampaigns(campaignsRes.data.data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load marketing data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      name: c.name ?? "",
      type: c.type ?? "social",
      status: c.status ?? "draft",
      budget: c.budget?.amount ?? c.budget ?? "",
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.type || !form.status) {
      toast({ description: "Name, type, and status are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        status: form.status,
        budget: form.budget ? Number(form.budget) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editingId) {
        await cooService.updateMarketingCampaign(editingId, payload);
        toast({ description: "Campaign updated" });
      } else {
        await cooService.createMarketingCampaign(payload);
        toast({ description: "Campaign created" });
      }
      setDialogOpen(false);
      fetchData();
    } catch {
      toast({ description: "Failed to save campaign", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await cooService.deleteMarketingCampaign(id);
      toast({ description: "Campaign deleted" });
      fetchData();
    } catch {
      toast({ description: "Failed to delete campaign", variant: "destructive" });
    }
  };

  if (loading && !funnel) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  const { funnel: funnelData, growth } = funnel || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing & Growth</h1>
          <p className="text-muted-foreground">Acquisition funnel and campaign performance</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Acquisition Funnel
            </CardTitle>
            <CardDescription>Conversion steps from visit to first session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Homepage Visits</span>
                <span>{funnelData?.homepage_visits || 'Requires Analytics'}</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Signups Started</span>
                <div className="flex gap-2 items-center">
                  <span>{funnelData?.signups_started}</span>
                  <Badge variant="outline" className="text-[10px]">12.5% CR</Badge>
                </div>
              </div>
              <Progress value={85} className="h-3 bg-blue-50" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Onboarding Completed</span>
                <div className="flex gap-2 items-center">
                  <span>{funnelData?.onboarding_completed}</span>
                  <Badge variant="outline" className="text-[10px]">68% CR</Badge>
                </div>
              </div>
              <Progress value={58} className="h-3 bg-blue-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">First AI Message</span>
                <div className="flex gap-2 items-center">
                  <span>{funnelData?.first_ai_message}</span>
                  <Badge variant="outline" className="text-[10px]">92% CR</Badge>
                </div>
              </div>
              <Progress value={53} className="h-3 bg-blue-200" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">First Session Booked</span>
                <div className="flex gap-2 items-center">
                  <span>{funnelData?.first_session_booked}</span>
                  <Badge variant="default" className="text-[10px]">24% CR</Badge>
                </div>
              </div>
              <Progress value={12} className="h-3 bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{growth?.total_users}</div>
              <p className="text-xs text-muted-foreground">+{growth?.new_this_week} this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users by Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {growth?.users_by_plan?.map((plan: any) => (
                <div key={plan.name} className="flex justify-between text-sm items-center py-1">
                  <span className="capitalize">{plan.name}</span>
                  <span className="font-semibold">{plan.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Marketing Campaigns</CardTitle>
            <CardDescription>Performance tracking for active marketing channels</CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No campaigns yet. Click "New Campaign" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {campaign.type || 'Social'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.budget ? `$${Number(campaign.budget).toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(campaign)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(campaign.id, campaign.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Campaign Name *</Label>
              <Input placeholder="e.g. Q2 LinkedIn Push" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Channel / Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v ?? "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v ?? "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Budget (USD) <span className="text-muted-foreground text-xs">optional</span></Label>
              <Input type="number" min={0} placeholder="e.g. 5000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editingId ? "Update" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
