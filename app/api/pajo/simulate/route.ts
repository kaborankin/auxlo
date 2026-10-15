import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { createPot, recordContributionPayment, startPotCycle } from '@/lib/pajo/mutations';
import { getPotOverview } from '@/lib/pajo/queries';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Security: Only allow you to run this
  if (session?.user?.email !== 'hello@auxlo.uk') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting PAJO Simulation...');

    // 1. Setup Simulation User
    const email = 'simulation@auxlo.uk';
    const simUser = await prisma.userProfile.upsert({
      where: { email },
      update: { status: 'onboarded' },
      create: {
        id: `sim-user-${Date.now()}`,
        email,
        name: 'Sim Member',
        source: 'simulation',
        status: 'onboarded',
      }
    });

    // 2. Find your Org
    const membership = await prisma.userMembership.findFirst({
      where: { user: { email: 'hello@auxlo.uk' }, role: 'ORG_ADMIN' },
      include: { organization: true }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Please onboard as a Treasurer first.' });
    }

    const orgId = membership.organizationId;
    const actorId = membership.userId;

    // 3. Create a 3-member Pot
    const potSlug = `sim-pot-${Math.floor(Math.random() * 1000)}`;
    const pot = await createPot({
      organizationId: orgId,
      name: 'Simulated 3-Member Pot',
      slug: potSlug,
      contributionAmount: 100,
      memberTarget: 3,
      frequency: 'weekly',
      managedBy: 'TREASURER',
      actorId,
      actorEmail: session.user?.email as string,
      memberUserIds: [], 
    });

    // 4. Add 2 members (You + Sim User + another robot)
    const membersToJoin = [
      { id: actorId, name: 'You' },
      { id: simUser.id, name: 'Sim User' },
      { id: `robot-${Date.now()}`, name: 'Robot Member', email: `robot-${Date.now()}@auxlo.uk` }
    ];

    for (const m of membersToJoin) {
      // Ensure profile exists for robot
      if (m.id.startsWith('robot')) {
        await prisma.userProfile.upsert({
          where: { email: m.email },
          update: {},
          create: { id: m.id, email: m.email!, name: m.name, source: 'simulation' }
        });
      }

      await prisma.potMember.create({
        data: { potId: pot.id, userId: m.id, status: 'ACTIVE' }
      });

      await prisma.userMembership.upsert({
        where: { userId_organizationId: { userId: m.id, organizationId: orgId } },
        update: {},
        create: { userId: m.id, organizationId: orgId, role: 'CLIENT' }
      });
    }

    // 5. Start Cycle
    await startPotCycle({
      potId: pot.id,
      memberUserIds: membersToJoin.map(m => m.id),
      startDate: new Date(),
      actorId,
      actorEmail: session.user?.email as string,
      organizationId: orgId,
    });

    // 6. Record one payment for you
    const overview = await getPotOverview(pot.slug);
    if (overview?.currentWeek) {
      const myContribution = overview.currentWeek.contributions.find(c => c.userId === actorId);
      if (myContribution) {
        await recordContributionPayment({
          contributionId: myContribution.contributionId,
          amountPaid: 100,
          reference: 'SIM-AUTO-PAY',
          actorId,
          actorEmail: session.user?.email as string,
          organizationId: orgId,
        });
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Simulation complete!', 
      url: `/pajo/${pot.slug}` 
    });

  } catch (err: any) {
    console.error('Sim Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
