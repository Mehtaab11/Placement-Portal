import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import styles from '../(admin)/dashboard.module.css';
import type { ReactNode } from 'react';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user.role !== 'STUDENT') redirect('/login');

  return (
    <div className={styles.shell}>
      <AppSidebar
        role="STUDENT"
        userName={session.user.email}
      />
      <div className={styles.main}>
        <AppHeader
          user={{
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
