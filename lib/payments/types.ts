// ─── Payment Provider Abstraction ─────────────────────────────────────────────
//
// HOW TO ADD A REAL GATEWAY (e.g. Razorpay):
// 1. Create `lib/payments/razorpay-provider.ts` that implements PaymentProvider.
// 2. In `lib/payments/index.ts`, add a case for PAYMENT_PROVIDER=razorpay.
// 3. No schema, no UI changes needed — only this one new file + one case in index.ts.
//
// The abstraction ensures the checkout UI, API routes and DB models are
// provider-agnostic. Real amounts always come from the DB Plan row.
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  planId: string;
  amountPaise: number;
  currency: string;
  studentId: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
}

export type SimulatedOutcome = 'SUCCESS' | 'FAILURE' | 'CANCELLED';

export interface ConfirmPaymentInput {
  providerOrderId: string;
  simulatedOutcome?: SimulatedOutcome; // accepted only by MOCK provider
}

export interface ConfirmPaymentResult {
  status: 'PAID' | 'FAILED';
  providerPaymentId: string;
  failureReason?: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
}
