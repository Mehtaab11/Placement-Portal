const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findUnique({
    where: { email: 'student@demo.com' },
    include: { studentProfile: true },
  });
  console.log('Student Profile in DB:', student?.studentProfile);
}

main().catch(console.error).finally(() => prisma.$disconnect());
