import { addHours, addMonths, isAfter, isBefore } from 'date-fns';
import type { WeekLiveStatus } from './types';

/**
 * Rules engine for the rotating-thrift (susu / ajo) group rules doc, encoded
 * rather than just displayed:
 *  - Recipient exemption: the member receiving the weekly payout does NOT
 *    contribute that week, so the payout equals what the other (N-1) active
 *    members pay in — derived from contributions data, never amount × count.
 *  - 24h grace period after the due date/time
 *  - 1st late: reminder only
 *  - 2nd late: late fee added to the next pot
 *  - 3rd late (or no payment): payout position FORFEITED (recorded, never
 *    deleted) until arrears are cleared
 *  - Leaving early: refund what was paid in, lose payout turn
 */

export const STRIKE_THRESHOLDS = {
  REMINDER: 1,
  LATE_FEE: 2,
  FORFEIT: 3,
} as const;

export function computeGraceDeadline(dueDate: Date, graceHours: number): Date {
  return addHours(dueDate, graceHours);
}

/**
 * Live status of a week, combining the DB status with grace-period math.
 * `dbStatus` is authoritative once a week has been explicitly CLOSED or
 * PAID_OUT (e.g. by the weekly cron); before that we derive OPEN/GRACE/LATE
 * from the clock so the dashboard is accurate between cron runs too.
 */
export function computeWeekLiveStatus(
  dbStatus: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'PAID_OUT',
  dueDate: Date,
  graceHours: number,
  now: Date = new Date(),
): WeekLiveStatus {
  if (dbStatus === 'PAID_OUT') return 'paid-out';
  if (dbStatus === 'CLOSED') return 'closed';
  if (dbStatus === 'UPCOMING') return 'upcoming';

  const graceDeadline = computeGraceDeadline(dueDate, graceHours);
  if (isBefore(now, dueDate)) return 'open';
  if (isBefore(now, graceDeadline)) return 'grace';
  return 'late';
}

/**
 * Given a member's strike count (before this event), decide what escalation
 * applies to a late/missed contribution. Returns the fee to add (if any) and
 * whether the member should forfeit their upcoming payout turn.
 */
export function escalateLatePayment(strikesBefore: number): {
  newStrikeCount: number;
  applyLateFee: boolean;
  forfeitPayout: boolean;
  message: string;
} {
  const newStrikeCount = strikesBefore + 1;

  if (newStrikeCount <= STRIKE_THRESHOLDS.REMINDER) {
    return {
      newStrikeCount,
      applyLateFee: false,
      forfeitPayout: false,
      message: 'Gentle reminder sent — pay within the grace period.',
    };
  }

  if (newStrikeCount === STRIKE_THRESHOLDS.LATE_FEE) {
    return {
      newStrikeCount,
      applyLateFee: true,
      forfeitPayout: false,
      message: 'Second late payment — £5 late fee added to the next pot.',
    };
  }

  return {
    newStrikeCount,
    applyLateFee: false,
    forfeitPayout: true,
    message: 'Third late payment or non-payment — payout turn forfeited until arrears are cleared.',
  };
}

/** Period length in days for simple frequencies; monthly uses addMonths. */
export function advancePeriod(date: Date, frequency: string): Date {
  if (frequency === 'monthly') return addMonths(date, 1);
  if (frequency === 'fortnightly') return addHours(date, 14 * 24);
  return addHours(date, 7 * 24); // weekly (default)
}

/**
 * Expected weekly collection and payout for a recipient-exempt pot:
 * every active member contributes EXCEPT the week's recipient, so the
 * payout = contribution × (activeMembers − 1). Works for any pot size:
 * 12 × £50 → £550, 10 × £50 → £450, 8 × £100 → £700.
 */
export function computePayoutForWeek(contributionAmount: number, activeMembers: number): number {
  return Math.max(0, contributionAmount * (activeMembers - 1));
}

/** Default rules text, matching the group rules doc verbatim in structure. */
export function buildDefaultRulesText(params: {
  amount: number;
  currency: string;
  memberTarget: number;
  dueDay: string;
  dueTime: string;
  graceHours: number;
  lateFeeAmount: number;
}): string {
  const { amount, currency, memberTarget, dueDay, dueTime, graceHours, lateFeeAmount } = params;
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  const weeklyPayout = computePayoutForWeek(amount, memberTarget);
  return `📜 ${symbol}${amount} ${'A WEEK THRIFT'} — GROUP RULES

🔹 1. The Basics
• Contribution: ${symbol}${amount} per member, every week
• Members: ${memberTarget} people total → ${memberTarget} weeks = 1 full cycle
• Weekly payout: ${symbol}${weeklyPayout} — the member receiving the payout does not contribute that week, so the pot equals what the other ${memberTarget - 1} members pay in
• One person receives the payout each week; every active member has exactly one payout position

🔹 2. Payment Details
• Deadline: Every ${dueDay} by ${dueTime}
• Reference: Use your full name so payments are easy to track
• Grace period: ${graceHours} hours — let the admin know early if you can't pay on time

🔹 3. Payout Order
• Once you receive your payout — you STILL contribute every other week until the cycle finishes
• You may swap turns only if both people agree + the whole group is notified

🔹 4. Late or Missed Payments
• 1st late: Gentle reminder — pay within the grace period
• 2nd late: ${symbol}${lateFeeAmount} late fee goes into the next pot
• 3rd late / no payment at all: You forfeit your payout turn and must pay what you owe before the next cycle starts
• If you've already received your pot and stop paying: You must pay back every penny owed — or be replaced + reported to everyone you owe

🔹 5. Joining & Leaving
• No one new joins mid-cycle — new members only at the start of a fresh round
• If you must leave early: You get back what you've paid in — but you lose your payout turn
• Replacement: If someone leaves, the group votes — new member pays what the leaver had already contributed

🔹 6. Admin & Records
• Every contribution + payout is posted so everyone sees it
• No secrets — all money matters are open to the group

🔹 7. Behaviour & Trust
• Respect — no insults, no pressure, no gossip
• Everyone commits for the FULL cycle — only join if you're serious

🔹 8. End of Cycle
• Final week = last collection & final payout
• After that: Start a new cycle with the same or new members — or close the group

Everyone agrees to these rules before sending any money.`;
}
