import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { requestToJoinPot, PajoIntegrityError } from '@/lib/pajo/mutations';

/**
 * Member-side: ask to join a pot its treasurer has advertised
 * (`openForJoining`). Creates a PENDING PotJoinRequest and notifies the pot's
 * admins. This grants NO access by itself — reviewJoinRequest creates the
 * PotMember once a treasurer approves it.
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

  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email as string },
  });
  if (!userProfile) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    const joinRequest = await requestToJoinPot({
      potSlug,
      userId: userProfile.id,
      userEmail: session.user.email as string,
      message: typeof body?.message === 'string' ? body.message.slice(0, 500) : null,
    });

    return NextResponse.json({ ok: true, status: joinRequest.status });
  } catch (error: any) {
    if (error instanceof PajoIntegrityError) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Failed to create join request:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
