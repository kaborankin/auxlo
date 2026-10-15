/**
 * One-off seed for reviewing the Pajo dashboard before auth is set up.
 * Creates the canonical review pot matching the real live group: £50/week ×
 * 12 members × 12-week cycle, Friday 18:00 deadline, 24h grace, £5 late fee.
 * Recipient exemption applies: the weekly payout is £550 (11 contributors ×
 * £50), not £600 — the member receiving the pot doesn't contribute that
 * week. Week 1 is part-paid (7 of 11 contributors) and one member has a
 * 1st-late escalation applied, so the dashboard shows realistic states.
 *
 * Run:  $env:TS_NODE_PROJECT='scripts/tsconfig.seed.json'; npx ts-node -r tsconfig-paths/register scripts/pajo-seed-review.ts
 * Clean: set CLEANUP=1 to delete the pot + demo users instead.
 */
import prisma from '../lib/db';
import { createPot, recordContributionPayment, applyLateEscalation } from '../lib/pajo/mutations';
import { getPotOverview } from '../lib/pajo/queries';

const MEMBER_COUNT = 12;

async function main() {
  const cleanup = process.env.CLEANUP === '1';

  const existing = await prisma.pot.findUnique({ where: { slug: 'review-pot' } });
  if (existing) await prisma.pot.delete({ where: { id: existing.id } });

  const demoEmails = Array.from(
    { length: MEMBER_COUNT },
    (_, i) => `pajo-demo-${String(i + 1).padStart(2, '0')}@example.com`,
  );

  if (cleanup) {
    await prisma.userProfile.deleteMany({ where: { email: { in: demoEmails } } });
    const org = await prisma.organization.findUnique({ where: { slug: 'pajo-review-org' } });
    if (org) await prisma.organization.delete({ where: { id: org.id } });
    console.log('CLEANUP DONE');
    return;
  }

  const org = await prisma.organization.upsert({
    where: { slug: 'pajo-review-org' },
    update: {},
    create: { name: 'Pajo Review Circle', slug: 'pajo-review-org' },
  });

  const users = [];
  for (let i = 0; i < MEMBER_COUNT; i++) {
    const user = await prisma.userProfile.upsert({
      where: { email: demoEmails[i] },
      update: {},
      create: {
        id: `pajo-demo-user-${i + 1}`,
        email: demoEmails[i],
        name: `Demo Member ${String(i + 1).padStart(2, '0')}`,
        source: 'pajo-review-seed',
      },
    });
    users.push(user);
  }

  const pot = await createPot({
    organizationId: org.id,
    slug: 'review-pot',
    name: '£50 A Week Thrift — Review',
    description: 'Canonical 12-member weekly thrift circle used for reviewing the Pajo dashboard.',
    contributionAmount: 50,
    memberTarget: MEMBER_COUNT,
    dueDay: 5, // Friday
    dueTime: '18:00',
    graceHours: 24,
    lateFeeAmount: 5,
    payoutMethod: 'AGREED',
    memberUserIds: users.map((u) => u.id),
    actorId: users[0].id,
    actorEmail: users[0].email,
  });
  console.log('Created review pot:', pot.slug, '(12 members × £50 → £550 weekly payout, recipient exempt)');

  // Realistic week 1: 7 of the 11 contributors paid, one flagged once (reminder).
  // (Member 1 is week 1's recipient — exempt, no contribution row to pay.)
  const overview = await getPotOverview('review-pot');
  const week1 = overview!.currentWeek!;
  const contributors = week1.contributions.filter((c) => c.status !== 'EXEMPT_RECIPIENT');
  for (let i = 0; i < 7; i++) {
    await recordContributionPayment({
      contributionId: contributors[i].contributionId,
      amountPaid: 50,
      reference: contributors[i].memberName,
      actorId: users[0].id,
      actorEmail: users[0].email,
      organizationId: org.id,
    });
  }
  const escalation = await applyLateEscalation({
    contributionId: contributors[7].contributionId,
    actorId: users[0].id,
    actorEmail: users[0].email,
    organizationId: org.id,
  });
  console.log('Week 1: 7 paid, one member escalated →', escalation.message);

  const final = await getPotOverview('review-pot');
  console.log(
    'Overview check — collected:',
    final?.currentWeek?.totalCollected,
    '/',
    final?.currentWeek?.totalExpected,
    '(expect £350 / £550)',
  );
  console.log('Weekly payout:', final?.weeklyPayout, '(expect 550)');
  console.log('SEED DONE — open /pajo/review-pot');
}

main()
  .catch((e) => {
    console.error('SEED FAILED', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

