import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.userProfile.update({
    where: { email: 'hello@auxlo.uk' },
    data: { status: 'new' }
  });
  console.log('User status reset to new');
  await prisma.$disconnect();
}
main();
