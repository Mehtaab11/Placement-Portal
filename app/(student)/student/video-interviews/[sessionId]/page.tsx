import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DynamicVideoRecorder } from './VideoRecorderWrapper';

export const metadata = {
  title: 'Mock Video Interview Studio — Placement Portal',
};

export default async function VideoSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { sessionId } = await params;
  const session = await auth();
  if (!session) redirect('/login');

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin/video-interviews');
    }
    redirect('/student/profile');
  }

  // 1. Try finding by VideoInterviewSession.id
  let interviewSession = await prisma.videoInterviewSession.findUnique({
    where: { id: sessionId },
    include: {
      template: true,
    },
  });

  // 2. If not found, check if sessionId was actually a templateId (e.g. /student/video-interviews/tpl_sde_behavioral_01)
  if (!interviewSession) {
    const template = await prisma.videoInterviewTemplate.findUnique({
      where: { id: sessionId },
    });

    if (template) {
      // Find an existing IN_PROGRESS session or create a new session for this student and template
      interviewSession = await prisma.videoInterviewSession.findFirst({
        where: {
          studentId: student.id,
          templateId: template.id,
          status: 'IN_PROGRESS',
        },
        include: {
          template: true,
        },
      });

      if (!interviewSession) {
        interviewSession = await prisma.videoInterviewSession.create({
          data: {
            studentId: student.id,
            templateId: template.id,
            status: 'IN_PROGRESS',
            answers: {},
          },
          include: {
            template: true,
          },
        });
      }

      // Redirect to the canonical session URL
      redirect(`/student/video-interviews/${interviewSession.id}`);
    }
  }

  // 3. Ownership / validity check
  if (!interviewSession || interviewSession.studentId !== student.id) {
    notFound();
  }

  return (
    <DynamicVideoRecorder
      session={JSON.parse(JSON.stringify(interviewSession))}
      studentId={student.id}
    />
  );
}
