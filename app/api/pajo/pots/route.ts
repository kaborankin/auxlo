import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { requireOrgRole } from '@/lib/authorize';
import { createPot } from '@/lib/pajo/mutations';

/** Create a new pot within an organization. Requires ORG_ADMIN/ORG_MANAGER (or SUPER_ADMIN). */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.organizationId) {
    return NextResponse.json({ ok: false, error: 'organizationId required' }, { status: 400 });
  }

  try {
    await requireOrgRole(userProfile.id, body.organizationId, ['ORG_ADMIN', 'ORG_MANAGER']);
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const pot = await createPot({
      organizationId: body.organizationId,
      slug: body.slug,
      name: body.name,
      contributionAmount: body.contributionAmount ?? 50,
      currency: body.currency ?? 'gbp',
      memberTarget: body.memberTarget ?? 10,
      dueDay: body.dueDay ?? 5,
      dueTime: body.dueTime ?? '18:00',
      graceHours: body.graceHours ?? 24,
      lateFeeAmount: body.lateFeeAmount ?? 5,
      payoutMethod: body.payoutMethod ?? 'AGREED',
      bankDetails: body.bankDetails,
      memberUserIds: body.memberUserIds ?? [],
      actorId: userProfile.id,
      actorEmail: userProfile.email,
    });
    return NextResponse.json({ ok: true, pot });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message ?? 'Failed to create pot' }, { status: 400 });
  }
}
