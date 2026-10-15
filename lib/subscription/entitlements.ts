import { cache } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ─── Feature Keys ─────────────────────────────────────────────────────────────

export type FeatureKey =
  | 'mockTestsPerMonth'
  | 'videoInterviewsPerMonth'
  | 'premiumPackages'
  | 'reviewedVideoFeedback';

// ─── Plan Features Shape ───────────────────────────────────────────────────────

export const planFeaturesSchema = z.object({
  mockTestsPerMonth: z.number().int().min(0),
  videoInterviewsPerMonth: z.number().int().min(0),
  premiumPackages: z.boolean(),
  reviewedVideoFeedback: z.boolean(),
});

export type PlanFeatures = z.infer<typeof planFeaturesSchema>;

// ─── Free Tier Limits ─────────────────────────────────────────────────────────

export const FREE_TIER_LIMITS: PlanFeatures = {
  mockTestsPerMonth: 1,          // 1 free-preview test per month
  videoInterviewsPerMonth: 0,
  premiumPackages: false,
  reviewedVideoFeedback: false,
};

// ─── Entitlement Result ───────────────────────────────────────────────────────

export interface StudentEntitlements {
  tier: 'FREE' | 'PRO' | 'PREMIUM';
  isActive: boolean;
  expiresAt: Date | null;
  daysLeft: number | null;
  features: PlanFeatures;
  subscriptionId: string | null;
}

// ─── getStudentEntitlements ───────────────────────────────────────────────────
// Wrapped in React cache() so it runs at most once per request per userId.

export const getStudentEntitlements = cache(
  async (userId: string): Promise<StudentEntitlements> => {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return {
        tier: 'FREE',
        isActive: false,
        expiresAt: null,
        daysLeft: null,
        features: FREE_TIER_LIMITS,
        subscriptionId: null,
      };
    }

    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId: profile.id,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now },
      },
      select: {
        id: true,
        currentPeriodEnd: true,
        plan: {
          select: {
            tier: true,
            features: true,
          },
        },
      },
      orderBy: { currentPeriodEnd: 'desc' },
    });

    if (!subscription) {
      return {
        tier: 'FREE',
        isActive: false,
        expiresAt: null,
        daysLeft: null,
        features: FREE_TIER_LIMITS,
        subscriptionId: null,
      };
    }

    const parsed = planFeaturesSchema.safeParse(subscription.plan.features);
    const features: PlanFeatures = parsed.success ? parsed.data : FREE_TIER_LIMITS;

    const msLeft = subscription.currentPeriodEnd.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return {
      tier: subscription.plan.tier as 'PRO' | 'PREMIUM',
      isActive: true,
      expiresAt: subscription.currentPeriodEnd,
      daysLeft,
      features,
      subscriptionId: subscription.id,
    };
  },
);
