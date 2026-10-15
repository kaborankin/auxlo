import { PrismaClient } from '@prisma/client';
import { createPot, recordContributionPayment, markWeekPaidOut } from '../lib/pajo/mutations';
import { getPotOverview } from '../lib/pajo/queries';

const prisma = new PrismaClient();

async function runSimulation() {
  console.log('🚀 Starting PAJO End-to-End Simulation...');

  // 1. Get or Create Simulation User
  const email = 'simulation@auxlo.uk';
  const user = await prisma.userProfile.upsert({
    where: { email },
    update: { status: 'onboarded' },
    create: {
      id: 'sim-user-1',
      email,
      name: 'Sim Treasurer',
      source: 'simulation',
      status: 'onboarded',
    }
  });

  // 2. Create Simulation Org
  const org = await prisma.organization.upsert({
    where: { slug: 'sim-org' },
    update: {},
    create: {
      id: 'sim-org-id',
      name: 'Simulation Circles',
      slug: 'sim-org',
      members: {
        create: {
          userId: user.id,
          role: 'ORG_ADMIN',
        }
      }
    }
  });

  console.log('✅ Org & User ready.');

  // 3. Create a 3-member Pot
  const potSlug = `sim-pot-${Date.now()}`;
  const pot = await createPot({
    organizationId: org.id,
    name: 'Simulated 3-Member Pot',
    slug: potSlug,
    contributionAmount: 100,
    memberTarget: 3,
    frequency: 'weekly',
    managedBy: 'TREASURER',
    actorId: user.id,
    actorEmail: user.email,
    memberUserIds: [], // We'll add them manually to test the "Join" flow logic
  });

  console.log(`✅ Pot created: ${pot.slug}`);

  // 4. Add 2 more members manually
  const memberEmails = ['member1@sim.local', 'member2@sim.local'];
  for (let i = 0; i < memberEmails.length; i++) {
    const mEmail = memberEmails[i];
    const mUser = await prisma.userProfile.upsert({
      where: { email: mEmail },
      update: {},
      create: {
        id: `sim-member-${i}`,
        email: mEmail,
        name: `Member ${i + 1}`,
        source: 'simulation',
      }
    });

    await prisma.potMember.create({
      data: {
        potId: pot.id,
        userId: mUser.id,
        status: 'ACTIVE',
      }
    });
    
    await prisma.userMembership.upsert({
      where: { userId_organizationId: { userId: mUser.id, organizationId: org.id } },
      update: {},
      create: { userId: mUser.id, organizationId: org.id, role: 'CLIENT' }
    });
  }

  console.log('✅ Members added.');

  // 5. Start Cycle
  const allMembers = await prisma.potMember.findMany({ where: { potId: pot.id } });
  
  // Need to import startPotCycle logic
  // Since we're in a script, let's trigger the API or use the mutation directly
  const { startPotCycle } = require('../lib/pajo/mutations');
  await startPotCycle({
    potId: pot.id,
    memberUserIds: allMembers.map(m => m.userId),
    startDate: new Date(),
    actorId: user.id,
    actorEmail: user.email,
    organizationId: org.id,
  });

  console.log('✅ Cycle 1 started.');

  // 6. Simulate a Payment
  const overview = await getPotOverview(pot.slug);
  if (overview?.currentWeek) {
    const contribution = overview.currentWeek.contributions[0];
    await recordContributionPayment({
      contributionId: contribution.contributionId,
      amountPaid: 100,
      reference: 'SIM-PAY-001',
      actorId: user.id,
      actorEmail: user.email,
      organizationId: org.id,
    });
    console.log(`✅ Payment recorded for ${contribution.memberName}`);
  }

  console.log('\n🏁 Simulation Complete!');
  console.log(`View the result at: http://localhost:3000/pajo/${pot.slug}`);
}

runSimulation()
  .catch(err => console.error('❌ Simulation failed:', err))
  .finally(() => prisma.$disconnect());
