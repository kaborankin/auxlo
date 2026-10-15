import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');

  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email as string },
  });
  
  if (!userProfile) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
  }

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: userProfile.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: userProfile.id, readAt: null },
      }),
    ]);

    return NextResponse.json({ 
      ok: true, 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
