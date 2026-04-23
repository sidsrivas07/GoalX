import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const anonymousId = '00000000-0000-0000-0000-000000000000';
  
  const user = await prisma.user.upsert({
    where: { id: anonymousId },
    update: {},
    create: {
      id: anonymousId,
      email: 'anonymous@goalx.app',
      name: 'Anonymous User',
      password: 'nopasswordneeded'
    }
  });
  
  console.log('Anonymous user checked/created:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
