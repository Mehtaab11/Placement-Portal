import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.object({
    url: z.string().min(1),
    storageKey: z.string().min(1),
    durationSec: z.number().int().nonnegative(),
  }),
});

const selfRatingSchema = z.object({
  selfRating: z.object({
    clarity: z.number().int().min(1).max(5),
    confidence: z.number().int().min(1).max(5),
    content: z.number().int().min(1).max(5),
  }),
});

// GET session
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const interviewSession = await prisma.videoInterviewSession.findUnique({
    where: { id: sessionId },
    include: { template: true },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Ownership check: only the student who started the session (or an admin/reviewer) can view
  if (session.user.role === 'STUDENT' && (!student || interviewSession.studentId !== student.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ session: interviewSession });
}

// PATCH: Save answer for a question or save selfRating
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const interviewSession = await prisma.videoInterviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.studentId !== student.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if ('selfRating' in body) {
      const { selfRating } = selfRatingSchema.parse(body);
      const updated = await prisma.videoInterviewSession.update({
        where: { id: sessionId },
        data: { selfRating },
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    if ('questionId' in body) {
      const { questionId, answer } = answerSchema.parse(body);

      // Validate storageKey format to avoid arbitrary paths
      if (!answer.storageKey.startsWith(`video_interviews/${student.id}/`)) {
        return NextResponse.json({ error: 'Invalid storage key prefix' }, { status: 400 });
      }

      const existingAnswers = (interviewSession.answers as Prisma.InputJsonObject) || {};
      const updatedAnswers: Prisma.InputJsonObject = {
        ...existingAnswers,
        [questionId]: {
          url: answer.url,
          storageKey: answer.storageKey,
          durationSec: answer.durationSec,
        },
      };

      const updated = await prisma.videoInterviewSession.update({
        where: { id: sessionId },
        data: { answers: updatedAnswers },
      });

      return NextResponse.json({ ok: true, session: updated });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Error updating video interview session:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Submit interview session
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const interviewSession = await prisma.videoInterviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.studentId !== student.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (interviewSession.status !== 'IN_PROGRESS') {
    return NextResponse.json({ ok: true, session: interviewSession });
  }

  const updated = await prisma.videoInterviewSession.update({
    where: { id: sessionId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, session: updated });
}
