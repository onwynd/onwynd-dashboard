"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, Plus, RefreshCw, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { okrService } from "@/lib/api/okr";
import { OkrCompanyHealthWidget } from "@/components/okr/OkrCompanyHealthWidget";
import { OkrCreateKeyResultModal } from "@/components/okr/OkrCreateKeyResultModal";
import { OkrCreateObjectiveModal } from "@/components/okr/OkrCreateObjectiveModal";
import { OkrObjectiveCard } from "@/components/okr/OkrObjectiveCard";
import type {
  OkrKeyResult,
  OkrObjective,
  OkrObjectivesResponse,
} from "@/types/okr";

const DEFAULT_ALLOWED_ROLES = [
  "ceo",
  "coo",
  "cgo",
  "cfo",
  "vp_sales",
  "vp_marketing",
  "vp_operations",
  "vp_product",
  "admin",
  "super_admin",
  "founder",
];

const DEFAULT_MANAGE_ROLES = [
  "ceo",
  "coo",
  "cgo",
  "cfo",
  "vp_sales",
  "vp_marketing",
  "vp_operations",
  "vp_product",
  "admin",
  "super_admin",
  "founder",
];

const DEFAULT_EXEC_ROLES = ["ceo", "coo", "cgo", "admin", "super_admin", "founder"];

interface OkrPageContentProps {
  okrHref?: string;
  allowedRoles?: string[];
  manageRoles?: string[];
  execRoles?: string[];
}

function currentQuarter(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  return `Q${m <= 3 ? 1 : m <= 6 ? 2 : m <= 9 ? 3 : 4}-${y}`;
}

function quarterOptions(): string[] {
  const out: string[] = [];
  const year = new Date().getFullYear();
  for (let y = year - 1; y <= year + 1; y += 1) {
    for (let q = 1; q <= 4; q += 1) out.push(`Q${q}-${y}`);
  }
  return out;
}

export function OkrPageContent({
  okrHref = "/okr",
  allowedRoles = DEFAULT_ALLOWED_ROLES,
  manageRoles = DEFAULT_MANAGE_ROLES,
  execRoles = DEFAULT_EXEC_ROLES,
}: OkrPageContentProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  const [quarter, setQuarter] = useState(currentQuarter);
  const [data, setData] = useState<OkrObjectivesResponse | null>(null);
  const [objectives, setObjectives] = useState<OkrObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateObj, setShowCreateObj] = useState(false);
  const [createKrForObj, setCreateKrForObj] = useState<number | null>(null);

  const isAllowed = useMemo(
    () => allowedRoles.some((role) => hasRole(role)),
    [allowedRoles, hasRole],
  );
  const canManage = useMemo(
    () => manageRoles.some((role) => hasRole(role)),
    [manageRoles, hasRole],
  );
  const isExec = useMemo(
    () => execRoles.some((role) => hasRole(role)),
    [execRoles, hasRole],
  );

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !isAllowed) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, isAllowed, router]);

  const loadData = async (q: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await okrService.getObjectives(q);
      if (res) {
        setData(res);
        setObjectives(res.objectives ?? []);
      }
    } catch {
      // handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAllowed) loadData(quarter);
  }, [quarter, isAuthenticated, isAllowed]);

  const handleObjectiveCreated = (obj: OkrObjective) => {
    setObjectives((prev) => [obj, ...prev]);
    setShowCreateObj(false);
  };

  const handleKrCreated = (kr: OkrKeyResult) => {
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === createKrForObj
          ? { ...obj, key_results: [...(obj.key_results ?? []), kr] }
          : obj,
      ),
    );
    setCreateKrForObj(null);
  };

  if (!isAuthenticated || !isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#9bb068] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#4b3425] flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1f160f]">OKRs</h1>
          </div>
          <p className="text-sm text-[rgba(31,22,15,0.5)]">
            Objectives, Key Results and Initiatives - {quarter}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="px-3 py-2 text-sm font-semibold rounded-xl border border-[rgba(31,22,15,0.12)] bg-white text-[#1f160f] focus:outline-none focus:ring-2 focus:ring-[#9bb068]/40"
          >
            {quarterOptions().map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadData(quarter, true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[rgba(31,22,15,0.12)] bg-white text-[rgba(31,22,15,0.5)] hover:text-[#4b3425] disabled:opacity-40 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {isExec && (
            <button
              onClick={() => setShowCreateObj(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4b3425] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Objective
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <OkrCompanyHealthWidget quarter={quarter} okrHref={okrHref} />

          {data && (
            <div className="rounded-2xl bg-white border border-[rgba(31,22,15,0.08)] shadow-sm p-4 space-y-3">
              <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] tracking-widest uppercase">
                Quick Stats
              </p>
              {[
                {
                  icon: Target,
                  label: "Objectives",
                  value: objectives.length,
                },
                {
                  icon: BarChart2,
                  label: "Key Results",
                  value: objectives.reduce(
                    (acc, o) => acc + (o.key_results?.length ?? 0),
                    0,
                  ),
                },
                {
                  icon: TrendingUp,
                  label: "Avg Progress",
                  value: `${Math.round(
                    objectives.reduce((acc, o) => acc + (o.progress ?? 0), 0) /
                      Math.max(objectives.length, 1),
                  )}%`,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(31,22,15,0.05)] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[rgba(31,22,15,0.4)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-[rgba(31,22,15,0.4)]">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#1f160f]">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border border-[rgba(31,22,15,0.08)] p-5 animate-pulse"
                >
                  <div className="h-4 bg-[rgba(31,22,15,0.08)] rounded-lg w-1/2 mb-3" />
                  <div className="h-2 bg-[rgba(31,22,15,0.08)] rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : objectives.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[rgba(31,22,15,0.08)] p-10 text-center">
              <Target className="w-8 h-8 text-[rgba(31,22,15,0.2)] mx-auto mb-2" />
              <p className="text-sm text-[rgba(31,22,15,0.5)]">
                No objectives created yet.
              </p>
            </div>
          ) : (
            objectives.map((obj) => (
              <OkrObjectiveCard
                key={obj.id}
                objective={obj}
                canManage={canManage}
                onAddKR={(objectiveId) => setCreateKrForObj(objectiveId)}
                onAddInitiative={() => {}}
                onKrUpdated={(kr) => {
                  setObjectives((prev) =>
                    prev.map((o) =>
                      o.id === obj.id
                        ? {
                            ...o,
                            key_results: (o.key_results ?? []).map((k) =>
                              k.id === kr.id ? kr : k,
                            ),
                          }
                        : o,
                    ),
                  );
                }}
              />
            ))
          )}
        </div>
      </div>

      {showCreateObj && (
        <OkrCreateObjectiveModal
          quarter={quarter}
          onClose={() => setShowCreateObj(false)}
          onCreated={handleObjectiveCreated}
        />
      )}

      {createKrForObj !== null && (
        <OkrCreateKeyResultModal
          objectiveId={createKrForObj}
          onClose={() => setCreateKrForObj(null)}
          onCreated={handleKrCreated}
        />
      )}
    </div>
  );
}
