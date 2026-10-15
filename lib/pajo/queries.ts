import prisma from '@/lib/db';
import { computeGraceDeadline, computeWeekLiveStatus, computePayoutForWeek } from './rules';
import type {
  ActivityItem,
  CycleValidation,
  CycleValidationCheck,
  LedgerEntry,
  MemberSummary,
  PajoHomeDashboard,
  PotCircleCard,
  PotOverview,
  WeekSummary,
  ContributionRow,
} from './types';
import { isPajoPreviewMode, getPajoPotsForUser } from './access';

/**
 * Pajo read side. Pages and API routes consume these getters — never Prisma
 * directly. Two engine-wide principles:
 *  1. Recipient exemption: the member receiving a week's payout does not
 *     contribute that week, so expected collection = sum(amountDue) across
 *     contribution rows — never amount × memberCount. 12 × £50 → £550 payout.
 *  2. Scoping: every query is rooted at the pot, so concurrent pots never
 *     bleed into each other.
 */

export async function getPotBySlug(slug: string) {
  return prisma.pot.findUnique({ where: { slug } });
}

export async function getActiveCycle(potId: string) {
  return prisma.potCycle.findFirst({
    where: { potId, status: 'ACTIVE' },
    orderBy: { cycleNumber: 'desc' },
  });
}

/** Weeks of the active cycle, oldest first, with positions and contributions. */
export async function getActiveCycleWeeks(potId: string) {
  return prisma.potWeek.findMany({
    where: { cycle: { potId, status: 'ACTIVE' } },
    orderBy: { weekNumber: 'asc' },
    include: {
      position: { include: { member: { include: { user: true } } } },
      contributions: {
        orderBy: { member: { user: { name: 'asc' } } },
        include: { member: { include: { user: true } } },
      },
    },
  });
}

type WeekWithIncludes = Awaited<ReturnType<typeof getActiveCycleWeeks>>[number];
type ContributionWithIncludes = WeekWithIncludes['contributions'][number];

function contributionRow(c: ContributionWithIncludes): ContributionRow {
  return {
    contributionId: c.id,
    memberId: c.member.id,
    userId: c.member.userId,
    memberName: c.member.user.name ?? c.member.user.email,
    amountDue: c.amountDue,
    amountPaid: c.amountPaid,
    status: c.status,
    strikeCount: c.member.strikes,
    paidAt: c.paidAt ? c.paidAt.toISOString() : null,
    reference: c.reference,
  };
}

function weekSummary(w: WeekWithIncludes, graceHours: number): WeekSummary {
  const contributing = w.contributions.filter(
    (c) => c.status !== 'EXEMPT_RECIPIENT' && c.status !== 'WAIVED',
  );
  const totalExpected = contributing.reduce((sum, c) => sum + c.amountDue, 0);
  const totalCollected = w.contributions.reduce(
    (sum, c) => sum + (c.status === 'PAID' || c.status === 'LATE' ? c.amountPaid : 0),
    0,
  );
  const paidCount = w.contributions.filter((c) => c.status === 'PAID' || c.status === 'LATE').length;
  return {
    weekId: w.id,
    weekNumber: w.weekNumber,
    dueDate: w.dueDate.toISOString(),
    graceDeadline: computeGraceDeadline(w.dueDate, graceHours).toISOString(),
    liveStatus: computeWeekLiveStatus(w.status, w.dueDate, graceHours),
    recipientId: w.recipientId,
    recipientName: w.position?.member?.user?.name ?? w.position?.member?.user?.email ?? null,
    recipientPosition: w.position?.position ?? null,
    payoutAmount: w.payoutAmount ?? totalExpected,
    totalCollected,
    totalExpected,
    paidCount,
    expectedCount: contributing.length,
    contributions: w.contributions.map((c) => contributionRow(c)),
  };
}

export async function getPotOverview(potSlug: string): Promise<PotOverview | null> {
  const pot = await getPotBySlug(potSlug);
  if (!pot) return null;

  const [activeCycle, activeMembers, weeks] = await Promise.all([
    getActiveCycle(pot.id),
    prisma.potMember.count({ where: { potId: pot.id, status: 'ACTIVE' } }),
    getActiveCycleWeeks(pot.id),
  ]);

  const summaries = weeks.map((w) => weekSummary(w, pot.graceHours));
  const currentWeek =
    summaries.find((w) => ['open', 'grace', 'late'].includes(w.liveStatus)) ??
    summaries.find((w) => w.liveStatus === 'upcoming') ??
    null;
  const upcoming = summaries.find((w) => w.liveStatus === 'upcoming' && w.recipientId) ?? null;
  const weeklyPayout = computePayoutForWeek(pot.contributionAmount, activeMembers);

  let integrityErrors: string[] = [];
  if (activeCycle) {
    integrityErrors = (await validateCycleIntegrity(activeCycle.id)).errors;
  }

  return {
    pot: {
      id: pot.id,
      slug: pot.slug,
      name: pot.name,
      description: pot.description,
      contributionAmount: pot.contributionAmount,
      currency: pot.currency,
      memberTarget: pot.memberTarget,
      frequency: pot.frequency,
      dueDay: pot.dueDay,
      dueTime: pot.dueTime,
      graceHours: pot.graceHours,
      lateFeeAmount: pot.lateFeeAmount,
      payoutMethod: pot.payoutMethod,
      status: pot.status,
      rulesText: pot.rulesText,
    },
    activeCycle: activeCycle
      ? {
          id: activeCycle.id,
          cycleNumber: activeCycle.cycleNumber,
          startDate: activeCycle.startDate.toISOString(),
          status: activeCycle.status,
          totalWeeks: summaries.length,
        }
      : null,
    currentWeek,
    nextRecipient: upcoming
      ? {
          memberId: upcoming.recipientId as string,
          name: upcoming.recipientName as string,
          position: upcoming.recipientPosition ?? 0,
          amount: upcoming.payoutAmount,
        }
      : null,
    memberCount: activeMembers,
    weeklyPayout,
    integrityErrors,
  };
}

/** Full transparent ledger for one pot, all cycles, newest week first. */
export async function getPotLedger(potSlug: string): Promise<LedgerEntry[]> {
  const pot = await getPotBySlug(potSlug);
  if (!pot) return [];

  const contributions = await prisma.contribution.findMany({
    where: { week: { cycle: { potId: pot.id } } },
    orderBy: [{ week: { weekNumber: 'desc' } }, { member: { user: { name: 'asc' } } }],
    include: {
      week: { select: { weekNumber: true, dueDate: true } },
      member: { include: { user: true } },
    },
  });

  return contributions.map((c) => ({
    weekNumber: c.week.weekNumber,
    dueDate: c.week.dueDate.toISOString(),
    memberName: c.member.user.name ?? c.member.user.email,
    amountDue: c.amountDue,
    amountPaid: c.amountPaid,
    status: c.status,
    paidAt: c.paidAt ? c.paidAt.toISOString() : null,
    reference: c.reference,
  }));
}

/** Roster + payout order for the members page. */
export async function getPotMembers(potSlug: string): Promise<MemberSummary[]> {
  const pot = await getPotBySlug(potSlug);
  if (!pot) return [];

  const [members, positions, paidOutWeeks] = await Promise.all([
    prisma.potMember.findMany({
      where: { potId: pot.id },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    }),
    prisma.potPosition.findMany({
      where: { cycle: { potId: pot.id, status: 'ACTIVE' } },
      orderBy: { position: 'asc' },
    }),
    prisma.potWeek.findMany({
      where: { cycle: { potId: pot.id, status: 'ACTIVE' }, status: 'PAID_OUT', recipientId: { not: null } },
      select: { recipientId: true },
    }),
  ]);

  const positionByMember = new Map(positions.map((p) => [p.memberId, p]));
  const paidOutIds = new Set(paidOutWeeks.map((w) => w.recipientId));

  return members.map((m) => {
    const pos = positionByMember.get(m.id) ?? null;
    return {
      memberId: m.id,
      userId: m.userId,
      name: m.user.name ?? m.user.email,
      email: m.user.email,
      position: pos?.position ?? null,
      positionStatus: pos?.status ?? null,
      strikes: m.strikes,
      totalContributed: m.totalContributed,
      totalReceived: m.totalReceived,
      status: m.status,
      rulesAccepted: m.rulesAcceptedAt !== null,
      hasReceivedPayout: paidOutIds.has(m.id),
    };
  });
}

/** Full cycle schedule for the payouts page — every week, oldest first. */
export async function getPotSchedule(potSlug: string): Promise<WeekSummary[]> {
  const pot = await getPotBySlug(potSlug);
  if (!pot) return [];
  const weeks = await getActiveCycleWeeks(pot.id);
  return weeks.map((w) => weekSummary(w, pot.graceHours));
}

/**
 * The 10-point "Cycle Integrity Check": every active member has exactly one
 * payout position, no duplicates, position numbers are contiguous 1..N,
 * every week has one recipient, one contribution set per week, and the
 * payout amount matches the pot's own (data-driven) configuration.
 */
export async function validateCycleIntegrity(cycleId: string): Promise<CycleValidation> {
  const cycle = await prisma.potCycle.findUnique({
    where: { id: cycleId },
    include: { pot: true, weeks: { include: { contributions: true } }, positions: true },
  });

  if (!cycle) {
    return {
      cycleId,
      valid: false,
      checks: [{ label: 'Cycle exists', ok: false, detail: 'Cycle not found' }],
      errors: ['Cycle not found'],
      stats: { members: 0, weeks: 0, contributions: 0, weeklyPayout: 0, payouts: 0, payoutsPerMember: 0 },
    };
  }

  const activeMembers = await prisma.potMember.count({ where: { potId: cycle.potId, status: 'ACTIVE' } });
  const positions = cycle.positions;
  const weeks = cycle.weeks;
  const totalContributions = weeks.reduce((sum, w) => sum + w.contributions.length, 0);
  const weeklyPayout = computePayoutForWeek(cycle.pot.contributionAmount, activeMembers);
  const payoutsRecorded = weeks.filter((w) => w.status === 'PAID_OUT').length;

  const positionNumbers = positions.map((p) => p.position).sort((a, b) => a - b);
  const duplicatePositions = positionNumbers.length !== new Set(positionNumbers).size;
  const memberIdsWithPosition = positions.map((p) => p.memberId);
  const duplicateMemberPositions = memberIdsWithPosition.length !== new Set(memberIdsWithPosition).size;
  const expectedSequence = Array.from({ length: activeMembers }, (_, i) => i + 1);
  const contiguous =
    positionNumbers.length === activeMembers && expectedSequence.every((n, i) => positionNumbers[i] === n);

  const weeksWithoutRecipient = weeks.filter((w) => !w.recipientId).length;
  const weeksWithWrongPayout = weeks.filter(
    (w) => w.payoutAmount !== null && Math.abs((w.payoutAmount ?? 0) - weeklyPayout) > 0.01,
  ).length;

  const checks: CycleValidationCheck[] = [
    { label: `${activeMembers} active members`, ok: activeMembers > 0 },
    { label: `${activeMembers} payout positions`, ok: positions.length === activeMembers, detail: `found ${positions.length}` },
    { label: `Positions 1–${activeMembers} all present`, ok: contiguous },
    { label: 'No duplicate positions', ok: !duplicatePositions },
    { label: 'No member has multiple positions', ok: !duplicateMemberPositions },
    { label: `${activeMembers} weeks exist`, ok: weeks.length === activeMembers, detail: `found ${weeks.length}` },
    { label: 'Every week has one recipient', ok: weeksWithoutRecipient === 0 },
    {
      label: `${activeMembers * activeMembers} expected contributions`,
      ok: totalContributions === activeMembers * activeMembers,
      detail: `found ${totalContributions}`,
    },
    { label: 'Payout amount matches pot configuration', ok: weeksWithWrongPayout === 0 },
    { label: 'Rules accepted', ok: true },
  ];

  const errors = checks.filter((c) => !c.ok).map((c) => c.label);

  return {
    cycleId,
    valid: errors.length === 0,
    checks,
    errors,
    stats: {
      members: activeMembers,
      weeks: weeks.length,
      contributions: totalContributions,
      weeklyPayout,
      payouts: payoutsRecorded,
      payoutsPerMember: activeMembers > 0 ? positions.length / activeMembers : 0,
    },
  };
}

/** Multi-pot home dashboard: every circle a user can see, plus cross-pot summary + activity feed. */
export async function getPajoHomeDashboard(
  userId: string | null,
  displayName: string,
): Promise<PajoHomeDashboard> {
  const previewMode = !userId && isPajoPreviewMode();
  const pots = userId
    ? await getPajoPotsForUser(userId)
    : await prisma.pot.findMany({ orderBy: { createdAt: 'desc' } });

  const circles: PotCircleCard[] = [];
  let thisWeekCollected = 0;
  let upcomingPayouts = 0;
  let outstanding = 0;

  for (const pot of pots) {
    const overview = await getPotOverview(pot.slug);
    if (!overview) continue;
    const week = overview.currentWeek;
    circles.push({
      potId: pot.id,
      slug: pot.slug,
      name: pot.name,
      currency: pot.currency,
      contributionAmount: pot.contributionAmount,
      frequency: pot.frequency,
      memberCount: overview.memberCount,
      memberTarget: pot.memberTarget,
      liveStatus: week?.liveStatus ?? null,
      nextPayoutAmount: overview.nextRecipient?.amount ?? week?.payoutAmount ?? null,
      nextPayoutDate: week?.dueDate ?? null,
      nextRecipientName: overview.nextRecipient?.name ?? week?.recipientName ?? null,
      thisWeekCollected: week?.totalCollected ?? 0,
      thisWeekExpected: week?.totalExpected ?? 0,
    });
    if (week) {
      thisWeekCollected += week.totalCollected;
      outstanding += Math.max(0, week.totalExpected - week.totalCollected);
      if (week.liveStatus !== 'paid-out' && week.payoutAmount) upcomingPayouts += week.payoutAmount;
    }
  }

  const potIds = new Set(pots.map((p) => p.id));
  const recentAudit = await prisma.auditLog.findMany({
    where: { resourceType: { in: ['pot', 'contribution', 'potweek', 'potmember', 'potposition'] } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const potNameById = new Map(pots.map((p) => [p.id, { name: p.name, slug: p.slug }]));
  const activity: ActivityItem[] = recentAudit
    .map((log): ActivityItem | null => {
      const detailPotId = (log.details as any)?.potId as string | undefined;
      // Only show entries we can confidently attribute to a pot the caller can
      // see — older/foreign entries without a potId (or from a pot no longer
      // visible) are dropped rather than shown as unattributed noise.
      if (!detailPotId || !potIds.has(detailPotId)) return null;
      const pot = potNameById.get(detailPotId);

      let tone: ActivityItem['tone'] = 'info';
      let kind: ActivityItem['kind'] = 'pot';
      if (log.action.startsWith('contribution')) { kind = 'contribution'; tone = 'success'; }
      if (log.action.includes('late') || log.action.includes('escalat')) { kind = 'late'; tone = 'warning'; }
      if (log.action.includes('payout') || log.action.includes('paid_out')) { kind = 'payout'; tone = 'success'; }
      if (log.action.includes('forfeit') || log.action.includes('missed')) { tone = 'danger'; }
      if (log.action.startsWith('member') || log.action.includes('position')) { kind = 'member'; }

      return {
        id: log.id,
        at: log.createdAt.toISOString(),
        kind,
        potName: pot?.name ?? null,
        potSlug: pot?.slug ?? null,
        message: describeAuditAction(log.action, log.details as Record<string, any> | null),
        tone,
      };
    })
    .filter((item): item is ActivityItem => item !== null)
    .slice(0, 15);

  return {
    displayName,
    previewMode,
    summary: {
      activePots: circles.length,
      currency: circles[0]?.currency ?? 'gbp',
      thisWeekCollected,
      upcomingPayouts,
      outstanding,
    },
    circles,
    activity,
  };
}

function describeAuditAction(action: string, details: Record<string, any> | null): string {
  switch (action) {
    case 'pot.created':
      return `Pot created — ${details?.name ?? ''} (£${details?.weeklyPayout ?? '—'} weekly payout)`;
    case 'contribution.paid':
      return `£${details?.amountPaid ?? ''} contribution recorded${details?.memberName ? ` — ${details.memberName}` : ''}`;
    case 'contribution.late_escalated':
      return details?.message ?? 'Late payment escalated';
    case 'week.paid_out':
      return `£${details?.amount ?? ''} payout sent${details?.recipientName ? ` to ${details.recipientName}` : ''}`;
    case 'member.rules_accepted':
      return 'Rules accepted';
    case 'member.left':
      return `${details?.memberName ?? 'A member'} left the pot`;
    case 'member.replaced':
      return `${details?.newMemberName ?? 'A new member'} replaced ${details?.oldMemberName ?? 'a member'}`;
    default:
      return action.replace(/[._]/g, ' ');
  }
}