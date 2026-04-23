import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.id}]`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
