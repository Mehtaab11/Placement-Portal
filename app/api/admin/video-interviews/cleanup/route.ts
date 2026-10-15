import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const deleted = await prisma.videoInterviewSession.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
    },
  });

  return NextResponse.json({
    ok: true,
    deletedCount: deleted.count,
    threshold: ninetyDaysAgo.toISOString(),
  });
}
