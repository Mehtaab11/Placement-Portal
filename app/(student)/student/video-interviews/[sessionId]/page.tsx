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
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) redirect('/student/profile');

  const interviewSession = await prisma.videoInterviewSession.findUnique({
    where: { id: sessionId },
    include: {
      template: true,
    },
  });

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
