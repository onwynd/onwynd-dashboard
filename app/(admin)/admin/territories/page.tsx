"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, Users, MapPin } from "lucide-react";

interface Territory {
  id: number;
  name: string;
  code?: string;
  type: string;
  parent_id?: number;
  country: string;
  description?: string;
  is_active: boolean;
  parent?: { id: number; name: string };
  agents?: AgentPivot[];
  children?: Territory[];
}

interface AgentPivot {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  pivot: { role: string; is_primary: boolean };
}

interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const TERRITORY_TYPES = ["region", "zone", "state", "city", "lga", "area", "school", "custom"];

const AGENT_ROLES = [
  { value: "sales_rep",        label: "Sales Rep" },
  { value: "territory_lead",   label: "Territory Lead" },
  { value: "city_agent",       label: "City Agent" },
  { value: "lga_agent",        label: "LGA Agent" },
  { value: "area_agent",       label: "Area Agent" },
  { value: "school_agent",     label: "School Agent" },
  { value: "zone_manager",     label: "Zone Manager" },
  { value: "regional_manager", label: "Regional Manager" },
];

const TYPE_COLORS: Record<string, string> = {
  region: "bg-purple-100 text-purple-700",
  zone:   "bg-blue-100 text-blue-700",
  state:  "bg-cyan-100 text-cyan-700",
  city:   "bg-green-100 text-green-700",
  lga:    "bg-lime-100 text-lime-700",
  area:   "bg-yellow-100 text-yellow-700",
  school: "bg-orange-100 text-orange-700",
  custom: "bg-gray-100 text-gray-700",
};

const EMPTY_FORM = { name: "", code: "", type: "city", parent_id: "", description: "" };

export default function TerritoriesPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  // Create/Edit dialog
  const [editTarget, setEditTarget] = useState<Territory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Manage agents sheet
  const [agentSheet, setAgentSheet] = useState<Territory | null>(null);
  const [sheetTerritory, setSheetTerritory] = useState<Territory | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState("sales_rep");
  const [assignPrimary, setAssignPrimary] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([
        adminService.getTerritories(),
        adminService.getSalesAgents(),
      ]);
      setTerritories(Array.isArray(t) ? t : []);
      setAgents(Array.isArray(a) ? a : []);
    } catch {
      toast({ description: "Failed to load territories.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = typeFilter === "all"
    ? territories
    : territories.filter((t) => t.type === typeFilter);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (t: Territory) => {
    setEditTarget(t);
    setForm({
      name: t.name,
      code: t.code ?? "",
      type: t.type,
      parent_id: t.parent_id ? String(t.parent_id) : "",
      description: t.description ?? "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ description: "Name is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        type: form.type,
        code: form.code || null,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        description: form.description || null,
      };
      if (editTarget) {
        const updated = await adminService.updateTerritory(editTarget.id, payload);
        setTerritories((prev) => prev.map((t) => t.id === updated.id ? updated : t));
        toast({ description: "Territory updated." });
      } else {
        const created = await adminService.createTerritory(payload);
        setTerritories((prev) => [created, ...prev]);
        toast({ description: "Territory created." });
      }
      setIsFormOpen(false);
    } catch {
      toast({ description: "Failed to save territory.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (t: Territory) => {
    if (!confirm(`Deactivate "${t.name}"?`)) return;
    try {
      await adminService.deactivateTerritory(t.id);
      setTerritories((prev) => prev.map((x) => x.id === t.id ? { ...x, is_active: false } : x));
      toast({ description: "Territory deactivated." });
    } catch {
      toast({ description: "Failed to deactivate.", variant: "destructive" });
    }
  };

  const openAgentSheet = async (t: Territory) => {
    setAgentSheet(t);
    setSheetLoading(true);
    setAssignUserId("");
    setAssignRole("sales_rep");
    setAssignPrimary(false);
    try {
      const detail = await adminService.getTerritoryDetail(t.id);
      setSheetTerritory(detail);
    } catch {
      setSheetTerritory(t);
    } finally {
      setSheetLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!agentSheet || !assignUserId) return;
    setAssigning(true);
    try {
      await adminService.assignAgentsToTerritory(agentSheet.id, [
        { user_id: Number(assignUserId), role: assignRole, is_primary: assignPrimary },
      ]);
      const updated = await adminService.getTerritoryDetail(agentSheet.id);
      setSheetTerritory(updated);
      setTerritories((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      toast({ description: "Agent assigned." });
      setAssignUserId("");
    } catch {
      toast({ description: "Failed to assign agent.", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAgent = async (userId: number) => {
    if (!agentSheet) return;
    setSheetLoading(true);
    try {
      await adminService.removeAgentFromTerritory(agentSheet.id, userId);
      setSheetTerritory((prev) =>
        prev ? { ...prev, agents: (prev.agents ?? []).filter((a) => a.id !== userId) } : prev,
      );
      setTerritories((prev) =>
        prev.map((t) =>
          t.id === agentSheet.id
            ? { ...t, agents: (t.agents ?? []).filter((a) => a.id !== userId) }
            : t,
        ),
      );
      toast({ description: "Agent removed." });
    } catch {
      toast({ description: "Failed to remove agent.", variant: "destructive" });
    } finally {
      setSheetLoading(false);
    }
  };

  // Agents not yet assigned to this territory
  const assignedIds = new Set((sheetTerritory?.agents ?? []).map((a) => a.id));
  const availableAgents = agents.filter((a) => !assignedIds.has(a.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Territories</h1>
          <p className="text-muted-foreground">Create and manage sales territories, and assign agents.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Territory
        </Button>
      </div>

      {/* Type filter tabs */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {TERRITORY_TYPES.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No territories found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className={!t.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {t.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.code ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[t.type] ?? "bg-gray-100 text-gray-700"}`}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.parent?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {t.agents?.length ?? 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.is_active ? "default" : "secondary"}>
                        {t.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openAgentSheet(t)}>
                          Agents
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {t.is_active && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeactivate(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => !o && setIsFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? `Edit: ${editTarget.name}` : "New Territory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lagos Island" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. LAG-ISL" />
              </div>
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v: string | null) => v && setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERRITORY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Parent Territory <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={form.parent_id} onValueChange={(v: string | null) => v != null && setForm({ ...form, parent_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {territories
                    .filter((t) => t.is_active && t.id !== editTarget?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name} ({t.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this territory"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editTarget ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Management Sheet */}
      <Sheet open={!!agentSheet} onOpenChange={(o) => !o && setAgentSheet(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{agentSheet?.name}</SheetTitle>
            <SheetDescription className="capitalize">{agentSheet?.type} territory — agent assignments</SheetDescription>
          </SheetHeader>

          {sheetLoading && !sheetTerritory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Assigned agents */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Assigned Agents ({sheetTerritory?.agents?.length ?? 0})
                </h3>
                {(sheetTerritory?.agents?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No agents assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(sheetTerritory?.agents ?? []).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {agent.first_name} {agent.last_name}
                            </span>
                            {agent.pivot.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {AGENT_ROLES.find((r) => r.value === agent.pivot.role)?.label ?? agent.pivot.role}
                            {" · "}{agent.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAgent(agent.id)}
                          disabled={sheetLoading}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign agent */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-semibold">Add Agent</h3>
                <div className="space-y-1">
                  <Label>Sales Agent</Label>
                  <Select value={assignUserId} onValueChange={(v: string | null) => v && setAssignUserId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgents.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.first_name} {a.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Select value={assignRole} onValueChange={(v: string | null) => v && setAssignRole(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGENT_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={assignPrimary} onCheckedChange={setAssignPrimary} id="sheet-primary" />
                  <Label htmlFor="sheet-primary" className="cursor-pointer">Primary assignment</Label>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleAssignAgent}
                  disabled={!assignUserId || assigning}
                >
                  {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Agent
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
