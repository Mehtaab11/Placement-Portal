import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaymentProvider } from '@/lib/payments';
import { checkRateLimit } from '@/lib/rate-limit';

const checkoutSchema = z.object({
  planId: z.string().min(1),
});

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 checkout attempts per student per minute
  if (!checkRateLimit(`checkout:${session.user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { planId } = parsed.data;

  // Resolve the plan from DB — never trust client-sent prices
  const plan = await prisma.plan.findUnique({
    where: { id: planId, isActive: true },
    select: { id: true, name: true, tier: true, pricePaise: true, durationDays: true, description: true },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
  }

  // Get the student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const provider = getPaymentProvider();

  const order = await provider.createOrder({
    planId: plan.id,
    amountPaise: plan.pricePaise,
    currency: 'INR',
    studentId: profile.id,
  });

  // Create Payment(CREATED) and Subscription(PENDING) records
  const [payment, subscription] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        studentId: profile.id,
        planId: plan.id,
        provider: 'MOCK',
        providerOrderId: order.providerOrderId,
        amountPaise: plan.pricePaise,
        currency: 'INR',
        status: 'CREATED',
      },
      select: { id: true, providerOrderId: true },
    }),
    prisma.subscription.create({
      data: {
        studentId: profile.id,
        planId: plan.id,
        status: 'PENDING',
        // Placeholder dates — will be set on confirmation
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        source: 'PURCHASE',
      },
      select: { id: true },
    }),
  ]);

  // Link payment → subscription
  await prisma.payment.update({
    where: { id: payment.id },
    data: { subscriptionId: subscription.id },
  });

  return NextResponse.json({
    orderId: order.providerOrderId,
    amountPaise: plan.pricePaise,
    currency: 'INR',
    planSummary: {
      name: plan.name,
      tier: plan.tier,
      durationDays: plan.durationDays,
      description: plan.description,
    },
    isDemoMode: process.env.PAYMENT_PROVIDER === 'mock' || !process.env.PAYMENT_PROVIDER,
  });
}
