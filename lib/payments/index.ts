// ─── Payment Provider Factory ──────────────────────────────────────────────────
//
// To add a real gateway (e.g. Razorpay or Stripe):
// 1. Create the adapter file: lib/payments/razorpay-provider.ts (implements PaymentProvider)
// 2. Add a new case below: case 'razorpay': return new RazorpayPaymentProvider();
// 3. Set PAYMENT_PROVIDER=razorpay in .env.local
//
// No schema, no DB, no UI changes are needed — everything is provider-agnostic.
// ─────────────────────────────────────────────────────────────────────────────

import type { PaymentProvider } from './types';
import { MockPaymentProvider } from './mock-provider';

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  switch (provider) {
    case 'mock':
      return new MockPaymentProvider();
    default:
      throw new Error(
        `Payment provider "${provider}" is not implemented. ` +
          `Add a new case in lib/payments/index.ts and create the adapter file.`,
      );
  }
}

export type { PaymentProvider, CreateOrderInput, CreateOrderResult, ConfirmPaymentInput, ConfirmPaymentResult, SimulatedOutcome } from './types';
