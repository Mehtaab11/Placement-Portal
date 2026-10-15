import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      tier: true,
      name: true,
      slug: true,
      description: true,
      durationDays: true,
      pricePaise: true,
      features: true,
      sortOrder: true,
    },
  });
}

export async function GET() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await getActivePlans();

  return NextResponse.json({ plans });
}
