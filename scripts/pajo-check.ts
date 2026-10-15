import prisma from '../lib/db';
import { getPotOverview } from '../lib/pajo/queries';

async function main() {
  const pot = await prisma.pot.findUnique({ where: { slug: 'review-pot' } });
  if (!pot) {
    console.log('POT MISSING — seed did not complete');
    return;
  }
  const members = await prisma.potMember.count({ where: { potId: pot.id } });
  const weeks = await prisma.potWeek.count({
    where: { cycle: { potId: pot.id } },
  });
  const contributions = await prisma.contribution.count({
    where: { week: { cycle: { potId: pot.id } } },
  });
  const paid = await prisma.contribution.count({
    where: { week: { cycle: { potId: pot.id } }, status: 'PAID' },
  });
  const overview = await getPotOverview('review-pot');
  console.log(`Pot OK — members=${members} weeks=${weeks} contributions=${contributions} paid=${paid}`);
  console.log(`Week 1 collected: ${overview?.currentWeek?.totalCollected} / ${overview?.currentWeek?.totalExpected}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
