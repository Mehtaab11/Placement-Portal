import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import styles from '../(admin)/dashboard.module.css';
import type { ReactNode } from 'react';

export default async function RecruiterLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user.role !== 'RECRUITER') redirect('/login');

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true, company: { select: { name: true } } },
  });

  const displayName = profile?.fullName || profile?.company?.name || session.user.name || session.user.email;

  return (
    <div className={styles.shell}>
      <AppSidebar
        role="RECRUITER"
        userName={displayName}
      />
      <div className={styles.main}>
        <AppHeader
          user={{
            name: displayName,
            email: session.user.email,
            role: 'RECRUITER',
          }}
          notificationsHref="/recruiter/notifications"
        />
        <main className={styles.body} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
