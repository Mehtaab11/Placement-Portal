import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import styles from '../(admin)/dashboard.module.css';
import type { ReactNode } from 'react';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true },
  });

  const displayName = profile?.fullName || session.user.name || session.user.email;

  // Fetch tier for nav badge — only when subscriptions feature is enabled
  let tier: string | undefined;
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true') {
    const { getStudentEntitlements } = await import('@/lib/subscription/entitlements');
    const ent = await getStudentEntitlements(session.user.id);
    tier = ent.tier;
  }

  return (
    <div className={styles.shell}>
      <AppSidebar
        role="STUDENT"
        userName={displayName}
        tier={tier}
      />
      <div className={styles.main}>
        <AppHeader
          user={{
            name: displayName,
            email: session.user.email,
            role: 'STUDENT',
          }}
          notificationsHref="/student/notifications"
        />
        <main className={styles.body} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
