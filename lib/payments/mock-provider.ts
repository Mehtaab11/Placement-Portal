import type {
  PaymentProvider,
  CreateOrderInput,
  CreateOrderResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  SimulatedOutcome,
} from './types';

function randomDelay(): Promise<void> {
  const ms = 800 + Math.floor(Math.random() * 400); // 800–1200ms
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    await randomDelay();

    const providerOrderId = `mock_order_${crypto.randomUUID()}`;

    return {
      providerOrderId,
      amountPaise: input.amountPaise,
      currency: input.currency,
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    await randomDelay();

    const outcome: SimulatedOutcome = input.simulatedOutcome ?? 'SUCCESS';

    if (outcome === 'SUCCESS') {
      return {
        status: 'PAID',
        providerPaymentId: `mock_pay_${crypto.randomUUID()}`,
      };
    }

    if (outcome === 'CANCELLED') {
      return {
        status: 'FAILED',
        providerPaymentId: `mock_pay_${crypto.randomUUID()}`,
        failureReason: 'Payment cancelled by user.',
      };
    }

    // FAILURE
    return {
      status: 'FAILED',
      providerPaymentId: `mock_pay_${crypto.randomUUID()}`,
      failureReason: 'Payment failed: Simulated decline by bank.',
    };
  }
}
