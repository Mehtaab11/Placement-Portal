import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      studentId: profile.id,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: now },
    },
    select: { id: true, currentPeriodEnd: true },
    orderBy: { currentPeriodEnd: 'desc' },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription to cancel.' }, { status: 404 });
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: now,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Subscription cancelled. Access continues until ${subscription.currentPeriodEnd.toDateString()}.`,
    accessUntil: subscription.currentPeriodEnd.toISOString(),
  });
}
