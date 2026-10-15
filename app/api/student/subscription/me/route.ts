import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getStudentEntitlements } from '@/lib/subscription/entitlements';
import { getCurrentPeriodUsage } from '@/lib/subscription/guards';

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const take = 10;
  const skip = (page - 1) * take;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const entitlements = await getStudentEntitlements(session.user.id);

  // Current active subscription
  const now = new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      studentId: profile.id,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: now },
    },
    select: {
      id: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      canceledAt: true,
      source: true,
      plan: {
        select: { name: true, tier: true, durationDays: true, pricePaise: true },
      },
    },
    orderBy: { currentPeriodEnd: 'desc' },
  });

  // Payment history — paginated
  const [payments, totalPayments] = await prisma.$transaction([
    prisma.payment.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        status: true,
        amountPaise: true,
        currency: true,
        receiptNumber: true,
        failureReason: true,
        createdAt: true,
        plan: { select: { name: true, tier: true } },
      },
    }),
    prisma.payment.count({ where: { studentId: profile.id } }),
  ]);

  // Current period usage
  const mockTestUsage = await getCurrentPeriodUsage(profile.id, 'mockTestsPerMonth');
  const videoUsage = await getCurrentPeriodUsage(profile.id, 'videoInterviewsPerMonth');

  return NextResponse.json({
    entitlements: {
      tier: entitlements.tier,
      isActive: entitlements.isActive,
      expiresAt: entitlements.expiresAt,
      daysLeft: entitlements.daysLeft,
      features: entitlements.features,
    },
    subscription,
    payments,
    pagination: {
      page,
      take,
      total: totalPayments,
      totalPages: Math.ceil(totalPayments / take),
    },
    usage: {
      mockTestsThisMonth: mockTestUsage,
      videoInterviewsThisMonth: videoUsage,
    },
  });
}
