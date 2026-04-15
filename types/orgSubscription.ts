export type PlanTier = "free" | "starter" | "growth" | "enterprise";
export type PlanStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "trial"
  | "pending";

export interface PlanFeatures {
  group_session_creation: boolean;
  max_group_sessions_per_month: number | "unlimited";
  group_session_credits: number | "unlimited";
  recurring_sessions_enabled: boolean;
  roster_import_enabled: boolean;
  max_participants_per_session: number;
  corporate_billing_enabled: boolean;
  priority_therapist_matching: boolean;
}

/** Matches the backend InstitutionalSubscription / OrgSubscription shape */
export interface OrgSubscription {
  id: string | number;
  org_id?: string | number;
  plan_id?: string | number;
  plan_tier?: PlanTier;
  plan_name?: string;
  plan?: { name: string; slug?: string; tier?: PlanTier; features?: PlanFeatures };
  status: PlanStatus;
  features?: PlanFeatures;
  credits_remaining?: number | "unlimited";
  credits_used_this_month?: number;
  renews_at?: string;
  cancelled_at?: string;
  trial_ends_at?: string;
  created_at?: string;
  // Aliases from backend
  quota_balance?: number;
  next_billing_date?: string;
}

export interface Organisation {
  id: string | number;
  name: string;
  type: "corporate" | "university" | "external";
  status: "pending" | "verified" | "active";
  admin_uids?: string[];
  member_uids?: string[];
  current_plan_id?: string;
  domain?: string;
  created_at?: string;
  verified_at?: string;
}
