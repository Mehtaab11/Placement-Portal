import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaymentProvider } from '@/lib/payments';
import { checkRateLimit } from '@/lib/rate-limit';
import type { SimulatedOutcome } from '@/lib/payments/types';

const confirmSchema = z.object({
  orderId: z.string().min(1),
  simulatedOutcome: z.enum(['SUCCESS', 'FAILURE', 'CANCELLED']).optional(),
});

function generateReceiptNumber(): string {
  const seq = String(Date.now()).slice(-6);
  return `TPO-${new Date().getFullYear()}-${seq}`;
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 confirm attempts per student per minute
  if (!checkRateLimit(`confirm:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId, simulatedOutcome } = parsed.data;

  // Ownership check — verify the payment belongs to this student
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderId },
    include: {
      plan: { select: { durationDays: true, name: true, tier: true } },
      subscription: { select: { id: true, status: true } },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (payment.studentId !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Idempotency: if already completed, return the stored result
  if (payment.status === 'PAID') {
    return NextResponse.json({
      status: 'PAID',
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      message: 'Payment already confirmed.',
    });
  }

  if (payment.status === 'FAILED') {
    return NextResponse.json({
      status: 'FAILED',
      failureReason: payment.failureReason,
      message: 'Payment already processed as failed.',
    });
  }

  // Only CREATED payments can be confirmed
  if (payment.status !== 'CREATED') {
    return NextResponse.json({ error: 'Order is in an unexpected state.' }, { status: 409 });
  }

  const provider = getPaymentProvider();

  const result = await provider.confirmPayment({
    providerOrderId: orderId,
    simulatedOutcome: simulatedOutcome as SimulatedOutcome | undefined,
  });

  if (result.status === 'PAID') {
    const receiptNumber = generateReceiptNumber();
    const now = new Date();

    // Determine period: extend from currentPeriodEnd if student already has an active subscription
    const existingActive = await prisma.subscription.findFirst({
      where: {
        studentId: profile.id,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now },
        id: { not: payment.subscriptionId ?? undefined },
      },
      select: { currentPeriodEnd: true },
    });

    const periodStart = existingActive
      ? existingActive.currentPeriodEnd
      : now;
    const periodEnd = new Date(periodStart.getTime() + payment.plan.durationDays * 24 * 60 * 60 * 1000);

    // Expire any old active subscriptions first, then activate the new one
    await prisma.$transaction(async (tx) => {
      // Mark old active subscriptions expired
      await tx.subscription.updateMany({
        where: {
          studentId: profile.id,
          status: 'ACTIVE',
          id: { not: payment.subscriptionId ?? undefined },
        },
        data: { status: 'EXPIRED' },
      });

      // Activate the pending subscription
      if (payment.subscriptionId) {
        await tx.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });
      }

      // Mark payment as PAID
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerPaymentId: result.providerPaymentId,
          receiptNumber,
        },
      });

      // Create in-app notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'ANNOUNCEMENT',
          title: `Welcome to ${payment.plan.tier}!`,
          message: `Your ${payment.plan.name} subscription is now active until ${periodEnd.toDateString()}.`,
          link: '/student/subscription',
        },
      });
    });

    return NextResponse.json({
      status: 'PAID',
      paymentId: payment.id,
      receiptNumber,
      tier: payment.plan.tier,
      validUntil: periodEnd.toISOString(),
    });
  }

  // FAILED / CANCELLED
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      providerPaymentId: result.providerPaymentId,
      failureReason: result.failureReason,
    },
  });

  return NextResponse.json({
    status: 'FAILED',
    failureReason: result.failureReason,
  });
}
