import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess } from '@/lib/pajo/access';
import { reviewJoinRequest, PajoIntegrityError } from '@/lib/pajo/mutations';

/**
 * Treasurer decision on a pending join request. Only an admin of the pot's
 * organisation (super admin, ORG_ADMIN or ORG_MANAGER) may approve/reject.
 * Approval is what actually creates the PotMember — see reviewJoinRequest.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email as string },
  });
  if (!userProfile) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return NextResponse.json(
      { ok: false, error: "decision must be 'APPROVED' or 'REJECTED'" },
      { status: 400 }
    );
  }

  // Resolve the request's pot so we can check the actor administers that pot's org.
  const existing = await prisma.potJoinRequest.findUnique({
    where: { id: requestId },
    select: { pot: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Join request not found' }, { status: 404 });
  }

  const access = await getPajoAccess(userProfile.id, existing.pot.slug);
  if (!access || access.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const reviewed = await reviewJoinRequest({
      requestId,
      decision,
      actorId: userProfile.id,
      actorEmail: session.user.email as string,
    });

    return NextResponse.json({ ok: true, status: reviewed.status });
  } catch (error: any) {
    if (error instanceof PajoIntegrityError) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Failed to review join request:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
