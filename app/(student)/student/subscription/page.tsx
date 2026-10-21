import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { getStudentEntitlements } from '@/lib/subscription/entitlements';
import { getCurrentPeriodUsage } from '@/lib/subscription/guards';
import { formatDate } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Crown, Zap, Star, Lock, CheckCircle2, Clock, Receipt } from 'lucide-react';
import styles from './subscription.module.css';
import type { PlanFeatures } from '@/lib/subscription/entitlements';

import { MockCheckoutModal } from './CheckoutWrapper';

if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') {
  // Will be checked inside the page component instead, to allow the notFound() call
}

async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      tier: true,
      name: true,
      slug: true,
      description: true,
      durationDays: true,
      pricePaise: true,
      features: true,
      sortOrder: true,
    },
  });
}

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function TierIcon({ tier }: { tier: string }) {
  if (tier === 'PREMIUM') return <Crown size={18} />;
  if (tier === 'PRO') return <Zap size={18} />;
  return <Star size={18} />;
}

export const metadata = { title: 'Subscription — TPO Portal' };

export default async function SubscriptionPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const entitlements = await getStudentEntitlements(session.user.id);
  const plans = await getActivePlans();

  const now = new Date();
  const activeSubscription = profile
    ? await prisma.subscription.findFirst({
        where: {
          studentId: profile.id,
          status: 'ACTIVE',
          currentPeriodEnd: { gt: now },
        },
        select: {
          id: true,
          currentPeriodEnd: true,
          canceledAt: true,
          plan: { select: { name: true, tier: true } },
        },
        orderBy: { currentPeriodEnd: 'desc' },
      })
    : null;

  const payments = profile
    ? await prisma.payment.findMany({
        where: { studentId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          amountPaise: true,
          receiptNumber: true,
          failureReason: true,
          createdAt: true,
          plan: { select: { name: true } },
        },
      })
    : [];

  const mockUsage = profile
    ? await getCurrentPeriodUsage(profile.id, 'mockTestsPerMonth')
    : { used: 0, limit: 1 };

  const videoUsage = profile
    ? await getCurrentPeriodUsage(profile.id, 'videoInterviewsPerMonth')
    : { used: 0, limit: 0 };

  const isDemoMode = !process.env.PAYMENT_PROVIDER || process.env.PAYMENT_PROVIDER === 'mock';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Subscription Plans</h1>
        <p className={styles.subtitle}>
          Unlock premium practice tools to ace your placement interviews.
        </p>
        {isDemoMode && (
          <div className={styles.demoBanner} role="status">
            DEMO MODE — No real money is charged. Payments are fully simulated.
          </div>
        )}
      </div>

      {/* Current Plan Status */}
      <div className={styles.currentPlanCard}>
        <div className={styles.currentPlanLeft}>
          <div className={styles.tierBadge} data-tier={entitlements.tier}>
            <TierIcon tier={entitlements.tier} />
            {entitlements.tier} Plan
          </div>
          {entitlements.isActive && entitlements.expiresAt && (
            <p className={styles.expiryText}>
              <Clock size={13} />
              Expires {formatDate(entitlements.expiresAt)}
              {entitlements.daysLeft !== null && entitlements.daysLeft <= 7 && (
                <span className={styles.expiryWarning}> — {entitlements.daysLeft}d left</span>
              )}
            </p>
          )}
          {activeSubscription?.canceledAt && (
            <p className={styles.canceledNote}>Cancellation requested — access until period end</p>
          )}
          {!entitlements.isActive && (
            <p className={styles.freeNote}>Core placement features are always free.</p>
          )}
        </div>

        {/* Usage meters */}
        <div className={styles.usageMeters}>
          <UsageMeter label="Mock Tests" used={typeof mockUsage.limit === 'number' ? mockUsage.used : 0} limit={typeof mockUsage.limit === 'number' ? mockUsage.limit : 0} />
          <UsageMeter label="Video Interviews" used={typeof videoUsage.limit === 'number' ? videoUsage.used : 0} limit={typeof videoUsage.limit === 'number' ? videoUsage.limit : 0} />
        </div>
      </div>

      {/* Plan Comparison Grid */}
      <div className={styles.plansGrid}>
        {/* FREE column */}
        <PlanCard
          name="Free"
          tier="FREE"
          price="₹0"
          duration="Forever"
          description="Core placement tools for every student."
          features={{
            mockTestsPerMonth: 1,
            videoInterviewsPerMonth: 0,
            premiumPackages: false,
            reviewedVideoFeedback: false,
          }}
          isCurrentPlan={entitlements.tier === 'FREE'}
          isPopular={false}
          planId={null}
        />

        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            tier={plan.tier}
            price={formatPaise(plan.pricePaise)}
            duration={`${plan.durationDays} days`}
            description={plan.description}
            features={plan.features as PlanFeatures}
            isCurrentPlan={entitlements.tier === plan.tier && entitlements.isActive}
            isPopular={plan.tier === 'PRO'}
            planId={plan.id}
          />
        ))}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <Receipt size={16} />
            <h2 className={styles.sectionTitle}>Payment History</h2>
          </div>
          <div className={styles.historyTable}>
            <div className={styles.tableHead}>
              <span>Plan</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Receipt</span>
              <span>Status</span>
            </div>
            {payments.map((p) => (
              <div key={p.id} className={styles.tableRow}>
                <span>{p.plan.name}</span>
                <span>{formatPaise(p.amountPaise)}</span>
                <span>{formatDate(p.createdAt)}</span>
                <span className={styles.receiptNum}>
                  {p.receiptNumber ? (
                    <a href={`/student/subscription/receipt/${p.id}`} target="_blank" rel="noopener noreferrer">
                      {p.receiptNumber}
                    </a>
                  ) : '—'}
                </span>
                <span className={styles.statusBadge} data-status={p.status}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout modal (lazy-loaded client component) */}
      <MockCheckoutModal />
    </div>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({
  name,
  tier,
  price,
  duration,
  description,
  features,
  isCurrentPlan,
  isPopular,
  planId,
}: {
  name: string;
  tier: string;
  price: string;
  duration: string;
  description: string;
  features: PlanFeatures;
  isCurrentPlan: boolean;
  isPopular: boolean;
  planId: string | null;
}) {
  const featureRows = [
    { label: 'Mock Tests / month', value: typeof features.mockTestsPerMonth === 'number' ? `${features.mockTestsPerMonth}` : '—' },
    { label: 'Video Interviews / month', value: typeof features.videoInterviewsPerMonth === 'number' ? `${features.videoInterviewsPerMonth}` : '—' },
    { label: 'Premium Test Packages', value: features.premiumPackages },
    { label: 'Reviewed Video Feedback', value: features.reviewedVideoFeedback },
  ];

  return (
    <div className={styles.planCard} data-popular={isPopular} data-current={isCurrentPlan}>
      {isPopular && <div className={styles.popularBadge}>Most Popular</div>}
      <div className={styles.planHeader}>
        <div className={styles.planTierBadge} data-tier={tier}>
          <TierIcon tier={tier} />
          {tier}
        </div>
        <h3 className={styles.planName}>{name}</h3>
        <div className={styles.planPrice}>{price}</div>
        <div className={styles.planDuration}>{duration}</div>
        <p className={styles.planDesc}>{description}</p>
      </div>

      <ul className={styles.featureList}>
        {featureRows.map((f) => (
          <li key={f.label} className={styles.featureRow}>
            {typeof f.value === 'boolean' ? (
              <span className={f.value ? styles.featureYes : styles.featureNo}>
                {f.value ? <CheckCircle2 size={14} /> : <Lock size={14} />}
              </span>
            ) : (
              <span className={styles.featureCount}>{f.value}</span>
            )}
            <span className={styles.featureLabel}>{f.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.planAction}>
        {isCurrentPlan ? (
          <div className={styles.currentPlanBtn}>Current Plan</div>
        ) : planId ? (
          // Uses a data attribute — the MockCheckout modal listens for this
          <button
            type="button"
            className={styles.upgradeBtn}
            data-plan-id={planId}
            id={`upgrade-${planId}`}
          >
            Upgrade to {tier}
          </button>
        ) : (
          <div className={styles.freePlanBtn}>Your Current Plan</div>
        )}
      </div>
    </div>
  );
}

// ─── UsageMeter ───────────────────────────────────────────────────────────────

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className={styles.usageMeter}>
      <div className={styles.usageMeterHeader}>
        <span className={styles.usageMeterLabel}>{label}</span>
        <span className={styles.usageMeterCount}>
          {limit === 0 ? 'Locked' : `${used} / ${limit}`}
        </span>
      </div>
      {limit > 0 && (
        <div className={styles.usageMeterBar}>
          <div className={styles.usageMeterFill} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
