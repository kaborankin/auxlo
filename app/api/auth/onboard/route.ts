import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  // Try getting session via getServerSession
  let session = await getServerSession(authOptions);
  
  // Fallback: try getting token directly
  const token = await getToken({ 
    req: request as any, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (token && !session) {
    session = {
      user: {
        email: token.email,
        name: token.name,
      }
    } as any;
  }
  
  console.log('[Onboard API] Debug:', { 
    hasSession: !!session, 
    hasToken: !!token,
    email: session?.user?.email || token?.email 
  });

  const email = session?.user?.email || (token?.email as string);

  if (!email) {
    console.log('[Onboard API] Unauthorized: No email found in session or token');
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { role } = await request.json();

  if (!role || (role !== 'treasurer' && role !== 'member')) {
    return NextResponse.json({ ok: false, error: 'Invalid role' }, { status: 400 });
  }

  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: email },
      include: { memberships: true },
    });

    if (!userProfile) {
      return NextResponse.json({ ok: false, error: 'User profile not found' }, { status: 404 });
    }

    // If they already have memberships, they've already onboarded
    if (userProfile.memberships.length > 0) {
      return NextResponse.json({ ok: true, message: 'Already onboarded' });
    }

    if (role === 'treasurer') {
      // Create a default organization for the treasurer
      const orgName = `${userProfile.name}'s Circles`;
      const orgSlug = `${userProfile.name.toLowerCase().replace(/\s+/g, '-')}-circles-${Math.floor(
        Math.random() * 1000,
      )}`;

      const org = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          members: {
            create: {
              userId: userProfile.id,
              role: 'ORG_ADMIN',
            },
          },
        },
      });

      // Mark onboarding as complete
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { status: 'onboarded' },
      });

      return NextResponse.json({ ok: true, organizationId: org.id });
    }

    // Mark onboarding as complete
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { status: 'onboarded' },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
