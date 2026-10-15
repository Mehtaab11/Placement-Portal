import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertEntitlement, consumeQuota, EntitlementError } from '@/lib/subscription/guards';

const startSchema = z.object({
  templateId: z.string().min(1),
});

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Subscriptions are not enabled' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { templateId } = startSchema.parse(body);

    const template = await prisma.videoInterviewTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.isPublished) {
      return NextResponse.json({ error: 'Interview template not found' }, { status: 404 });
    }

    // Check for an existing IN_PROGRESS session
    const existing = await prisma.videoInterviewSession.findFirst({
      where: {
        studentId: student.id,
        templateId,
        status: 'IN_PROGRESS',
      },
    });

    if (existing) {
      return NextResponse.json({ sessionId: existing.id, resumed: true });
    }

    // Assert entitlement & consume monthly video interview quota
    await assertEntitlement(session.user.id, 'videoInterviewsPerMonth');
    await consumeQuota(student.id, 'videoInterviewsPerMonth', session.user.id);

    // Create new session
    const newSession = await prisma.videoInterviewSession.create({
      data: {
        studentId: student.id,
        templateId,
        status: 'IN_PROGRESS',
        answers: {},
      },
    });

    return NextResponse.json({ sessionId: newSession.id, resumed: false }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof EntitlementError) {
      return NextResponse.json(
        { error: err.message, code: err.code, requiredTier: err.requiredTier },
        { status: err.httpStatus },
      );
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Error starting video interview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
