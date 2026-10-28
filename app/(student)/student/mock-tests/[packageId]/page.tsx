import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getStudentEntitlements } from '@/lib/subscription/entitlements';
import Link from 'next/link';
import { ArrowLeft, Clock, BarChart3, Play, Lock } from 'lucide-react';
import styles from './packageDetail.module.css';
import { formatDate } from '@/lib/utils';

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { packageId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const pkg = await prisma.mockTestPackage.findUnique({
    where: { id: packageId, isPublished: true },
    include: {
      tests: {
        where: { isPublished: true },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          totalMarks: true,
          negativeMarking: true,
          isFreePreview: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!pkg) notFound();

  const entitlements = await getStudentEntitlements(session.user.id);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  // Get best attempts per test for this student
  const attempts = profile
    ? await prisma.mockAttempt.findMany({
        where: {
          studentId: profile.id,
          testId: { in: pkg.tests.map((t) => t.id) },
          status: 'SUBMITTED',
        },
        select: { testId: true, score: true, submittedAt: true },
        orderBy: { score: 'desc' },
      })
    : [];

  const bestByTest = new Map<string, { score: number; submittedAt: Date | null }>();
  for (const a of attempts) {
    if (!bestByTest.has(a.testId) || (a.score ?? 0) > (bestByTest.get(a.testId)?.score ?? 0)) {
      bestByTest.set(a.testId, { score: a.score ?? 0, submittedAt: a.submittedAt });
    }
  }

  const isPackageLocked =
    pkg.requiredTier !== null &&
    !(
      (pkg.requiredTier === 'PRO' && (entitlements.tier === 'PRO' || entitlements.tier === 'PREMIUM') && entitlements.isActive) ||
      (pkg.requiredTier === 'PREMIUM' && entitlements.tier === 'PREMIUM' && entitlements.isActive)
    );

  return (
    <div className={styles.container}>
      <Link href="/student/mock-tests" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Packages
      </Link>

      <div className={styles.packageHeader}>
        <div className={styles.meta}>
          <span className={styles.categoryBadge}>{pkg.category.replace('_', ' ')}</span>
          <span className={styles.difficultyBadge} data-difficulty={pkg.difficulty}>{pkg.difficulty}</span>
          {pkg.requiredTier && (
            <span className={styles.tierBadge} data-tier={pkg.requiredTier}>{pkg.requiredTier}</span>
          )}
        </div>
        <h1 className={styles.title}>{pkg.title}</h1>
        <p className={styles.description}>{pkg.description}</p>
      </div>

      {isPackageLocked && (
        <div className={styles.lockedBanner}>
          <Lock size={16} />
          This package requires a {pkg.requiredTier} subscription.
          <Link href="/student/subscription" className={styles.upgradeLink}>Upgrade now</Link>
        </div>
      )}

      <div className={styles.testList}>
        {pkg.tests.map((test) => {
          const best = bestByTest.get(test.id);
          const isLocked = isPackageLocked && !test.isFreePreview;

          return (
            <div key={test.id} className={styles.testCard} data-locked={isLocked}>
              <div className={styles.testInfo}>
                <div className={styles.testHeader}>
                  <h3 className={styles.testTitle}>{test.title}</h3>
                  {test.isFreePreview && (
                    <span className={styles.freePreviewBadge}>Free Preview</span>
                  )}
                </div>
                <div className={styles.testMeta}>
                  <span><Clock size={13} />{test.durationMinutes} min</span>
                  <span><BarChart3 size={13} />{test.totalMarks} marks</span>
                  <span>{test._count.questions} questions</span>
                  {test.negativeMarking > 0 && (
                    <span className={styles.negMarking}>-{test.negativeMarking} per wrong</span>
                  )}
                </div>
                {best && (
                  <p className={styles.bestScore}>
                    Best: <strong>{best.score?.toFixed(1)}</strong> marks • {formatDate(best.submittedAt)}
                  </p>
                )}
              </div>

              {isLocked ? (
                <div className={styles.lockIcon}><Lock size={18} /></div>
              ) : (
                <StartTestButton testId={test.id} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StartTestButton({ testId }: { testId: string }) {
  return (
    <Link href={`/student/mock-tests/start?testId=${testId}`} className={styles.startBtn}>
      <Play size={14} /> Start Test
    </Link>
  );
}
