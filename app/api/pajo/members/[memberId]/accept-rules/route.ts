import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { acceptPotRules } from '@/lib/pajo/mutations';

/** A member accepts the group rules for themselves before contributing. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await params;
  const member = await prisma.potMember.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile || userProfile.id !== member.userId) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const updated = await acceptPotRules({ memberId });
  return NextResponse.json({ ok: true, member: updated });
}
