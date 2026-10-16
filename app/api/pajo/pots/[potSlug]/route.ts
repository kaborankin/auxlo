import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess, validatePotInvitation } from '@/lib/pajo/access';
import { setPotOpenForJoining, PajoIntegrityError } from '@/lib/pajo/mutations';

/**
 * Public pot preview for the join page. Deliberately requires the
 * invitation token: a slug alone must never reveal that a pot exists, its
 * name, contribution amount, etc. — that's information a private pot's
 * treasurer expects to control via the invite link, not via a guessable
 * URL. Missing/wrong/expired token all return the same generic 404 so the
 * response can't be used to enumerate pots or distinguish failure modes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ potSlug: string }> }
) {
  const { potSlug } = await params;
  const token = new URL(request.url).searchParams.get('token');

  try {
    const result = await validatePotInvitation(potSlug, token);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: 'Invitation not found or no longer valid' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, pot: result.pot });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Treasurer-only: advertise or hide this pot in the /pajo discover list.
 *
 * Requires an *admin* role on the pot (super admin, ORG_ADMIN or
 * ORG_MANAGER) — a plain PotMember must not be able to publish a circle, and
 * publishing only ever exposes metadata (see getDiscoverablePotsForUser),
 * never the ledger, members or bank details.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ potSlug: string }> }
) {
  const { potSlug } = await params;
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

  const access = await getPajoAccess(userProfile.id, potSlug);
  if (!access || access.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.openForJoining !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'openForJoining (boolean) required' }, { status: 400 });
  }

  try {
    const pot = await setPotOpenForJoining({
      potId: access.pot.id,
      organizationId: access.pot.organizationId,
      actorId: userProfile.id,
      actorEmail: session.user.email as string,
      open: body.openForJoining,
    });

    return NextResponse.json({
      ok: true,
      pot: { slug: pot.slug, openForJoining: pot.openForJoining },
    });
  } catch (error: any) {
    if (error instanceof PajoIntegrityError) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Failed to update pot visibility:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}


