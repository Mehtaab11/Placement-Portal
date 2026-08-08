import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminDrivesClient } from './AdminDrivesClient';

export const dynamic = 'force-dynamic';

export default async function AdminDrivesPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const drives = await prisma.drive.findMany({
    include: {
      company: true,
      eligibilityCriteria: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      applications: {
        select: {
          id: true,
          stage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalDrives = drives.length;
  const liveDrives = drives.filter((d) => d.status === 'LIVE').length;
  const totalApps = drives.reduce((acc, d) => acc + d.applications.length, 0);
  const totalOffers = drives.reduce(
    (acc, d) => acc + d.applications.filter((a) => a.stage === 'OFFERED').length,
    0
  );

  return (
    <AdminDrivesClient
      drives={JSON.parse(JSON.stringify(drives))}
      metrics={{ totalDrives, liveDrives, totalApps, totalOffers }}
    />
  );
}
