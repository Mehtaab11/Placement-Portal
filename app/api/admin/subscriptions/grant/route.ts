import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const grantSchema = z.object({
  studentId: z.string().min(1),
  planId: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let studentId = '';
    let planId = '';
    let note = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      studentId = formData.get('studentId') as string;
      planId = formData.get('planId') as string;
      note = (formData.get('note') as string) || '';
    } else {
      const body = await req.json();
      const parsed = grantSchema.parse(body);
      studentId = parsed.studentId;
      planId = parsed.planId;
      note = parsed.note || '';
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { id: true, userId: true },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const now = new Date();

    // Check for existing active subscription to extend
    const existingActive = await prisma.subscription.findFirst({
      where: {
        studentId: student.id,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now },
      },
    });

    const periodStart = existingActive ? existingActive.currentPeriodStart : now;
    const baseEnd = existingActive ? existingActive.currentPeriodEnd : now;
    const periodEnd = new Date(baseEnd.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const sourceStr = note ? `ADMIN_GRANT: ${note}` : 'ADMIN_GRANT';
      if (existingActive) {
        await tx.subscription.update({
          where: { id: existingActive.id },
          data: {
            planId: plan.id,
            currentPeriodEnd: periodEnd,
            source: sourceStr,
          },
        });
      } else {
        await tx.subscription.create({
          data: {
            studentId: student.id,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            source: sourceStr,
          },
        });
      }

      // Notify the student
      await tx.notification.create({
        data: {
          userId: student.userId,
          type: 'ANNOUNCEMENT',
          title: `Subscription Granted: ${plan.name}`,
          message: `The Placement Cell has granted you ${plan.durationDays} days of ${plan.tier} access. Enjoy your prep!`,
          link: '/student/subscription',
        },
      });
    });

    // In Next.js App Router, handle form redirect if from html form
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/admin/subscriptions', req.url));
    }

    return NextResponse.json({ ok: true, message: 'Subscription granted successfully' });
  } catch (err: unknown) {
    console.error('Error granting subscription:', err);
    return NextResponse.json({ error: 'Failed to grant subscription' }, { status: 500 });
  }
}
