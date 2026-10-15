import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DynamicTestRunner } from './TestRunnerWrapper';

export const metadata = { title: 'Mock Test — TPO Portal' };

export default async function TestAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { attemptId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect('/student/dashboard');

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      startedAt: true,
      answers: true,
      test: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          totalMarks: true,
          negativeMarking: true,
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              prompt: true,
              options: true,
              marks: true,
              section: true,
              order: true,
              // NO correctIndex or explanation here — pre-submission security
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.id) notFound();

  if (attempt.status === 'SUBMITTED') {
    redirect(`/student/mock-tests/result/${attemptId}`);
  }

  if (attempt.status === 'EXPIRED') {
    redirect('/student/mock-tests');
  }

  const testData = {
    ...attempt.test,
    questions: attempt.test.questions.map((q) => ({
      ...q,
      options: (q.options as string[]) || [],
    })),
  };

  return (
    <DynamicTestRunner
      attemptId={attempt.id}
      test={testData}
      startedAt={attempt.startedAt.toISOString()}
      initialAnswers={(attempt.answers as Record<string, number>) || {}}
    />
  );
}
