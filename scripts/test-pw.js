const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, passwordHash: true }
  });
  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    const match = await bcrypt.compare('Demo@1234', u.passwordHash);
    if (!match) {
      console.log(`MISMATCH for ${u.email} (${u.role})!`);
    } else {
      console.log(`OK: ${u.email} (${u.role})`);
    }
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
