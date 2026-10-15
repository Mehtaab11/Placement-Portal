import { getStudentEntitlements } from './entitlements';
import type { FeatureKey } from './entitlements';
import type { ReactNode } from 'react';

interface GateProps {
  userId: string;
  feature: FeatureKey;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Server component gate. Renders children only if the student has the feature.
 * Falls back to `fallback` (or null) when not entitled.
 * Server-side only — never use as a security boundary alone (always check on the API too).
 */
export async function Gate({ userId, feature, fallback = null, children }: GateProps): Promise<ReactNode> {
  const ent = await getStudentEntitlements(userId);
  const val = ent.features[feature];

  const hasAccess = typeof val === 'boolean' ? val : typeof val === 'number' ? val > 0 : false;

  return hasAccess ? children : fallback;
}
