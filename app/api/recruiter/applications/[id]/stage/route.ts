import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { stage, notes, interviewTime } = body;

  const app = await prisma.application.update({
    where: { id },
    data: {
      stage,
      stageHistory: {
        create: {
          stage,
          notes: notes || `Stage updated to ${stage}`,
          changedById: session.user.id,
        },
      },
      ...(stage === 'INTERVIEW' && interviewTime
        ? {
            interviewSlots: {
              create: {
                scheduledAt: new Date(interviewTime),
                round: 'Technical Interview',
                location: 'Campus TPO Block / Online',
              },
            },
          }
        : {}),
    },
    include: {
      student: { include: { user: true } },
      drive: true,
    },
  });

  // If offered, mark student as placed in studentProfile
  if (stage === 'OFFERED') {
    await prisma.studentProfile.update({
      where: { id: app.studentId },
      data: {
        isPlaced: true,
        placedCompany: app.drive.title,
        placedCTC: app.drive.ctcMax,
      },
    });
  }

  // Create notification for student
  if (app.student?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: app.student.user.id,
        type: 'APPLICATION_UPDATE',
        title: `Status Update: ${app.drive.title}`,
        message: `Your application stage has moved to ${stage}.`,
        link: `/student/applications`,
      },
    });
  }

  return NextResponse.json({ success: true, application: app });
}
