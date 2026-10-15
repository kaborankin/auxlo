import type {
  Pot,
  PotMember,
  PotCycle,
  PotWeek,
  PotPosition,
  Contribution,
  UserProfile,
  PotPayoutMethod,
  PotCycleStatus,
  PotMemberStatus,
  PotWeekStatus,
  ContributionStatus,
  PotPositionStatus,
} from '@prisma/client';

/**
 * Pajo (rotation thrift / susu / ajo) backend domain model.
 *
 * Mirrors the convention in `lib/dashboard`: pages consume these shapes via
 * the getters in `lib/pajo/queries.ts`. Unlike the Auxlo demo dashboard,
 * this data layer is Prisma-backed from day one — this pot is real money.
 *
 * Core engine principle: Pajo knows what a rotating savings pot is, not what
 * a "£50 thrift" is. Every pot is a configuration (amount, frequency, member
 * count) and every financial figure is derived from contribution rows —
 * never hard-coded. The payout recipient is exempt from contributing in
 * their own week, so payout = sum(amountDue of the other members).
 */

export type {
  PotPayoutMethod,
  PotCycleStatus,
  PotMemberStatus,
  PotWeekStatus,
  ContributionStatus,
  PotPositionStatus,
};

export type PotMemberWithUser = PotMember & { user: UserProfile };
export type PotPositionWithMember = PotPosition & { member: PotMemberWithUser };

export type PotWeekWithContributions = PotWeek & {
  contributions: (Contribution & { member: PotMemberWithUser })[];
  recipient: PotMemberWithUser | null;
};

export type PotCycleWithWeeks = PotCycle & {
  weeks: PotWeekWithContributions[];
  positions: PotPositionWithMember[];
};

export type PotWithRelations = Pot & {
  members: PotMemberWithUser[];
  cycles: PotCycleWithWeeks[];
};

/** Derived status for "this week", combining grace period math with DB status. */
export type WeekLiveStatus =
  | 'upcoming'
  | 'open'
  | 'grace'
  | 'late'
  | 'closed'
  | 'paid-out';

export interface ContributionRow {
  contributionId: string;
  memberId: string;
  /** The member's UserProfile id — used to render the row's "I've paid" action. */
  userId: string;
  memberName: string;
  amountDue: number;
  amountPaid: number;
  status: ContributionStatus;
  strikeCount: number;
  paidAt: string | null;
  reference: string | null;
}

export interface WeekSummary {
  weekId: string;
  weekNumber: number;
  dueDate: string; // ISO
  graceDeadline: string; // ISO
  liveStatus: WeekLiveStatus;
  recipientId: string | null;
  recipientName: string | null;
  recipientPosition: number | null;
  payoutAmount: number; // expected collection = sum(amountDue) — recipient exempt
  totalCollected: number;
  totalExpected: number;
  paidCount: number; // contributors who have paid (excludes exempt recipient)
  expectedCount: number; // contributors expected (active members minus recipient)
  contributions: ContributionRow[];
}

export interface MemberSummary {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  position: number | null;
  positionStatus: PotPositionStatus | null;
  strikes: number;
  totalContributed: number;
  totalReceived: number;
  status: PotMemberStatus;
  rulesAccepted: boolean;
  hasReceivedPayout: boolean;
}

export interface PotOverview {
  pot: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    contributionAmount: number;
    currency: string;
    memberTarget: number;
    frequency: string;
    dueDay: number;
    dueTime: string;
    graceHours: number;
    lateFeeAmount: number;
    payoutMethod: PotPayoutMethod;
    status: string;
    rulesText: string | null;
  };
  activeCycle: {
    id: string;
    cycleNumber: number;
    startDate: string;
    status: PotCycleStatus;
    totalWeeks: number;
  } | null;
  currentWeek: WeekSummary | null;
  nextRecipient: { memberId: string; name: string; position: number; amount: number } | null;
  memberCount: number;
  weeklyPayout: number; // expected payout = amount × (members − 1), recipient exempt
  integrityErrors: string[]; // non-empty ⇒ cycle failed the integrity check
}

/** One row of the multi-pot home dashboard "Your circles" table. */
export interface PotCircleCard {
  potId: string;
  slug: string;
  name: string;
  currency: string;
  contributionAmount: number;
  frequency: string;
  memberCount: number;
  memberTarget: number;
  liveStatus: WeekLiveStatus | null;
  nextPayoutAmount: number | null;
  nextPayoutDate: string | null;
  nextRecipientName: string | null;
  thisWeekCollected: number;
  thisWeekExpected: number;
}

export interface ActivityItem {
  id: string;
  at: string; // ISO
  kind: 'contribution' | 'payout' | 'late' | 'pot' | 'member' | 'position';
  potName: string | null;
  potSlug: string | null;
  message: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

export interface PajoHomeDashboard {
  displayName: string;
  previewMode: boolean;
  summary: {
    activePots: number;
    currency: string;
    thisWeekCollected: number;
    upcomingPayouts: number;
    outstanding: number;
  };
  circles: PotCircleCard[];
  activity: ActivityItem[];
}

export interface CycleValidationCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export interface CycleValidation {
  cycleId: string;
  valid: boolean;
  checks: CycleValidationCheck[];
  errors: string[];
  stats: {
    members: number;
    weeks: number;
    contributions: number;
    weeklyPayout: number;
    payouts: number;
    payoutsPerMember: number;
  };
}

export interface LedgerEntry {
  weekNumber: number;
  dueDate: string;
  memberName: string;
  amountDue: number;
  amountPaid: number;
  status: ContributionStatus;
  paidAt: string | null;
  reference: string | null;
}
