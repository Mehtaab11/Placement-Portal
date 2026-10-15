import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertEntitlement, consumeQuota } from '@/lib/subscription/guards';
import { EntitlementError } from '@/lib/subscription/guards';

const startSchema = z.object({ testId: z.string().min(1) });

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { testId } = parsed.data;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  // Load the test with package info
  const test = await prisma.mockTest.findUnique({
    where: { id: testId, isPublished: true },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      totalMarks: true,
      negativeMarking: true,
      isFreePreview: true,
      package: { select: { requiredTier: true, title: true } },
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          prompt: true,
          options: true,
          marks: true,
          section: true,
          order: true,
          // NOTE: correctIndex and explanation are intentionally NOT selected here
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  // Entitlement check — free-preview tests bypass quota
  if (!test.isFreePreview) {
    try {
      await assertEntitlement(session.user.id, 'mockTestsPerMonth');
    } catch (err) {
      if (err instanceof EntitlementError) {
        return NextResponse.json(
          { error: err.message, code: err.code, requiredTier: err.requiredTier },
          { status: err.httpStatus },
        );
      }
      throw err;
    }
  }

  // Resume existing IN_PROGRESS attempt instead of creating a duplicate
  const existing = await prisma.mockAttempt.findFirst({
    where: {
      studentId: profile.id,
      testId,
      status: 'IN_PROGRESS',
    },
    select: { id: true, startedAt: true, answers: true },
  });

  if (existing) {
    return NextResponse.json({
      attemptId: existing.id,
      test: {
        id: test.id,
        title: test.title,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        negativeMarking: test.negativeMarking,
      },
      questions: test.questions,
      startedAt: existing.startedAt.toISOString(),
      savedAnswers: existing.answers,
      resumed: true,
    });
  }

  // Consume quota only when creating a new attempt (not on resume)
  if (!test.isFreePreview) {
    try {
      await consumeQuota(profile.id, 'mockTestsPerMonth', session.user.id);
    } catch (err) {
      if (err instanceof EntitlementError) {
        return NextResponse.json(
          { error: err.message, code: err.code, requiredTier: err.requiredTier },
          { status: err.httpStatus },
        );
      }
      throw err;
    }
  }

  const attempt = await prisma.mockAttempt.create({
    data: {
      studentId: profile.id,
      testId,
      status: 'IN_PROGRESS',
      answers: {},
    },
    select: { id: true, startedAt: true },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    test: {
      id: test.id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      negativeMarking: test.negativeMarking,
    },
    questions: test.questions,
    startedAt: attempt.startedAt.toISOString(),
    savedAnswers: {},
    resumed: false,
  });
}
