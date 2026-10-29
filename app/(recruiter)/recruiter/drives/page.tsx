import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RecruiterDrivesClient } from './RecruiterDrivesClient';

export default async function RecruiterDrivesListPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  const drives = recruiter
    ? await prisma.drive.findMany({
        where: { recruiterId: recruiter.id },
        include: {
          applications: true,
          eligibilityCriteria: true,
          rounds: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return <RecruiterDrivesClient initialDrives={drives} />;
}
