import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess } from '@/lib/pajo/access';
import { confirmContributionPayment } from '@/lib/pajo/mutations';
import { emitNotification } from '@/lib/pajo/notifications';

/** Treasurer/admin: confirm a payment against the bank. Sets official PAID. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contributionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { contributionId } = await params;
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { 
      week: { include: { cycle: { include: { pot: true } } } },
      member: true 
    },
  });
  if (!contribution) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const access = await getPajoAccess(userProfile.id, contribution.week.cycle.pot.slug);
  if (!access || access.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const amountPaid = typeof body.amountPaid === 'number' ? body.amountPaid : undefined;
  const reference = typeof body.reference === 'string' ? body.reference : undefined;

  try {
    const updated = await confirmContributionPayment({
      contributionId,
      amountPaid,
      reference,
      actorId: userProfile.id,
      actorEmail: userProfile.email,
      organizationId: contribution.week.cycle.pot.organizationId,
    });

    // Notify the Member
    await emitNotification({
      userId: contribution.member.userId,
      potId: contribution.week.cycle.pot.id,
      organizationId: contribution.week.cycle.pot.organizationId,
      type: 'TRANSACTIONAL',
      category: 'payment',
      title: 'Payment Confirmed',
      message: `Your payment for ${contribution.week.cycle.pot.name} (Week ${contribution.week.weekNumber}) has been confirmed.`,
      ctaUrl: `/pajo/${contribution.week.cycle.pot.slug}`,
      ctaText: 'View Pot'
    });

    return NextResponse.json({ ok: true, contribution: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message ?? 'Failed to confirm payment' }, { status: 400 });
  }
}

