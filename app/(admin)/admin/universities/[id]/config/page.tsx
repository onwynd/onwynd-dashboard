"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

type FundingModel = "model_a" | "model_b";
type BillingCycle = "monthly" | "semester" | "annual";

type UniversityConfig = {
  id: number;
  name: string;
  type: "university";
  funding_model: FundingModel | null;
  billing_cycle: BillingCycle | null;
  semester_start_month: number | null;
  semester_2_start_month: number | null;
  session_credits_per_student: number;
  session_ceiling_ngn: number;
  domain_auto_join: boolean;
  university_domain: string | null;
  student_id_verification: boolean;
  crisis_notification_email: string | null;
  early_crisis_detection: boolean;
};

export default function UniversityConfigPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<Partial<UniversityConfig>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "universities", id, "config"],
    queryFn: () => adminService.getUniversityConfig(id),
    select: (d: any) => (d?.data ?? d) as UniversityConfig,
  });

  const config = useMemo<UniversityConfig | undefined>(() => {
    if (!data) return undefined;
    return {
      ...data,
      billing_cycle:
        (data.billing_cycle as BillingCycle | null) ??
        (data.funding_model === "model_a" ? "annual" : data.funding_model === "model_b" ? "semester" : null),
    };
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<UniversityConfig>) =>
      adminService.updateUniversityConfig(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "universities", id, "config"] });
    },
  });

  const current = { ...config, ...local } as UniversityConfig | undefined;

  const showSemesterFields = current?.billing_cycle === "semester";
  const warnings: string[] = [];
  if (!current?.crisis_notification_email) {
    warnings.push("This university cannot go live until a crisis alert email is configured.");
  }
  if (current?.domain_auto_join && !current?.university_domain) {
    warnings.push("Add the university email domain to activate auto-join.");
  }

  const handleSave = () => {
    const payload: Partial<UniversityConfig> = {
      funding_model: current?.funding_model ?? null,
      billing_cycle: current?.billing_cycle ?? null,
      semester_start_month: current?.semester_start_month ?? null,
      semester_2_start_month: current?.semester_2_start_month ?? null,
      session_credits_per_student: current?.session_credits_per_student ?? 3,
      session_ceiling_ngn: current?.session_ceiling_ngn ?? 15000,
      domain_auto_join: !!current?.domain_auto_join,
      university_domain: current?.domain_auto_join ? (current?.university_domain ?? null) : null,
      student_id_verification: !!current?.student_id_verification,
      crisis_notification_email: current?.crisis_notification_email ?? null,
      early_crisis_detection: true,
    };
    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !current) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Failed to load configuration</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{current.name} — University Configuration</h2>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <Alert key={i} variant="warning" className="items-start">
              <ShieldAlert className="mt-0.5 h-4 w-4" />
              <div>
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>{w}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Funding Model</Label>
            <div className="rounded-lg border p-3 space-y-2">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="funding_model"
                  value="model_a"
                  checked={current.funding_model === "model_a"}
                  onChange={() => setLocal((s) => ({ ...s, funding_model: "model_a", billing_cycle: s.billing_cycle ?? "annual" }))}
                />
                <div>
                  <div className="font-medium">Institution pays (contract billing)</div>
                  <div className="text-muted-foreground text-sm">Students pay nothing; institution is billed.</div>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="funding_model"
                  value="model_b"
                  checked={current.funding_model === "model_b"}
                  onChange={() => setLocal((s) => ({ ...s, funding_model: "model_b", billing_cycle: s.billing_cycle ?? "semester" }))}
                />
                <div>
                  <div className="font-medium">School fees levy (institution collects, remits)</div>
                  <div className="text-muted-foreground text-sm">Identical student experience; semester invoice trigger.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 opacity-60">
                <input type="radio" name="funding_model" disabled />
                <div>
                  <div className="font-medium">Student pays directly (D2C)</div>
                  <div className="text-muted-foreground text-sm">
                    Not configurable here — D2C has no organization record.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <Select
              value={current.billing_cycle ?? ""}
              onValueChange={(v: string | null) => setLocal((s) => ({ ...s, billing_cycle: (v as BillingCycle) || null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Default for Model A: Annual. Default for Model B: Semester.
            </div>
          </div>

          {showSemesterFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester 1 Start Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={current.semester_start_month ?? ""}
                  onChange={(e) => setLocal((s) => ({ ...s, semester_start_month: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="1-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Semester 2 Start Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={current.semester_2_start_month ?? ""}
                  onChange={(e) => setLocal((s) => ({ ...s, semester_2_start_month: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="1-12"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Session Credits Per Student</Label>
              <Input
                type="number"
                min={0}
                max={12}
                value={current.session_credits_per_student ?? 3}
                onChange={(e) => setLocal((s) => ({ ...s, session_credits_per_student: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Per-Session Coverage Ceiling (₦)</Label>
              <Input
                type="number"
                min={0}
                value={current.session_ceiling_ngn ?? 15000}
                onChange={(e) => setLocal((s) => ({ ...s, session_ceiling_ngn: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="font-medium">Email Domain Auto-Join</div>
              <div className="text-sm text-muted-foreground">
                Automatically link signups from the university domain to this org.
              </div>
            </div>
            <Switch
              checked={!!current.domain_auto_join}
              onCheckedChange={(val) => setLocal((s) => ({ ...s, domain_auto_join: val }))}
            />
          </div>
          {current.domain_auto_join && (
            <div className="space-y-2">
              <Label>University Email Domain</Label>
              <Input
                placeholder="e.g., uniport.edu.ng"
                value={current.university_domain ?? ""}
                onChange={(e) => setLocal((s) => ({ ...s, university_domain: e.target.value || null }))}
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="font-medium">Require Matriculation Number Verification</div>
              <div className="text-sm text-muted-foreground">
                Students must submit matric number; admin approves in Student Verifications.
              </div>
            </div>
            <Switch
              checked={!!current.student_id_verification}
              onCheckedChange={(val) => setLocal((s) => ({ ...s, student_id_verification: val }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Crisis Alert Recipient (Student Affairs)</Label>
            <Input
              type="email"
              placeholder="name@university.edu.ng"
              value={current.crisis_notification_email ?? ""}
              onChange={(e) => setLocal((s) => ({ ...s, crisis_notification_email: e.target.value || null }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 opacity-70">
            <div className="space-y-1">
              <div className="font-medium">Crisis Detection</div>
              <div className="text-sm text-muted-foreground">
                Mandatory for all university accounts and cannot be disabled.
              </div>
            </div>
            <Switch checked={true} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

