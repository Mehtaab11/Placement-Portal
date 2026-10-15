import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Users, Crown, CreditCard, TrendingUp } from 'lucide-react';
import styles from './adminSubscriptions.module.css';

export const metadata = { title: 'Subscriptions — Admin' };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tier?: string; status?: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const params = await searchParams;
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const page = Math.max(1, parseInt(params.page ?? '1'));
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    ...(params.tier ? { plan: { tier: params.tier as 'PRO' | 'PREMIUM' } } : {}),
    ...(params.status ? { status: params.status as 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING' } : {}),
  };

  // Aggregate stats
  const now = new Date();
  const [totalActive, totalPro, totalPremium, totalRevenuePaise] = await Promise.all([
    prisma.subscription.count({ where: { status: 'ACTIVE', currentPeriodEnd: { gt: now } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', currentPeriodEnd: { gt: now }, plan: { tier: 'PRO' } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', currentPeriodEnd: { gt: now }, plan: { tier: 'PREMIUM' } } }),
    prisma.payment.aggregate({ _sum: { amountPaise: true }, where: { status: 'PAID' } }),
  ]);

  const [subscriptions, total] = await prisma.$transaction([
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        status: true,
        currentPeriodEnd: true,
        canceledAt: true,
        source: true,
        createdAt: true,
        student: {
          select: {
            fullName: true,
            branch: true,
            user: { select: { email: true } },
          },
        },
        plan: { select: { name: true, tier: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);
  const totalRevenue = (totalRevenuePaise._sum.amountPaise ?? 0) / 100;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Subscription Management</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={20} /></div>
          <div>
            <div className={styles.statNum}>{totalActive}</div>
            <div className={styles.statLbl}>Active Subscribers</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Crown size={20} /></div>
          <div>
            <div className={styles.statNum}>{totalPro}</div>
            <div className={styles.statLbl}>PRO</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Crown size={20} color="#7C3AED" /></div>
          <div>
            <div className={styles.statNum}>{totalPremium}</div>
            <div className={styles.statLbl}>PREMIUM</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp size={20} color="var(--color-success)" /></div>
          <div>
            <div className={styles.statNum}>₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className={styles.statLbl}>Total Revenue (mock)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Link href="/admin/subscriptions" className={styles.filterChip} data-active={!params.tier && !params.status}>All</Link>
        {['PRO', 'PREMIUM'].map(t => (
          <Link key={t} href={`/admin/subscriptions?tier=${t}`} className={styles.filterChip} data-active={params.tier === t}>{t}</Link>
        ))}
        {['ACTIVE', 'EXPIRED', 'CANCELED'].map(s => (
          <Link key={s} href={`/admin/subscriptions?status=${s}`} className={styles.filterChip} data-active={params.status === s}>{s}</Link>
        ))}
      </div>

      {/* Grant access link */}
      <div className={styles.actions}>
        <Link href="/admin/subscriptions/grant" className={styles.grantBtn}>
          <Crown size={14} /> Grant Subscription
        </Link>
        <Link href="/admin/subscriptions/packages" className={styles.secondaryBtn}>
          <CreditCard size={14} /> Manage Packages
        </Link>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <span>Student</span>
          <span>Plan</span>
          <span>Status</span>
          <span>Expires</span>
          <span>Source</span>
          <span>Created</span>
        </div>
        {subscriptions.map((sub) => {
          const expired = sub.status === 'ACTIVE' && sub.currentPeriodEnd < now;
          return (
            <div key={sub.id} className={styles.tableRow}>
              <div>
                <p className={styles.studentName}>{sub.student.fullName}</p>
                <p className={styles.studentEmail}>{sub.student.user.email}</p>
              </div>
              <span className={styles.planBadge} data-tier={sub.plan.tier}>{sub.plan.name}</span>
              <span className={styles.statusBadge} data-status={expired ? 'EXPIRED' : sub.status}>
                {expired ? 'EXPIRED' : sub.status}
              </span>
              <span className={styles.dateCell}>{formatDate(sub.currentPeriodEnd)}</span>
              <span className={styles.sourceCell}>{sub.source}</span>
              <span className={styles.dateCell}>{formatDate(sub.createdAt)}</span>
            </div>
          );
        })}
        {subscriptions.length === 0 && (
          <div className={styles.emptyRow}>No subscriptions found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && (
            <Link href={`/admin/subscriptions?page=${page - 1}`} className={styles.pageBtn}>← Prev</Link>
          )}
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/subscriptions?page=${page + 1}`} className={styles.pageBtn}>Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
