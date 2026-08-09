import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminNewDriveClient } from './AdminNewDriveClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewDrivePage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      industry: true,
      size: true,
    },
    orderBy: { name: 'asc' },
  });

  return <AdminNewDriveClient initialCompanies={companies} />;
}
