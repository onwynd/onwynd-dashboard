export type SessionModeId =
  | "couples"
  | "family"
  | "friends"
  | "corporate"
  | "university";

export interface SessionModeConfig {
  id: SessionModeId;
  label: string;
  icon: string;
  description: string;
  minParticipants: number;
  maxParticipants: number;
  fixedSize: boolean;
  cancelHours: number;
  payImmediate: boolean;
  requiresOrgPlan: boolean;
  tone: "warm" | "nurturing" | "casual" | "formal" | "supportive";
}

export const SESSION_MODES: SessionModeConfig[] = [
  {
    id: "couples",
    label: "Couples Therapy",
    icon: "💑",
    description: "Two partners, relational focus",
    minParticipants: 2,
    maxParticipants: 2,
    fixedSize: true,
    cancelHours: 48,
    payImmediate: true,
    requiresOrgPlan: false,
    tone: "warm",
  },
  {
    id: "family",
    label: "Family Therapy",
    icon: "👨‍👩‍👧‍👦",
    description: "Multi-member family sessions",
    minParticipants: 2,
    maxParticipants: 8,
    fixedSize: false,
    cancelHours: 48,
    payImmediate: true,
    requiresOrgPlan: false,
    tone: "nurturing",
  },
  {
    id: "friends",
    label: "Friends / Community",
    icon: "🫂",
    description: "Peer groups, private invite link",
    minParticipants: 3,
    maxParticipants: 12,
    fixedSize: false,
    cancelHours: 48,
    payImmediate: false,
    requiresOrgPlan: false,
    tone: "casual",
  },
  {
    id: "corporate",
    label: "Corporate Wellness",
    icon: "🏢",
    description: "Workplace wellness and team sessions",
    minParticipants: 4,
    maxParticipants: 20,
    fixedSize: false,
    cancelHours: 72,
    payImmediate: false,
    requiresOrgPlan: true,
    tone: "formal",
  },
  {
    id: "university",
    label: "University Group",
    icon: "🎓",
    description: "Student mental health sessions",
    minParticipants: 3,
    maxParticipants: 20,
    fixedSize: false,
    cancelHours: 72,
    payImmediate: false,
    requiresOrgPlan: true,
    tone: "supportive",
  },
];

export function getSessionMode(id: SessionModeId): SessionModeConfig {
  const mode = SESSION_MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`Unknown session mode: ${id}`);
  return mode;
}

/** Modes available to individual (non-org) users */
export const INDIVIDUAL_MODES: SessionModeConfig[] = SESSION_MODES.filter(
  (m) => (["couples", "family", "friends"] as SessionModeId[]).includes(m.id)
);

/** Modes that require an org plan */
export const ORG_MODES: SessionModeConfig[] = SESSION_MODES.filter(
  (m) => (["corporate", "university"] as SessionModeId[]).includes(m.id)
);
