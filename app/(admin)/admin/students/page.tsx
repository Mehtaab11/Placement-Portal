import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import StudentDirectoryClient from './StudentDirectoryClient';

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { email: true, createdAt: true } },
      academicRecords: true,
      applications: {
        include: {
          drive: { include: { company: true } },
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  return <StudentDirectoryClient initialStudents={students} />;
}
