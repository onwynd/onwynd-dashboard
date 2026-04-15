"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orgSubscriptionApi } from "@/lib/api/orgSubscription";
import type { OrgProfile } from "@/types/groupSession";
import type { Organisation } from "@/types/orgSubscription";

interface ExternalOrgRegistrationFormProps {
  onRegistered: (org: Organisation) => void;
}

const EMPTY: OrgProfile = {
  name: "",
  repName: "",
  repEmail: "",
  department: "",
  billingContact: "",
  expectedSize: 0,
  emailVerified: false,
  onwyndVerified: false,
};

type FieldErrors = Partial<Record<keyof OrgProfile, string>>;

function validate(profile: OrgProfile): FieldErrors {
  const errors: FieldErrors = {};
  if (!profile.name.trim()) errors.name = "Organisation name is required";
  if (!profile.repName.trim()) errors.repName = "Your name is required";
  if (!profile.repEmail.trim()) errors.repEmail = "Work email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.repEmail))
    errors.repEmail = "Enter a valid email";
  if (!profile.department.trim()) errors.department = "Department is required";
  if (!profile.expectedSize || profile.expectedSize < 2)
    errors.expectedSize = "Minimum group size is 2";
  return errors;
}

export function ExternalOrgRegistrationForm({
  onRegistered,
}: ExternalOrgRegistrationFormProps) {
  const [form, setForm] = useState<OrgProfile>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof OrgProfile, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await orgSubscriptionApi.registerExternalOrg(form);
      setSuccess(true);
      const org = result.org ?? (result as unknown as Organisation);
      onRegistered(org);
    } catch {
      setErrors({ name: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2
          size={40}
          className="mx-auto mb-4"
          style={{ color: "var(--teal)" }}
        />
        <h3 className="text-base font-bold text-foreground mb-2">
          Check your work email to verify your organisation
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We&apos;ve sent a verification link to{" "}
          <strong>{form.repEmail}</strong>. We&apos;ll be in touch shortly to
          set up your account. You can continue browsing in the meantime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground mb-1">
          Tell us about your organisation
        </h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll set up your organisation account so future bookings are
          even faster.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Organisation name"
          id="org-name"
          value={form.name}
          onChange={(v) => set("name", v)}
          error={errors.name}
          placeholder="Acme Corp / Lagos University"
        />
        <Field
          label="Your name"
          id="rep-name"
          value={form.repName}
          onChange={(v) => set("repName", v)}
          error={errors.repName}
          placeholder="Full name"
        />
        <Field
          label="Work email"
          id="rep-email"
          type="email"
          value={form.repEmail}
          onChange={(v) => set("repEmail", v)}
          error={errors.repEmail}
          placeholder="you@company.com"
        />
        <Field
          label="Department"
          id="department"
          value={form.department}
          onChange={(v) => set("department", v)}
          error={errors.department}
          placeholder="HR / Student Affairs"
        />
        <Field
          label="Expected group size"
          id="expected-size"
          type="number"
          value={form.expectedSize ? String(form.expectedSize) : ""}
          onChange={(v) => set("expectedSize", parseInt(v, 10) || 0)}
          error={errors.expectedSize}
          placeholder="e.g. 8"
        />
        <Field
          label="Billing contact email (optional)"
          id="billing-contact"
          type="email"
          value={form.billingContact}
          onChange={(v) => set("billingContact", v)}
          error={errors.billingContact}
          placeholder="billing@company.com"
        />
      </div>

      {errors.name && Object.keys(errors).length === 1 && (
        <p className="text-xs text-destructive">{errors.name}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto"
        style={{ backgroundColor: "var(--teal)", color: "#fff" }}
      >
        {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
        Submit organisation details
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
