import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Crown } from 'lucide-react';
import styles from './grant.module.css';

export const metadata = { title: 'Grant Subscription — Admin' };

export default async function GrantSubscriptionPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const [students, plans] = await Promise.all([
    prisma.studentProfile.findMany({
      select: {
        id: true,
        fullName: true,
        rollNumber: true,
        user: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
      take: 100,
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return (
    <div className={styles.container}>
      <Link href="/admin/subscriptions" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Subscriptions
      </Link>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}><Crown size={22} /></div>
          <div>
            <h1 className={styles.title}>Grant Manual Subscription</h1>
            <p className={styles.subtitle}>
              Grant or extend subscription access for a student (source = ADMIN_GRANT).
            </p>
          </div>
        </div>

        <form action="/api/admin/subscriptions/grant" method="POST" className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="studentId" className={styles.label}>Select Student</label>
            <select id="studentId" name="studentId" required className={styles.select}>
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.rollNumber || 'N/A'}) — {s.user.email}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="planId" className={styles.label}>Select Plan</label>
            <select id="planId" name="planId" required className={styles.select}>
              <option value="">Choose a plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tier}) — {p.durationDays} Days
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="note" className={styles.label}>Audit Note / Reason</label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="e.g. Placement Cell Scholarship / Placement Committee"
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Grant Subscription
          </button>
        </form>
      </div>
    </div>
  );
}
