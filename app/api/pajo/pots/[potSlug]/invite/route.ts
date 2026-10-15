import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess } from '@/lib/pajo/access';
import { regenerateInviteToken } from '@/lib/pajo/mutations';

/**
 * Treasurer-only. GET returns the current invite token/expiry (admin view
 * only — this is deliberately a different, authenticated+authorized route
 * from the public preview endpoint, which never returns the token itself).
 * POST regenerates the token, immediately revoking any previously shared
 * link — the pot's "revoke invitation" control for V1.
 */
async function requireAdminAccess(potSlug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) } as const;
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email as string },
  });
  if (!userProfile) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) } as const;
  }

  const access = await getPajoAccess(userProfile.id, potSlug);
  if (!access || access.role !== 'admin') {
    return { error: NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 }) } as const;
  }

  return { userProfile, access } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ potSlug: string }> },
) {
  const { potSlug } = await params;
  const result = await requireAdminAccess(potSlug);
  if ('error' in result) return result.error;

  const pot = await prisma.pot.findUnique({
    where: { slug: potSlug },
    select: { inviteToken: true, inviteExpiresAt: true },
  });
  if (!pot) return NextResponse.json({ ok: false, error: 'Pot not found' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    inviteToken: pot.inviteToken,
    inviteExpiresAt: pot.inviteExpiresAt,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ potSlug: string }> },
) {
  const { potSlug } = await params;
  const result = await requireAdminAccess(potSlug);
  if ('error' in result) return result.error;
  const { userProfile, access } = result;

  const updated = await regenerateInviteToken({
    potId: access.pot.id,
    actorId: userProfile.id,
    actorEmail: userProfile.email,
    organizationId: access.pot.organizationId,
  });

  return NextResponse.json({
    ok: true,
    inviteToken: updated.inviteToken,
    inviteExpiresAt: updated.inviteExpiresAt,
  });
}
