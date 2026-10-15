import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess } from '@/lib/pajo/access';
import { markWeekPaidOut, PajoIntegrityError } from '@/lib/pajo/mutations';

/** Admin-only: confirm the week's recipient has been sent the full pot. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ weekId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { weekId } = await params;
  const week = await prisma.potWeek.findUnique({
    where: { id: weekId },
    include: { cycle: { include: { pot: true } } },
  });
  if (!week) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const access = await getPajoAccess(userProfile.id, week.cycle.pot.slug);
  if (!access || access.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  let confirmDespiteOutstanding = false;
  try {
    const body = await request.json();
    confirmDespiteOutstanding = body?.confirmDespiteOutstanding === true;
  } catch {
    // empty body is fine — only matters when there is an outstanding balance
  }

  try {
    const updated = await markWeekPaidOut({
      weekId,
      actorId: userProfile.id,
      actorEmail: userProfile.email,
      organizationId: week.cycle.pot.organizationId,
      confirmDespiteOutstanding,
    });
    return NextResponse.json({ ok: true, week: updated });
  } catch (err) {
    if (err instanceof PajoIntegrityError) {
      return NextResponse.json({ ok: false, error: err.message, code: err.code }, { status: 409 });
    }
    console.error('markWeekPaidOut failed', err);
    return NextResponse.json({ ok: false, error: 'Could not record the payout' }, { status: 500 });
  }
}
