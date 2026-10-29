import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminVideoInterviewsClient } from './AdminVideoInterviewsClient';

export const metadata = { title: 'Mock Video Interview Studio — Admin' };

export default async function AdminVideoInterviewsPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const now = new Date();

  // 1. Fetch all student video interview sessions
  const sessions = await prisma.videoInterviewSession.findMany({
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          rollNumber: true,
          branch: true,
          batch: true,
          cgpa: true,
          user: { select: { email: true } },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: { select: { name: true, tier: true } } },
            take: 1,
          },
        },
      },
      template: {
        select: {
          id: true,
          title: true,
          domain: true,
          description: true,
          requiredTier: true,
          questions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // 2. Fetch upgraded students with active PRO or PREMIUM subscriptions
  const upgradedStudents = await prisma.studentProfile.findMany({
    where: {
      subscriptions: {
        some: {
          status: 'ACTIVE',
          currentPeriodEnd: { gt: now },
          plan: { tier: { in: ['PRO', 'PREMIUM'] } },
        },
      },
    },
    include: {
      user: { select: { email: true } },
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: { select: { name: true, tier: true } } },
        take: 1,
      },
      videoSessions: {
        select: { id: true, status: true, startedAt: true, submittedAt: true },
      },
    },
    orderBy: { fullName: 'asc' },
    take: 100,
  });

  // 3. Fetch published interview templates with metrics
  const templates = await prisma.videoInterviewTemplate.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { sessions: true } },
    },
  });

  // Calculate high-level KPIs
  const totalSessions = sessions.length;
  const pendingReview = sessions.filter((s) => s.status === 'SUBMITTED').length;
  const reviewed = sessions.filter((s) => s.status === 'REVIEWED').length;
  const upgradedCount = upgradedStudents.length;

  return (
    <AdminVideoInterviewsClient
      initialSessions={JSON.parse(JSON.stringify(sessions))}
      upgradedStudents={JSON.parse(JSON.stringify(upgradedStudents))}
      templates={JSON.parse(JSON.stringify(templates))}
      metrics={{
        totalSessions,
        pendingReview,
        reviewed,
        upgradedCount,
      }}
    />
  );
}
