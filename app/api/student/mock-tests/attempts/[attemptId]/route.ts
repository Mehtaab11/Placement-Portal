import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const autosaveSchema = z.object({
  answers: z.record(z.string(), z.number().int()),
});

const submitSchema = z.object({
  answers: z.record(z.string(), z.number().int()),
  timeTakenSec: z.number().int().optional(),
});

// PATCH — autosave
export async function PATCH(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { attemptId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, status: true },
  });

  if (!attempt || attempt.studentId !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is no longer in progress' }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = autosaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await prisma.mockAttempt.update({
    where: { id: attemptId },
    data: { answers: parsed.data.answers },
  });

  return NextResponse.json({ saved: true });
}

// POST — submit and score
export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { attemptId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        select: {
          durationMinutes: true,
          negativeMarking: true,
          questions: {
            select: { id: true, correctIndex: true, marks: true, section: true },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Idempotent: return stored result if already submitted
  if (attempt.status === 'SUBMITTED') {
    return NextResponse.json({
      status: 'SUBMITTED',
      score: attempt.score,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      skippedCount: attempt.skippedCount,
      message: 'Already submitted.',
    });
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is expired or in unexpected state' }, { status: 409 });
  }

  // Reject if past deadline with a 30-second grace
  const deadline = new Date(attempt.startedAt.getTime() + attempt.test.durationMinutes * 60 * 1000 + 30_000);
  if (new Date() > deadline) {
    await prisma.mockAttempt.update({
      where: { id: attemptId },
      data: { status: 'EXPIRED' },
    });
    return NextResponse.json({ error: 'Submission deadline passed', status: 'EXPIRED' }, { status: 410 });
  }

  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { answers, timeTakenSec } = parsed.data;
  const questions = attempt.test.questions;
  const negMarking = attempt.test.negativeMarking;

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const sectionStats: Record<string, { correct: number; wrong: number; skipped: number }> = {};

  for (const q of questions) {
    const section = q.section ?? 'General';
    if (!sectionStats[section]) sectionStats[section] = { correct: 0, wrong: 0, skipped: 0 };

    const ans = answers[q.id];
    if (ans === undefined || ans === -1) {
      skippedCount++;
      sectionStats[section].skipped++;
    } else if (ans === q.correctIndex) {
      score += q.marks;
      correctCount++;
      sectionStats[section].correct++;
    } else {
      score -= negMarking * q.marks;
      wrongCount++;
      sectionStats[section].wrong++;
    }
  }

  score = Math.max(0, score);

  await prisma.mockAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      answers,
      score,
      correctCount,
      wrongCount,
      skippedCount,
      timeTakenSec: timeTakenSec ?? null,
      sectionStats,
    },
  });

  return NextResponse.json({ status: 'SUBMITTED', score, correctCount, wrongCount, skippedCount });
}
