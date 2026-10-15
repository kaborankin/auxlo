import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess } from '@/lib/pajo/access';
import { applyLateEscalation } from '@/lib/pajo/mutations';

/** Admin-only: apply the late/missed escalation ladder to a contribution. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ contributionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { contributionId } = await params;
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
    include: { week: { include: { cycle: { include: { pot: true } } } } },
  });
  if (!contribution) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const access = await getPajoAccess(userProfile.id, contribution.week.cycle.pot.slug);
  if (!access || access.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const escalation = await applyLateEscalation({
    contributionId,
    actorId: userProfile.id,
    actorEmail: userProfile.email,
    organizationId: contribution.week.cycle.pot.organizationId,
  });

  return NextResponse.json({ ok: true, escalation });
}
