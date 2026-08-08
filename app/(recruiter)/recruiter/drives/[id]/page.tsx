import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CandidatePipelineClient from './CandidatePipelineClient';

export default async function DriveCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const { id } = await params;

  const drive = await prisma.drive.findUnique({
    where: { id },
    include: {
      company: true,
      eligibilityCriteria: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      applications: {
        include: {
          student: {
            include: {
              academicRecords: true,
              user: true,
            },
          },
          stageHistory: { orderBy: { changedAt: 'desc' } },
          interviewSlots: true,
        },
        orderBy: { appliedAt: 'desc' },
      },
    },
  });

  if (!drive) redirect('/recruiter/drives');

  return <CandidatePipelineClient drive={drive} />;
}
