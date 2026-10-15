import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`\n=== Found ${plans.length} plans ===\n`);
  for (const p of plans) {
    console.log(`  [${p.sortOrder}] ${p.slug} | ${p.tier} | Rs${p.pricePaise / 100} | active=${p.isActive} | ${p.durationDays}d`);
  }
  if (plans.length === 0) {
    console.log('  (none - seed data has not been applied)');
  }
  await prisma.$disconnect();
}

main();
