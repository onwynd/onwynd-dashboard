import type { SessionModeId } from "@/lib/constants/groupSessionModes";

export type { SessionModeId };

export type OrganiserType = "internal_org" | "external_org" | "individual";

export type BillingMode =
  | "org_wallet"
  | "org_invoice"
  | "upfront_external"
  | "personal_split"
  | "personal_full";

export type GroupSessionStatus =
  | "draft"
  | "soft_hold"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "scheduled"
  | "completed";

export type PaymentModel = "split" | "full";

export type InitiatorType = "user" | "therapist";

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly";

export interface OrgProfile {
  name: string;
  repName: string;
  repEmail: string;
  department: string;
  billingContact: string;
  expectedSize: number;
  emailVerified: boolean;
  onwyndVerified: boolean;
}

export interface GroupParticipant {
  userId?: number;
  guestEmail?: string;
  guestName?: string;
  inviteToken?: string;
  inviteStatus: "pending" | "accepted" | "declined";
  coupleRole?: "partner_1" | "partner_2";
  paymentStatus: "pending" | "paid" | "not_required";
  joinedAt?: string;
  paidAt?: string;
  paymentRef?: string;
  shareAmount?: number;
}

export interface GroupSessionTherapist {
  uuid: string;
  user: {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    profile_photo: string | null;
  };
  rating_average?: number;
  session_rate?: number;
  currency?: string;
}

/** Matches the backend GroupSession model shape */
export interface GroupSession {
  id: number;
  uuid: string;
  title: string;
  description: string;
  mode?: SessionModeId;
  session_type: "open" | "couple" | "corporate" | "university" | "family" | "friends";
  therapist_id?: number;
  organiser_id?: number;
  organiser_type?: OrganiserType;
  initiator_type?: InitiatorType;
  organisation_id?: number;
  billing_mode?: BillingMode;
  payment_model?: PaymentModel;
  declared_size?: number;
  min_participants?: number;
  max_participants: number;
  current_participants: number;
  total_fee?: number;
  price_per_seat_kobo: number;
  status: GroupSessionStatus;
  soft_hold_expires_at?: string;
  invite_token?: string;
  invite_link?: string;
  is_recurring?: boolean;
  series_id?: string;
  recurrence_frequency?: RecurrenceFrequency;
  requires_ops_review?: boolean;
  plan_credits_consumed?: boolean;
  is_org_covered?: boolean;
  language?: string;
  topic_tags?: string[];
  duration_minutes?: number;
  scheduled_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  therapist?: GroupSessionTherapist;
  participants?: GroupParticipant[];
  organisation?: { id: number; name: string };
}

export interface CreateGroupSessionPayload {
  title: string;
  description: string;
  session_type: GroupSession["session_type"];
  therapist_id?: number;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  price_per_seat_kobo: number;
  is_recurring?: boolean;
  recurrence_rule?: string;
  language?: string;
  topic_tags?: string[];
  is_org_covered?: boolean;
  my_couple_role?: "partner_1" | "partner_2";
  partner_email?: string;
  partner_name?: string;
  payment_model?: PaymentModel;
  organiser_type?: OrganiserType;
}

export interface InviteParticipantPayload {
  email: string;
  name?: string;
  role?: "participant" | "observer";
  couple_role?: "partner_1" | "partner_2";
}

export interface GroupSessionJoinResult {
  session_uuid: string;
  payment_required: boolean;
}
