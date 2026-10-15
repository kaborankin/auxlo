import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { validatePotInvitation } from '@/lib/pajo/access';

/**
 * Member-side join. Requires the same invitation token the preview endpoint
 * validates — a signed-in user cannot join a private pot just by knowing
 * its slug. Already-members are handled idempotently BEFORE the token
 * check: someone a treasurer added directly (no link involved) or someone
 * re-clicking an old/rotated link who is already in should never be
 * blocked by a stale/missing token — token possession only matters for the
 * *first* join, not for status checks afterwards.
 *
 * Joining here only ever produces a fully ACTIVE PotMember — there is no
 * intermediate "invited but not yet accepted" state in the current schema
 * (PotMemberStatus has no PENDING value), so the accept step and the
 * membership creation happen atomically in one call.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ potSlug: string }> }
) {
  const { potSlug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let token: string | null = null;
  try {
    const body = await request.json();
    token = body?.token ?? null;
  } catch {
    // No JSON body (or empty) — fall back to a ?token= query param so the
    // join page can also call this with a simple POST + query string.
    token = new URL(request.url).searchParams.get('token');
  }

  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: session.user.email as string },
    });

    if (!userProfile) {
      return NextResponse.json({ ok: false, error: 'User profile not found' }, { status: 404 });
    }

    const pot = await prisma.pot.findUnique({
      where: { slug: potSlug },
      include: { members: true },
    });

    if (!pot) {
      // Generic — don't confirm/deny pot existence to an unauthenticated-for-this-pot caller.
      return NextResponse.json({ ok: false, error: 'Invitation not found or no longer valid' }, { status: 404 });
    }

    // 1. Already a member — idempotent regardless of token state.
    const isMember = pot.members.some(m => m.userId === userProfile.id);
    if (isMember) {
      return NextResponse.json({ ok: true, message: 'Already a member' });
    }

    // 2. Not yet a member — must present a valid, unexpired invitation.
    const invitation = await validatePotInvitation(potSlug, token);
    if (!invitation.ok) {
      return NextResponse.json({ ok: false, error: 'Invitation not found or no longer valid' }, { status: 404 });
    }

    // 3. Check if full
    if (pot.members.length >= pot.memberTarget) {
      return NextResponse.json({ ok: false, error: 'Pot is already full' }, { status: 400 });
    }

    // 4. Accept + join in one step: this pot's schema has no PENDING
    //    PotMemberStatus, so "terms accepted" and "member is ACTIVE" are the
    //    same event here.
    await prisma.potMember.create({
      data: {
        potId: pot.id,
        userId: userProfile.id,
        status: 'ACTIVE',
        rulesAcceptedAt: new Date(),
      }
    });

    // 5. Also add to organization if not already there
    const membership = await prisma.userMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: userProfile.id,
          organizationId: pot.organizationId,
        }
      }
    });

    if (!membership) {
      await prisma.userMembership.create({
        data: {
          userId: userProfile.id,
          organizationId: pot.organizationId,
          role: 'CLIENT', // Members are joined as clients/members
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Join error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

