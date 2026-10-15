import { prisma } from '@/lib/prisma';
import { getStudentEntitlements } from './entitlements';
import type { FeatureKey } from './entitlements';

// ─── Typed Error ──────────────────────────────────────────────────────────────

export class EntitlementError extends Error {
  constructor(
    message: string,
    public readonly code: 'UPGRADE_REQUIRED' | 'QUOTA_EXHAUSTED' | 'UNAUTHORIZED',
    public readonly requiredTier?: 'PRO' | 'PREMIUM',
    public readonly httpStatus: 402 | 403 = 402,
  ) {
    super(message);
    this.name = 'EntitlementError';
  }
}

// ─── assertEntitlement ────────────────────────────────────────────────────────
// Throws EntitlementError if the student lacks the feature.
// Call this in route handlers / server actions.

export async function assertEntitlement(
  userId: string,
  featureKey: FeatureKey,
): Promise<void> {
  const ent = await getStudentEntitlements(userId);
  const val = ent.features[featureKey];

  // Boolean features: must be true
  if (typeof val === 'boolean') {
    if (!val) {
      throw new EntitlementError(
        `Feature "${featureKey}" requires a higher plan.`,
        'UPGRADE_REQUIRED',
        'PRO',
        402,
      );
    }
    return;
  }

  // Numeric features: must be > 0
  if (typeof val === 'number' && val <= 0) {
    throw new EntitlementError(
      `Feature "${featureKey}" is not available on your current plan.`,
      'UPGRADE_REQUIRED',
      'PRO',
      402,
    );
  }
}

// ─── consumeQuota ─────────────────────────────────────────────────────────────
// Atomically checks + increments a monthly usage counter.
// Returns the new count, or throws EntitlementError if the limit is reached.

export async function consumeQuota(
  studentId: string,
  featureKey: FeatureKey,
  userId: string,
): Promise<number> {
  const ent = await getStudentEntitlements(userId);
  const limit = ent.features[featureKey];

  if (typeof limit !== 'number') {
    // Boolean feature — quota doesn't apply
    return 0;
  }

  if (limit <= 0) {
    throw new EntitlementError(
      `Monthly quota for "${featureKey}" is 0 on your plan. Please upgrade.`,
      'QUOTA_EXHAUSTED',
      'PRO',
      402,
    );
  }

  const now = new Date();
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Transactional read-check-increment
  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.usageCounter.upsert({
      where: {
        studentId_featureKey_periodKey: {
          studentId,
          featureKey,
          periodKey,
        },
      },
      update: {},
      create: {
        studentId,
        featureKey,
        periodKey,
        count: 0,
      },
    });

    if (counter.count >= limit) {
      throw new EntitlementError(
        `Monthly quota for "${featureKey}" exhausted (${limit} used). Upgrade for more.`,
        'QUOTA_EXHAUSTED',
        'PRO',
        402,
      );
    }

    const updated = await tx.usageCounter.update({
      where: {
        studentId_featureKey_periodKey: {
          studentId,
          featureKey,
          periodKey,
        },
      },
      data: { count: { increment: 1 } },
      select: { count: true },
    });

    return updated.count;
  });

  return result;
}

// ─── getCurrentPeriodUsage ────────────────────────────────────────────────────

export async function getCurrentPeriodUsage(
  studentId: string,
  featureKey: FeatureKey,
): Promise<{ used: number; limit: number | boolean }> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!profile) return { used: 0, limit: 0 };

  const ent = await getStudentEntitlements(profile.userId);
  const limit = ent.features[featureKey as keyof typeof ent.features];

  if (typeof limit === 'boolean') return { used: 0, limit };

  const now = new Date();
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const counter = await prisma.usageCounter.findUnique({
    where: {
      studentId_featureKey_periodKey: { studentId, featureKey, periodKey },
    },
    select: { count: true },
  });

  return { used: counter?.count ?? 0, limit };
}
