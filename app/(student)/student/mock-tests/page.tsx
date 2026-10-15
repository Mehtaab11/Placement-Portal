import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getStudentEntitlements } from '@/lib/subscription/entitlements';
import Link from 'next/link';
import { Lock, BookOpen, Star, Filter } from 'lucide-react';
import styles from './mockTests.module.css';

export const metadata = { title: 'Mock Tests — TPO Portal' };

export default async function MockTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string; page?: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const params = await searchParams;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const entitlements = await getStudentEntitlements(session.user.id);
  const page = Math.max(1, parseInt(params.page ?? '1'));
  const take = 9;
  const skip = (page - 1) * take;

  const where = {
    isPublished: true,
    ...(params.category ? { category: params.category as never } : {}),
    ...(params.difficulty ? { difficulty: params.difficulty as never } : {}),
  };

  const [packages, total] = await prisma.$transaction([
    prisma.mockTestPackage.findMany({
      where,
      orderBy: [{ requiredTier: 'asc' }, { sortOrder: 'asc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        difficulty: true,
        requiredTier: true,
        coverImage: true,
        _count: { select: { tests: { where: { isPublished: true } } } },
      },
    }),
    prisma.mockTestPackage.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);
  const categories = ['APTITUDE', 'TECHNICAL', 'VERBAL', 'CODING_MCQ', 'COMPANY_SPECIFIC'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mock Test Packages</h1>
        <p className={styles.subtitle}>
          Practice aptitude, technical, and company-specific tests to sharpen your skills.
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Filter size={14} className={styles.filterIcon} />
        <div className={styles.filterGroup}>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/student/mock-tests?category=${cat}&page=1`}
              className={styles.filterChip}
              data-active={params.category === cat}
            >
              {cat.replace('_', ' ')}
            </Link>
          ))}
          {params.category && (
            <Link href="/student/mock-tests" className={styles.filterChipClear}>
              Clear
            </Link>
          )}
        </div>
        <div className={styles.filterGroup}>
          {difficulties.map((d) => (
            <Link
              key={d}
              href={`/student/mock-tests?difficulty=${d}&page=1`}
              className={styles.filterChip}
              data-active={params.difficulty === d}
              data-difficulty={d}
            >
              {d}
            </Link>
          ))}
        </div>
      </div>

      {/* Package grid */}
      {packages.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={40} color="var(--color-text-tertiary)" />
          <p>No packages found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {packages.map((pkg) => {
            const isLocked =
              pkg.requiredTier !== null &&
              !(
                (pkg.requiredTier === 'PRO' && (entitlements.tier === 'PRO' || entitlements.tier === 'PREMIUM') && entitlements.isActive) ||
                (pkg.requiredTier === 'PREMIUM' && entitlements.tier === 'PREMIUM' && entitlements.isActive)
              );

            return (
              <div key={pkg.id} className={styles.card} data-locked={isLocked}>
                <div className={styles.cardTop}>
                  <div className={styles.categoryBadge} data-category={pkg.category}>
                    {pkg.category.replace('_', ' ')}
                  </div>
                  <div className={styles.difficultyBadge} data-difficulty={pkg.difficulty}>
                    {pkg.difficulty}
                  </div>
                </div>

                <h3 className={styles.cardTitle}>{pkg.title}</h3>
                <p className={styles.cardDesc}>{pkg.description}</p>

                <div className={styles.cardMeta}>
                  <span className={styles.testCount}>
                    <BookOpen size={13} />
                    {pkg._count.tests} test{pkg._count.tests !== 1 ? 's' : ''}
                  </span>
                  {pkg.requiredTier && (
                    <span className={styles.tierRequired} data-tier={pkg.requiredTier}>
                      <Star size={11} />
                      {pkg.requiredTier}
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <div className={styles.lockedOverlay}>
                    <Lock size={20} />
                    <span>Requires {pkg.requiredTier} plan</span>
                    <Link href="/student/subscription" className={styles.upgradeLink}>
                      Upgrade
                    </Link>
                  </div>
                ) : (
                  <Link href={`/student/mock-tests/${pkg.id}`} className={styles.startBtn}>
                    View Tests
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && (
            <Link href={`/student/mock-tests?page=${page - 1}`} className={styles.pageBtn}>
              ← Prev
            </Link>
          )}
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/student/mock-tests?page=${page + 1}`} className={styles.pageBtn}>
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
