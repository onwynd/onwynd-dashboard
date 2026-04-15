import client from "./client";
import type { OrgSubscription, Organisation } from "@/types/orgSubscription";
import type { OrgProfile } from "@/types/groupSession";

export const orgSubscriptionApi = {
  /** Get the active subscription / plan for an organisation */
  async getActivePlan(orgId: string | number): Promise<OrgSubscription | null> {
    try {
      const response = await client.get(
        `/api/v1/institutional/organizations/${orgId}/subscription`
      );
      return response.data?.data ?? response.data ?? null;
    } catch {
      return null;
    }
  },

  /** Returns true if the org has group session creation enabled and credits remain */
  async hasGroupSessionAccess(orgId: string | number): Promise<boolean> {
    const plan = await orgSubscriptionApi.getActivePlan(orgId);
    if (!plan || !["active", "trial"].includes(plan.status)) return false;

    const features = plan.features ?? plan.plan?.features;
    if (!features?.group_session_creation) return false;

    const credits =
      plan.credits_remaining ??
      plan.quota_balance ??
      features.group_session_credits;
    if (credits === "unlimited") return true;
    return (typeof credits === "number" ? credits : 0) > 0;
  },

  /** Returns credits remaining (number or 'unlimited') */
  async getCreditsRemaining(
    orgId: string | number
  ): Promise<number | "unlimited"> {
    const plan = await orgSubscriptionApi.getActivePlan(orgId);
    if (!plan) return 0;
    const features = plan.features ?? plan.plan?.features;
    const credits =
      plan.credits_remaining ??
      plan.quota_balance ??
      features?.group_session_credits;
    if (credits === "unlimited") return "unlimited";
    return typeof credits === "number" ? credits : 0;
  },

  /**
   * Register a new external organisation and request ops review.
   * Returns the created org record.
   */
  async registerExternalOrg(
    profile: OrgProfile
  ): Promise<{ org: Organisation; verificationToken?: string }> {
    const response = await client.post(
      "/api/v1/institutional/organizations",
      {
        name: profile.name,
        rep_name: profile.repName,
        rep_email: profile.repEmail,
        department: profile.department,
        billing_contact: profile.billingContact,
        expected_size: profile.expectedSize,
        type: "external",
        status: "pending",
      }
    );
    return response.data?.data ?? response.data;
  },

  /** Verify org email using the token sent to the rep's email */
  async verifyOrgEmail(orgId: string | number, token: string): Promise<void> {
    await client.post(
      `/api/v1/institutional/organizations/${orgId}/verify-email`,
      { token }
    );
  },
};
