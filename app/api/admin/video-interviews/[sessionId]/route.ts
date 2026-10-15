import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const reviewSchema = z.object({
  reviewerFeedback: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'RECRUITER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reviewerFeedback } = reviewSchema.parse(body);

    const videoSession = await prisma.videoInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { select: { userId: true, fullName: true } },
        template: { select: { title: true } },
      },
    });

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.videoInterviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'REVIEWED',
          reviewerId: session.user.id,
          reviewerFeedback,
          reviewedAt: new Date(),
        },
      });

      // Notify student of feedback
      await tx.notification.create({
        data: {
          userId: videoSession.student.userId,
          type: 'APPLICATION_UPDATE',
          title: 'Video Interview Feedback Available',
          message: `Your mock interview for "${videoSession.template.title}" has been reviewed by the placement team.`,
          link: `/student/video-interviews/${videoSession.id}`,
        },
      });

      return s;
    });

    return NextResponse.json({ ok: true, session: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Error reviewing session:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
