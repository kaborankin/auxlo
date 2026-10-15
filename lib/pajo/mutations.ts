import crypto from 'crypto';
import prisma from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { buildDefaultRulesText, computePayoutForWeek, escalateLatePayment } from './rules';
import type { PotPayoutMethod, PotMember, PotPosition, PotManagedBy } from '@prisma/client';

/**
 * Cryptographically random, unpredictable invite token — a bearer credential
 * for the pot's join link. Deliberately NOT `cuid()`/`uuid()`: those are
 * designed to be unique, not to resist guessing, and this token is the only
 * thing standing between a private pot and anyone who finds/guesses the URL.
 * 32 bytes -> 64 hex chars gives 256 bits of entropy.
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Default invite link lifetime for newly (re)generated tokens. */
const DEFAULT_INVITE_TTL_DAYS = 30;

function defaultInviteExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_INVITE_TTL_DAYS);
  return d;
}

/**
 * Pajo write side. Every mutation is scoped organization → pot → cycle → week
 * (never just userId) so concurrent pots can't collide, and every money-
 * touching mutation writes an AuditLog entry — the "public list, no secrets"
 * rule is enforced at the data layer, not the UI.
 */

/** Thrown for business-rule violations the caller must surface verbatim. */
export class PajoIntegrityError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'PajoIntegrityError';
    this.code = code;
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'pot';
}

/** First due-date slot at-or-after the configured weekday/time. */
function firstDueDate(startDate: Date, dueDay: number, dueTime: string): Date {
  const [h, m] = dueTime.split(':').map((n) => parseInt(n, 10) || 0);
  const d = new Date(startDate);
  d.setHours(h, m, 0, 0);
  const delta = (dueDay - d.getDay() + 7) % 7;
  if (delta === 0 && d <= new Date(startDate)) d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + delta);
  return d;
}

export interface CreatePotInput {
  organizationId: string;
  slug?: string | null;
  name: string;
  description?: string | null;
  contributionAmount: number;
  currency?: string;
  memberTarget: number;
  frequency?: string;
  dueDay?: number;
  dueTime?: string;
  graceHours?: number;
  lateFeeAmount?: number;
  payoutMethod?: string;
  bankDetails?: any;
  rulesText?: string | null;
  startDate?: string | Date;
  memberUserIds: string[];
  actorId: string;
  actorEmail: string;
  /** TREASURER (default, private invite-only) or PLATFORM (open, discoverable). */
  managedBy?: 'TREASURER' | 'PLATFORM';
  /** Platform pots are listed publicly and accept instant joins. */
  openForJoining?: boolean;
}

/**
 * Create a pot + its first cycle in one transaction. Positions are assigned
 * in member order (1..N) and each week links its position 1:1, so the two
 * UNIQUE(cycleId, position) / UNIQUE(cycleId, memberId) constraints guarantee
 * exactly one payout position per member and no duplicated position numbers.
 * The recipient's own contribution row is created amountDue = 0 with status
 * EXEMPT_RECIPIENT so expected collections always sum correctly.
 */
export async function createPot(input: CreatePotInput) {
  const {
    organizationId, name, contributionAmount,
    currency = 'gbp', memberTarget, frequency = 'weekly',
    dueDay = 5, dueTime = '18:00', graceHours = 24, lateFeeAmount = 5,
    payoutMethod = 'AGREED', bankDetails = null, startDate,
    memberUserIds, actorId, actorEmail,
    managedBy = 'TREASURER', openForJoining = false,
  } = input;
  const slug = input.slug || slugify(name);

  const isPlatformOpen = managedBy === 'PLATFORM' || openForJoining;

  // Treasurer pots are born full and start immediately. Platform/open pots are
  // created empty ("forming") and only generate a cycle once started.
  const shouldStartImmediately = !isPlatformOpen && memberUserIds && memberUserIds.length > 0;
  
  if (shouldStartImmediately) {
    if (memberUserIds.length !== memberTarget) {
      throw new PajoIntegrityError('MEMBER_COUNT_MISMATCH',
        `A ${memberTarget}-member pot needs exactly ${memberTarget} member ids (got ${memberUserIds.length}).`);
    }
    if (new Set(memberUserIds).size !== memberUserIds.length) {
      throw new PajoIntegrityError('DUPLICATE_MEMBER', 'The same person cannot be added twice to one pot.');
    }
  }

  const start = startDate ? new Date(startDate) : new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const rulesText = input.rulesText ?? buildDefaultRulesText({
    amount: contributionAmount, currency, memberTarget,
    dueDay: dayNames[dueDay] ?? 'Friday', dueTime, graceHours, lateFeeAmount,
  });

  const pot = await prisma.pot.create({
    data: {
      organizationId, slug, name,
      description: input.description ?? null,
      contributionAmount, currency, memberTarget, frequency,
      dueDay, dueTime, graceHours, lateFeeAmount,
      payoutMethod: payoutMethod as PotPayoutMethod,
      bankDetails: bankDetails ?? undefined,
      rulesText,
      managedBy: managedBy as PotManagedBy,
      openForJoining: openForJoining,
      // Every pot is born with its own invite link — treasurer-only pots are
      // private-by-default, so this is what makes the pot joinable at all
      // (platform/open pots don't rely on it, but it costs nothing to set).
      inviteToken: generateInviteToken(),
      inviteExpiresAt: defaultInviteExpiry(),
    },
  });

  if (shouldStartImmediately) {
    // Seed members and generate the cycle immediately.
    await startPotCycle({
      potId: pot.id,
      memberUserIds,
      startDate: start,
      actorId,
      actorEmail,
      organizationId,
    });
  }

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'pot.created', resource: `pot:${pot.id}`, resourceType: 'pot',
    details: {
      potId: pot.id,
      name, slug, contributionAmount, currency, memberTarget, frequency,
      managedBy: pot.managedBy, openForJoining: pot.openForJoining,
      weeklyPayout: computePayoutForWeek(contributionAmount, memberTarget),
    },
  });

  return pot;
}

export interface RegenerateInviteTokenInput {
  potId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  /** Days until the new link expires. Defaults to DEFAULT_INVITE_TTL_DAYS. */
  ttlDays?: number;
}

/**
 * Issues a brand-new invite token for a pot, immediately revoking the old
 * one (whoever still has the old link gets a generic "invalid invitation"
 * from every endpoint that checks it — see the join route). This is the
 * pot's "revoke invitation" control for V1: no separate invitation table,
 * just overwrite the one live token. Treasurer/org-admin only — callers
 * must have already checked access before calling this.
 */
export async function regenerateInviteToken(input: RegenerateInviteTokenInput) {
  const { potId, actorId, actorEmail, organizationId, ttlDays = DEFAULT_INVITE_TTL_DAYS } = input;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  const pot = await prisma.pot.update({
    where: { id: potId },
    data: {
      inviteToken: generateInviteToken(),
      inviteExpiresAt: expiresAt,
    },
  });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'pot.invite_regenerated', resource: `pot:${pot.id}`, resourceType: 'pot',
    details: { potId: pot.id, inviteExpiresAt: pot.inviteExpiresAt },
  });

  return pot;
}

export interface RecordPaymentInput {
  contributionId: string;
  amountPaid: number;
  reference?: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
}

/** Admin marks a member's contribution as paid. Updates member lifetime totals. */
export async function recordContributionPayment(input: RecordPaymentInput) {
  const { contributionId, amountPaid, reference, actorId, actorEmail, organizationId } = input;

  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { member: { include: { user: true, pot: true } }, week: true },
  });
  if (!contribution) throw new PajoIntegrityError('NOT_FOUND', 'Contribution not found.');

  const [updated] = await prisma.$transaction([
    prisma.contribution.update({
      where: { id: contributionId },
      data: { amountPaid, status: 'PAID', paidAt: new Date(), reference: reference ?? contribution.reference },
    }),
    prisma.potMember.update({
      where: { id: contribution.memberId },
      data: { totalContributed: { increment: amountPaid } },
    }),
  ]);

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'contribution.paid', resource: `contribution:${contributionId}`, resourceType: 'contribution',
    details: {
      potId: contribution.member.potId,
      memberName: contribution.member.user.name ?? contribution.member.user.email,
      amountPaid, weekNumber: contribution.week.weekNumber, reference,
    },
  });

  return updated;
}

export interface ReportPaymentInput {
  contributionId: string;
  userId: string;
  actorEmail: string;
  reference?: string;
}

/**
 * Member-side: "I've paid". Moves a PENDING/LATE/REJECTED contribution to
 * PAYMENT_REPORTED — a non-official signal that the treasurer must confirm
 * against the group bank account. Members can never set PAID themselves.
 */
export async function reportContributionPayment(input: ReportPaymentInput) {
  const { contributionId, userId, actorEmail, reference } = input;

  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { member: { include: { user: true, pot: true } }, week: true },
  });
  if (!contribution) throw new PajoIntegrityError('NOT_FOUND', 'Contribution not found.');
  if (contribution.member.userId !== userId) {
    throw new PajoIntegrityError('NOT_YOUR_CONTRIBUTION', 'You can only report your own payments.');
  }
  if (contribution.status === 'PAID' || contribution.status === 'EXEMPT_RECIPIENT' || contribution.status === 'WAIVED') {
    throw new PajoIntegrityError('NOT_PAYABLE', `This contribution is already ${contribution.status.toLowerCase()}.`);
  }

  const updated = await prisma.contribution.update({
    where: { id: contributionId },
    data: { status: 'PAYMENT_REPORTED', reference: reference ?? contribution.reference },
  });

  await createAuditLog({
    organizationId: contribution.member.pot.organizationId, actorId: userId, actorEmail,
    action: 'contribution.payment_reported', resource: `contribution:${contributionId}`, resourceType: 'contribution',
    details: {
      potId: contribution.member.potId,
      memberName: contribution.member.user.name ?? contribution.member.user.email,
      amountDue: contribution.amountDue, weekNumber: contribution.week.weekNumber,
    },
  });

  return updated;
}

export interface ConfirmPaymentInput {
  contributionId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  amountPaid?: number;
  reference?: string;
}

/**
 * Treasurer-side: confirm a reported (or pending) payment after checking the
 * group bank account. Sets the official PAID status and increments the
 * member's lifetime total. This is Level 1 reconciliation — money never
 * passes through Pajo.
 */
export async function confirmContributionPayment(input: ConfirmPaymentInput) {
  const { contributionId, actorId, actorEmail, organizationId } = input;

  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { member: true },
  });
  if (!contribution) throw new PajoIntegrityError('NOT_FOUND', 'Contribution not found.');
  if (contribution.status === 'PAID') {
    throw new PajoIntegrityError('ALREADY_PAID', 'This contribution is already confirmed.');
  }

  const amountPaid = input.amountPaid ?? contribution.amountDue;
  const reference = input.reference ?? contribution.reference ?? undefined;

  const [updated] = await prisma.$transaction([
    prisma.contribution.update({
      where: { id: contributionId },
      data: { status: 'PAID', amountPaid, paidAt: new Date(), reference },
    }),
    prisma.potMember.update({
      where: { id: contribution.memberId },
      data: { totalContributed: { increment: amountPaid } },
    }),
  ]);

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'contribution.payment_confirmed', resource: `contribution:${contributionId}`, resourceType: 'contribution',
    details: { potId: contribution.member.potId, amountPaid, weekNumber: undefined, reference },
  });

  return updated;
}

export interface RejectPaymentInput {
  contributionId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  reason?: string;
}

/**
 * Treasurer-side: reject a member's payment report (no money seen in the
 * bank). Returns the contribution to PENDING so it still shows as owed.
 */
export async function rejectContributionPayment(input: RejectPaymentInput) {
  const { contributionId, actorId, actorEmail, organizationId, reason } = input;

  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { member: true },
  });
  if (!contribution) throw new PajoIntegrityError('NOT_FOUND', 'Contribution not found.');
  if (contribution.status !== 'PAYMENT_REPORTED') {
    throw new PajoIntegrityError('NOT_REPORTED', 'Only a reported payment can be rejected.');
  }

  const updated = await prisma.contribution.update({
    where: { id: contributionId },
    data: { status: 'PENDING', notes: reason ?? contribution.notes },
  });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'contribution.payment_rejected', resource: `contribution:${contributionId}`, resourceType: 'contribution',
    details: { potId: contribution.member.potId, reason: reason ?? null },
  });

  return updated;
}

export interface EscalateLateInput {
  contributionId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
}

/**
 * Applies the late/missed escalation ladder to one contribution:
 * 1st → reminder only, 2nd → £fee added to the member's NEXT open
 * contribution, 3rd → the member's payout position is FORFEITED (recorded,
 * never deleted) until arrears are cleared.
 */
export async function applyLateEscalation(input: EscalateLateInput) {
  const { contributionId, actorId, actorEmail, organizationId } = input;

  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: {
      member: { include: { user: true } },
      week: { include: { cycle: { include: { pot: true } } } },
    },
  });
  if (!contribution) throw new PajoIntegrityError('NOT_FOUND', 'Contribution not found.');

  const escalation = escalateLatePayment(contribution.member.strikes);
  const memberName = contribution.member.user.name ?? contribution.member.user.email;

  await prisma.$transaction(async (tx) => {
    await tx.contribution.update({
      where: { id: contributionId },
      data: { status: 'LATE', lateFeeApplied: escalation.applyLateFee },
    });
    await tx.potMember.update({
      where: { id: contribution.memberId },
      data: { strikes: escalation.newStrikeCount },
    });

    if (escalation.applyLateFee) {
      const nextContribution = await tx.contribution.findFirst({
        where: {
          memberId: contribution.memberId,
          status: 'PENDING',
          week: { weekNumber: { gt: contribution.week.weekNumber }, cycleId: contribution.week.cycleId },
        },
        orderBy: { week: { weekNumber: 'asc' } },
      });
      if (nextContribution) {
        await tx.contribution.update({
          where: { id: nextContribution.id },
          data: { amountDue: { increment: contribution.week.cycle.pot.lateFeeAmount } },
        });
      }
    }

    if (escalation.forfeitPayout) {
      const position = await tx.potPosition.findUnique({
        where: { cycleId_memberId: { cycleId: contribution.week.cycleId, memberId: contribution.memberId } },
      });
      if (position && position.status === 'ACTIVE') {
        await tx.potPosition.update({ where: { id: position.id }, data: { status: 'FORFEITED' } });
      }
    }
  });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'contribution.late_escalated', resource: `contribution:${contributionId}`, resourceType: 'contribution',
    details: {
      potId: contribution.week.cycle.potId,
      memberName,
      strike: escalation.newStrikeCount,
      message: escalation.message,
      forfeited: escalation.forfeitPayout,
    },
  });

  return { ...escalation, memberName };
}

export interface MarkPaidOutInput {
  weekId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  confirmDespiteOutstanding?: boolean;
}

/**
 * Admin confirms the week's recipient has been sent the payout. Runs the
 * payout integrity gate first:
 *  1. Week must be OPEN/CLOSED (not already PAID_OUT, not UPCOMING)
 *  2. Exactly one recipient must be set
 *  3. The recipient must hold a valid ACTIVE payout position
 *  4. If contributions aren't fully reconciled, the caller must explicitly
 *     pass confirmDespiteOutstanding — recorded in the audit trail either way.
 */
export async function markWeekPaidOut(input: MarkPaidOutInput) {
  const { weekId, actorId, actorEmail, organizationId, confirmDespiteOutstanding = false } = input;

  const week = await prisma.potWeek.findUnique({
    where: { id: weekId },
    include: {
      contributions: true,
      position: true,
      recipient: { include: { user: true } },
      cycle: { include: { pot: true } },
    },
  });
  if (!week) throw new PajoIntegrityError('NOT_FOUND', 'Week not found.');

  if (week.status === 'PAID_OUT') {
    throw new PajoIntegrityError('ALREADY_PAID_OUT', 'This week has already been paid out.');
  }
  if (!week.recipientId || !week.recipient) {
    throw new PajoIntegrityError('NO_RECIPIENT', 'This week has no assigned recipient.');
  }
  if (!week.position || week.position.status !== 'ACTIVE') {
    throw new PajoIntegrityError(
      'INVALID_POSITION',
      'The recipient\'s payout position is not active (forfeited or already fulfilled) — resolve this before paying out.',
    );
  }

  const totalExpected = week.contributions
    .filter((c) => c.status !== 'EXEMPT_RECIPIENT' && c.status !== 'WAIVED')
    .reduce((sum, c) => sum + c.amountDue, 0);
  const totalCollected = week.contributions
    .filter((c) => c.status === 'PAID' || c.status === 'LATE')
    .reduce((sum, c) => sum + c.amountPaid, 0);
  const outstanding = Math.max(0, totalExpected - totalCollected);

  if (outstanding > 0 && !confirmDespiteOutstanding) {
    throw new PajoIntegrityError(
      'OUTSTANDING_BALANCE',
      `£${outstanding.toFixed(2)} outstanding — pass confirmDespiteOutstanding to pay out anyway.`,
    );
  }

  const payoutAmount = week.payoutAmount ?? totalExpected;
  const recipientName = week.recipient.user.name ?? week.recipient.user.email;

  const updated = await prisma.$transaction(async (tx) => {
    const w = await tx.potWeek.update({
      where: { id: weekId },
      data: { status: 'PAID_OUT', paidOutAt: new Date() },
    });
    await tx.potPosition.update({ where: { id: week.position!.id }, data: { status: 'FULFILLED' } });
    await tx.potMember.update({
      where: { id: week.recipientId! },
      data: { totalReceived: { increment: payoutAmount } },
    });
    return w;
  });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'week.paid_out', resource: `week:${weekId}`, resourceType: 'potweek',
    details: {
      potId: week.cycle.potId,
      recipientName,
      amount: payoutAmount,
      weekNumber: week.weekNumber,
      outstanding,
      confirmedDespiteOutstanding: outstanding > 0,
    },
  });

  return updated;
}

/** A member accepts the group rules for themselves before contributing. */
export async function acceptPotRules(input: { memberId: string }) {
  return prisma.potMember.update({
    where: { id: input.memberId },
    data: { rulesAcceptedAt: new Date() },
  });
}

export interface LeavePotInput {
  memberId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
}

/**
 * A member leaves mid-cycle: per the group rules they get back what they've
 * paid in but lose their payout turn. The position is marked FORFEITED
 * (never deleted) and the member LEFT, preserving the historical record so
 * disputes can be resolved later.
 */
export async function leavePotMember(input: LeavePotInput) {
  const { memberId, actorId, actorEmail, organizationId } = input;
  const member = await prisma.potMember.findUnique({ where: { id: memberId }, include: { user: true, pot: true } });
  if (!member) throw new PajoIntegrityError('NOT_FOUND', 'Member not found.');

  await prisma.$transaction(async (tx) => {
    await tx.potMember.update({ where: { id: memberId }, data: { status: 'LEFT', leftAt: new Date() } });
    const position = await tx.potPosition.findFirst({
      where: { memberId, status: 'ACTIVE', cycle: { potId: member.potId, status: 'ACTIVE' } },
    });
    if (position) {
      await tx.potPosition.update({ where: { id: position.id }, data: { status: 'FORFEITED' } });
    }
  });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'member.left', resource: `potmember:${memberId}`, resourceType: 'potmember',
    details: {
      potId: member.potId,
      memberName: member.user.name ?? member.user.email,
      refundOwed: member.totalContributed,
    },
  });

  return member;
}

export interface ReplacePotMemberInput {
  leavingMemberId: string;
  newUserId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
}

/**
 * Replace a member who has left: the new member inherits the vacant payout
 * position and pays what the leaver had already contributed (per the group
 * rules). The old member's row and history are untouched — REPLACED status
 * plus the audit chain make the transition traceable end to end.
 */
export async function replacePotMember(input: ReplacePotMemberInput) {
  const { leavingMemberId, newUserId, actorId, actorEmail, organizationId } = input;

  const leaving = await prisma.potMember.findUnique({
    where: { id: leavingMemberId },
    include: { user: true },
  });
  if (!leaving) throw new PajoIntegrityError('NOT_FOUND', 'Leaving member not found.');

  const activeCycle = await prisma.potCycle.findFirst({ where: { potId: leaving.potId, status: 'ACTIVE' } });
  if (!activeCycle) throw new PajoIntegrityError('NO_ACTIVE_CYCLE', 'No active cycle for this pot.');

  const vacantPosition = await prisma.potPosition.findFirst({
    where: { cycleId: activeCycle.id, memberId: leavingMemberId, status: 'FORFEITED' },
  });
  if (!vacantPosition) {
    throw new PajoIntegrityError('NO_VACANT_POSITION', 'This member has no vacant (left) position to transfer.');
  }

  const newMember = await prisma.$transaction(async (tx) => {
    await tx.potMember.update({ where: { id: leavingMemberId }, data: { status: 'REPLACED' } });

    const created = await tx.potMember.create({
      data: {
        potId: leaving.potId,
        userId: newUserId,
        status: 'ACTIVE',
        rulesAcceptedAt: new Date(),
        totalContributed: leaving.totalContributed, // inherits what the leaver already paid
      },
    });

    // Position transfers to the new member — same slot, no renumbering.
    await tx.potPosition.update({
      where: { id: vacantPosition.id },
      data: { memberId: created.id, status: 'ACTIVE' },
    });

    // Re-point any UPCOMING weeks that pointed at the old member's position.
    await tx.potWeek.updateMany({
      where: { positionId: vacantPosition.id, status: 'UPCOMING' },
      data: { recipientId: created.id },
    });

    return created;
  });

  const newUser = await prisma.userProfile.findUnique({ where: { id: newUserId } });

  await createAuditLog({
    organizationId, actorId, actorEmail,
    action: 'member.replaced', resource: `potmember:${newMember.id}`, resourceType: 'potmember',
    details: {
      potId: leaving.potId,
      oldMemberName: leaving.user.name ?? leaving.user.email,
      newMemberName: newUser?.name ?? newUser?.email,
      position: vacantPosition.position,
      inheritedContribution: leaving.totalContributed,
    },
  });

  return newMember;
}

export interface StartCycleInput {
  potId: string;
  memberUserIds: string[];
  startDate: Date;
  actorId: string;
  actorEmail: string;
  organizationId: string;
}

/**
 * Manually start a Forming pot or start a new cycle for an existing pot.
 * Creates the PotCycle, assigns PotPositions to members, and generates
 * the PotWeeks and their corresponding empty Contribution rows.
 */
export async function startPotCycle(input: StartCycleInput) {
  const { potId, memberUserIds, startDate, actorId, actorEmail, organizationId } = input;

  const pot = await prisma.pot.findUnique({
    where: { id: potId },
    include: { members: true },
  });
  if (!pot) throw new PajoIntegrityError('NOT_FOUND', 'Pot not found.');

  // 1. Ensure all members exist as PotMembers
  // (In Treasurer flow they are created here; in Platform flow they already exist)
  const members = await Promise.all(
    memberUserIds.map(async (userId) => {
      return prisma.potMember.upsert({
        where: { potId_userId: { potId, userId } },
        update: { status: 'ACTIVE' },
        create: { potId, userId, status: 'ACTIVE' },
      });
    })
  );

  // 2. Create the Cycle
  const cycleNumber = (await prisma.potCycle.count({ where: { potId } })) + 1;
  
  return await prisma.$transaction(async (tx) => {
    const cycle = await tx.potCycle.create({
      data: {
        potId,
        cycleNumber,
        startDate,
        status: 'ACTIVE',
      },
    });

    // 3. Create Positions (shuffled or assigned)
    const positions = await Promise.all(
      members.map(async (m, idx) => {
        return tx.potPosition.create({
          data: {
            cycleId: cycle.id,
            memberId: m.id,
            position: idx + 1,
            status: 'ACTIVE',
          },
        });
      })
    );

    // 4. Create Weeks
    const weeks = [];
    let currentDueDate = firstDueDate(startDate, pot.dueDay, pot.dueTime);

    for (let i = 0; i < pot.memberTarget; i++) {
      const position = positions[i];
      const week = await tx.potWeek.create({
        data: {
          cycleId: cycle.id,
          weekNumber: i + 1,
          dueDate: currentDueDate,
          status: 'UPCOMING',
          recipientId: position.memberId,
          positionId: position.id,
        },
      });

      // 5. Create Contributions for every member for this week
      await Promise.all(
        members.map(async (m) => {
          const isRecipient = m.id === position.memberId;
          return tx.contribution.create({
            data: {
              weekId: week.id,
              memberId: m.id,
              amountDue: isRecipient ? 0 : pot.contributionAmount,
              amountPaid: 0,
              status: isRecipient ? 'EXEMPT_RECIPIENT' : 'PENDING',
            },
          });
        })
      );

      weeks.push(week);
      // Advance date based on frequency
      const nextDate = new Date(currentDueDate);
      if (pot.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (pot.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      currentDueDate = nextDate;
    }

    return { cycle, weeks };
  });
}
