"use client";

import { useEffect, useState, useMemo } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2, Search, Users, MapPin, UserCheck, UserX, Plus, Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Territory {
  id: number;
  name: string;
  code?: string;
  type: string;
  is_active: boolean;
  agents?: AgentPivot[];
}

interface AgentPivot {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  pivot: { role: string; is_primary: boolean };
}

const AGENT_ROLES = [
  { value: "sales_rep",          label: "Sales Rep" },
  { value: "territory_lead",     label: "Territory Lead" },
  { value: "city_agent",         label: "City Agent" },
  { value: "lga_agent",          label: "LGA Agent" },
  { value: "area_agent",         label: "Area Agent" },
  { value: "school_agent",       label: "School Agent" },
  { value: "zone_manager",       label: "Zone Manager" },
  { value: "regional_manager",   label: "Regional Manager" },
];

export default function SalesAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Sheet state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentTerritories, setAgentTerritories] = useState<{ territory: Territory; role: string; is_primary: boolean }[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);

  // Assign form
  const [assignTerritoryId, setAssignTerritoryId] = useState("");
  const [assignRole, setAssignRole] = useState("sales_rep");
  const [assignPrimary, setAssignPrimary] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([adminService.getSalesAgents(), adminService.getTerritories()])
      .then(([a, t]) => {
        setAgents(Array.isArray(a) ? a : []);
        setTerritories(Array.isArray(t) ? t : []);
      })
      .catch(() => toast({ description: "Failed to load data.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  // Build a map: userId → territories they belong to
  const agentTerritoryMap = useMemo(() => {
    const map = new Map<number, { territory: Territory; role: string; is_primary: boolean }[]>();
    for (const t of territories) {
      for (const agent of t.agents ?? []) {
        const existing = map.get(agent.id) ?? [];
        existing.push({ territory: t, role: agent.pivot.role, is_primary: agent.pivot.is_primary });
        map.set(agent.id, existing);
      }
    }
    return map;
  }, [territories]);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  const assigned = agents.filter((a) => (agentTerritoryMap.get(a.id)?.length ?? 0) > 0).length;

  const openSheet = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentTerritories(agentTerritoryMap.get(agent.id) ?? []);
    setAssignTerritoryId("");
    setAssignRole("sales_rep");
    setAssignPrimary(false);
  };

  const handleAssign = async () => {
    if (!selectedAgent || !assignTerritoryId) return;
    setAssigning(true);
    try {
      await adminService.assignAgentsToTerritory(Number(assignTerritoryId), [
        { user_id: selectedAgent.id, role: assignRole, is_primary: assignPrimary },
      ]);
      // Refresh territory detail for this territory and rebuild map
      const res = await adminService.getTerritoryDetail(assignTerritoryId);
      const updated = ((res as any)?.data ?? res) as unknown as Territory;
      setTerritories((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      const newTerritory = territories.find((t) => t.id === Number(assignTerritoryId));
      if (newTerritory) {
        setAgentTerritories((prev) => [
          ...prev.filter((at) => at.territory.id !== Number(assignTerritoryId)),
          { territory: newTerritory, role: assignRole, is_primary: assignPrimary },
        ]);
      }
      toast({ description: "Agent assigned to territory." });
      setAssignTerritoryId("");
    } catch {
      toast({ description: "Failed to assign agent.", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (territoryId: number) => {
    if (!selectedAgent) return;
    setSheetLoading(true);
    try {
      await adminService.removeAgentFromTerritory(territoryId, selectedAgent.id);
      setAgentTerritories((prev) => prev.filter((at) => at.territory.id !== territoryId));
      setTerritories((prev) =>
        prev.map((t) =>
          t.id === territoryId
            ? { ...t, agents: (t.agents ?? []).filter((a) => a.id !== selectedAgent.id) }
            : t,
        ),
      );
      toast({ description: "Agent removed from territory." });
    } catch {
      toast({ description: "Failed to remove agent.", variant: "destructive" });
    } finally {
      setSheetLoading(false);
    }
  };

  // Territories not yet assigned to this agent
  const unassignedTerritories = territories.filter(
    (t) => t.is_active && !agentTerritories.some((at) => at.territory.id === t.id),
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Agents</h1>
        <p className="text-muted-foreground">Manage sales agents and their territory assignments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Agents", value: agents.length, icon: Users, color: "text-primary" },
          { label: "Assigned", value: assigned, icon: UserCheck, color: "text-green-600" },
          { label: "Unassigned", value: agents.length - assigned, icon: UserX, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
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
                <TableHead>Email</TableHead>
                <TableHead>Territories</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No sales agents found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((agent) => {
                  const myTerritories = agentTerritoryMap.get(agent.id) ?? [];
                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">
                        {agent.first_name} {agent.last_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{agent.email}</TableCell>
                      <TableCell>
                        {myTerritories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {myTerritories.slice(0, 3).map(({ territory, is_primary }) => (
                              <Badge
                                key={territory.id}
                                variant={is_primary ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {is_primary && <MapPin className="h-2.5 w-2.5 mr-0.5" />}
                                {territory.name}
                              </Badge>
                            ))}
                            {myTerritories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{myTerritories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agent.created_at
                          ? (() => { try { return format(parseISO(agent.created_at), "MMM d, yyyy"); } catch { return "—"; } })()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openSheet(agent)}>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Territory Management Sheet */}
      <Sheet open={!!selectedAgent} onOpenChange={(o) => !o && setSelectedAgent(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedAgent?.first_name} {selectedAgent?.last_name}
            </SheetTitle>
            <SheetDescription>Manage territory assignments for this agent.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Current territories */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Current Territories ({agentTerritories.length})</h3>
              {agentTerritories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No territories assigned.</p>
              ) : (
                <div className="space-y-2">
                  {agentTerritories.map(({ territory, role, is_primary }) => (
                    <div key={territory.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{territory.name}</span>
                          {is_primary && <Badge variant="default" className="text-xs">Primary</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {territory.type} · {AGENT_ROLES.find((r) => r.value === role)?.label ?? role}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(territory.id)}
                        disabled={sheetLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign to new territory */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Assign to Territory</h3>
              <div className="space-y-1">
                <Label>Territory</Label>
                <Select value={assignTerritoryId} onValueChange={(v: string | null) => v && setAssignTerritoryId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select territory..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedTerritories.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name} <span className="text-muted-foreground text-xs ml-1">({t.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={assignRole} onValueChange={(v: string | null) => v && setAssignRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={assignPrimary} onCheckedChange={setAssignPrimary} id="is-primary" />
                <Label htmlFor="is-primary" className="cursor-pointer">Mark as primary territory</Label>
              </div>
              <Button
                className="w-full gap-2"
                onClick={handleAssign}
                disabled={!assignTerritoryId || assigning}
              >
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Assign
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
