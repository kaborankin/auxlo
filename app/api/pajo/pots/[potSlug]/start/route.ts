import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { startPotCycle } from '@/lib/pajo/mutations';
import { requireOrgRole } from '@/lib/authorize';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ potSlug: string }> }
) {
  const { potSlug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ ok: false, error: 'Pot not found' }, { status: 404 });
    }

    // 1. Check permissions
    try {
      await requireOrgRole(userProfile.id, pot.organizationId, ['ORG_ADMIN', 'ORG_MANAGER']);
    } catch {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Check if already started
    const existingCycle = await prisma.potCycle.findFirst({
      where: { potId: pot.id, status: 'ACTIVE' }
    });
    if (existingCycle) {
      return NextResponse.json({ ok: false, error: 'Cycle already active' }, { status: 400 });
    }

    // 3. Check member count
    if (pot.members.length < pot.memberTarget) {
      return NextResponse.json({ ok: false, error: `Need ${pot.memberTarget} members (have ${pot.members.length})` }, { status: 400 });
    }

    // 4. Start cycle
    await startPotCycle({
      potId: pot.id,
      memberUserIds: pot.members.map(m => m.userId),
      startDate: new Date(),
      actorId: userProfile.id,
      actorEmail: userProfile.email,
      organizationId: pot.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Start cycle error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
