import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './packages.module.css';

export const metadata = { title: 'Manage Mock Test Packages — Admin' };

export default async function AdminPackagesPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const packages = await prisma.mockTestPackage.findMany({
    include: {
      tests: {
        include: {
          _count: { select: { questions: true, attempts: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.container}>
      <Link href="/admin/subscriptions" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Subscriptions
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mock Test Packages</h1>
          <p className={styles.subtitle}>Configure readiness tests, categories, difficulty and access tiers.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {packages.map((pkg) => (
          <div key={pkg.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.categoryBadge}>{pkg.category}</span>
              <span className={styles.tierPill} data-tier={pkg.requiredTier || 'FREE'}>
                {pkg.requiredTier ? `${pkg.requiredTier} Only` : 'FREE Preview'}
              </span>
            </div>

            <h3 className={styles.pkgTitle}>{pkg.title}</h3>
            <p className={styles.pkgDesc}>{pkg.description}</p>

            <div className={styles.testList}>
              <span className={styles.testsLabel}>Included Tests:</span>
              {pkg.tests.map((t) => (
                <div key={t.id} className={styles.testItem}>
                  <span>{t.title}</span>
                  <span className={styles.qCount}>
                    {t._count.questions} Qs • {t.durationMinutes} min
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.statusText} data-published={pkg.isPublished}>
                {pkg.isPublished ? '● Published' : '○ Draft'}
              </span>
              <span className={styles.difficultyTag}>{pkg.difficulty}</span>
            </div>
          </div>
        ))}

        {packages.length === 0 && (
          <div className={styles.emptyState}>No test packages configured yet.</div>
        )}
      </div>
    </div>
  );
}
