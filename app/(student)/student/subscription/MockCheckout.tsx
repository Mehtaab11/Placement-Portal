'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';
import styles from './MockCheckout.module.css';

type CheckoutState = 'idle' | 'processing' | 'success' | 'failure';
type PaymentTab = 'upi' | 'card' | 'netbanking';
type SimulatedOutcome = 'SUCCESS' | 'FAILURE' | 'CANCELLED';

interface OrderInfo {
  orderId: string;
  amountPaise: number;
  currency: string;
  planSummary: { name: string; tier: string; durationDays: number; description: string };
}

export default function MockCheckout() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [tab, setTab] = useState<PaymentTab>('upi');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('PLACEMENT STUDENT');
  const [outcome, setOutcome] = useState<SimulatedOutcome>('SUCCESS');
  const [state, setState] = useState<CheckoutState>('idle');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const liveId = useId();

  // Listen for clicks on upgrade buttons
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-plan-id]') as HTMLElement | null;
      if (btn) {
        const id = btn.dataset.planId;
        if (id) {
          setPlanId(id);
          setOpen(true);
        }
      }
    }

    function handleCustomEvent(e: Event) {
      const customEvent = e as CustomEvent<{ planId: string }>;
      if (customEvent.detail?.planId) {
        setPlanId(customEvent.detail.planId);
        setOpen(true);
      }
    }

    document.addEventListener('click', handleClick);
    window.addEventListener('open-checkout', handleCustomEvent);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('open-checkout', handleCustomEvent);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (state === 'processing') return;
    setOpen(false);
    setPlanId(null);
    setState('idle');
    setOrder(null);
    setError(null);
    setReceipt(null);
    setReceiptPaymentId(null);
  }, [state]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'processing') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, state, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Create order when modal opens with a planId
  useEffect(() => {
    if (open && planId && !order && state === 'idle') {
      void createOrder(planId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, planId]);

  async function createOrder(id: string) {
    setState('processing');
    try {
      const res = await fetch('/api/student/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        amountPaise?: number;
        currency?: string;
        planSummary?: OrderInfo['planSummary'];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize checkout');
      if (!data.orderId || !data.planSummary) throw new Error('Invalid order response');
      setOrder({
        orderId: data.orderId,
        amountPaise: data.amountPaise!,
        currency: data.currency!,
        planSummary: data.planSummary,
      });
      setState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('failure');
    }
  }

  async function handlePay() {
    if (!order || state === 'processing') return;
    setState('processing');
    setError(null);

    try {
      const res = await fetch('/api/student/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, simulatedOutcome: outcome }),
      });
      const data = (await res.json()) as {
        status?: string;
        paymentId?: string;
        receiptNumber?: string;
        failureReason?: string;
        error?: string;
      };

      if (data.status === 'PAID') {
        setReceipt(data.receiptNumber ?? null);
        setReceiptPaymentId(data.paymentId ?? null);
        setState('success');
        router.refresh();
      } else {
        setError(data.failureReason ?? data.error ?? 'Payment was not completed');
        setState('failure');
      }
    } catch {
      setError('Network error during gateway handshake. Please try again.');
      setState('failure');
    }
  }

  function formatPaise(paise: number) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && state !== 'processing') {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="checkout-title"
        aria-modal="true"
      >
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.dialogHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIconBadge}>
                <Sparkles size={16} />
              </div>
              <div>
                <h2 id="checkout-title" className={styles.dialogTitle}>
                  {state === 'success'
                    ? 'Payment Confirmed'
                    : state === 'failure' && !order
                    ? 'Checkout Error'
                    : 'Upgrade Subscription'}
                </h2>
              </div>
              <span className={styles.headerPill}>
                <span className={styles.statusDot} />
                Sandbox
              </span>
            </div>

            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close checkout"
              disabled={state === 'processing'}
            >
              <X size={15} />
            </button>
          </div>

          {/* Live screen reader announcement */}
          <div id={liveId} aria-live="polite" className="sr-only">
            {state === 'processing' ? 'Processing simulated transaction…' : ''}
            {state === 'success' ? 'Payment approved and subscription activated!' : ''}
            {state === 'failure' ? `Payment failed: ${error}` : ''}
          </div>

          {/* Processing State */}
          {state === 'processing' && (
            <div className={styles.processingOverlay}>
              <div className={styles.spinnerRing}>
                <Loader2 size={36} className={styles.spinner} />
              </div>
              <p className={styles.processingText}>Securing Transaction</p>
              <p className={styles.processingSub}>Simulating bank authentication handshake…</p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className={styles.successState}>
              <div className={styles.successIconWrap}>
                <CheckCircle2 size={36} />
              </div>
              <h3 className={styles.successTitle}>Subscription Active!</h3>
              <p className={styles.successSubtitle}>
                Your account has been upgraded. All premium mock tests and video interviews are unlocked.
              </p>

              {receipt && (
                <div className={styles.receiptCard}>
                  <div>
                    <div className={styles.receiptLabel}>Transaction Receipt</div>
                    <div className={styles.receiptCode}>{receipt}</div>
                  </div>
                  <a
                    href={`/student/subscription/receipt${receiptPaymentId ? `?paymentId=${receiptPaymentId}` : ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.receiptLink}
                  >
                    View Invoice
                  </a>
                </div>
              )}

              <div className={styles.successActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    handleClose();
                    router.push('/student/dashboard');
                  }}
                >
                  Go to Dashboard
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    handleClose();
                    router.push('/student/mock-tests');
                  }}
                >
                  Start Mock Test
                </button>
              </div>
            </div>
          )}

          {/* Failure State */}
          {state === 'failure' && (
            <div className={styles.failureState}>
              <div className={styles.failureIconWrap}>
                <AlertCircle size={36} />
              </div>
              <h3 className={styles.failureTitle}>Transaction Declined</h3>
              <div className={styles.failureReasonBox}>
                {error ?? 'Simulated bank declined authorization.'}
              </div>
              <div className={styles.successActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    setState('idle');
                    setError(null);
                    if (planId) void createOrder(planId);
                  }}
                >
                  Try Again
                </button>
                <button className={styles.secondaryBtn} onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Normal Checkout Content */}
          {state === 'idle' && order && (
            <>
              {/* Minimal Sleek Plan Card */}
              <div className={styles.planCard}>
                <div className={styles.planCardLeft}>
                  <div className={styles.planNameRow}>
                    <span className={styles.planName}>{order.planSummary.name}</span>
                    <span className={styles.durationBadge}>
                      {order.planSummary.durationDays} Days Access
                    </span>
                  </div>
                  <p className={styles.planDescription}>{order.planSummary.description}</p>
                </div>
                <div className={styles.planPriceCol}>
                  <div className={styles.planPrice}>{formatPaise(order.amountPaise)}</div>
                  <span className={styles.taxNote}>Taxes included</span>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className={styles.methodSection}>
                <span className={styles.sectionLabel}>Select Simulated Method</span>
                <div className={styles.segmentedTabs} role="tablist">
                  {(['upi', 'card', 'netbanking'] as PaymentTab[]).map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      className={styles.segmentedTab}
                      data-active={tab === t}
                      onClick={() => setTab(t)}
                    >
                      {t === 'upi' && <Smartphone size={13} />}
                      {t === 'card' && <CreditCard size={13} />}
                      {t === 'netbanking' && <Building2 size={13} />}
                      {t === 'upi' ? 'UPI / VPA' : t === 'card' ? 'Card' : 'NetBanking'}
                    </button>
                  ))}
                </div>

                {/* Method Specific Visual Preview */}
                <div className={styles.methodDetailsCard}>
                  {tab === 'upi' && (
                    <div className={styles.upiBox}>
                      <div className={styles.upiInfo}>
                        <span className={styles.upiHandle}>student.placement@okhdfcbank</span>
                        <span className={styles.upiSub}>Simulated Instant UPI Transfer</span>
                      </div>
                      <span className={styles.upiBadge}>
                        <Check size={11} /> Verified
                      </span>
                    </div>
                  )}

                  {tab === 'card' && (
                    <div className={styles.cardSection}>
                      <div className={styles.cardMockup}>
                        <div className={styles.cardTopRow}>
                          <div className={styles.chipIcon} />
                          <span className={styles.cardBrand}>TEST PLATINUM</span>
                        </div>
                        <div className={styles.cardNumberMask}>
                          {cardNumber || '•••• •••• •••• 4242'}
                        </div>
                        <div className={styles.cardBottomRow}>
                          <span className={styles.cardHolder}>
                            {cardHolder.toUpperCase() || 'PLACEMENT STUDENT'}
                          </span>
                          <span>EXP {cardExpiry || '12/28'}</span>
                        </div>
                      </div>

                      <div className={styles.cardForm}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Card Number:</label>
                          <input
                            type="text"
                            maxLength={19}
                            className={styles.formInput}
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                              setCardNumber(formatted);
                            }}
                          />
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Expiration Date:</label>
                            <input
                              type="text"
                              maxLength={5}
                              className={styles.formInput}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (v.length >= 3) {
                                  v = `${v.slice(0, 2)}/${v.slice(2)}`;
                                }
                                setCardExpiry(v);
                              }}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>CVV / Security Code:</label>
                            <input
                              type="password"
                              maxLength={4}
                              className={styles.formInput}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Cardholder Name:</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Cardholder Name as on card"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'netbanking' && (
                    <div className={styles.netbankingWrap}>
                      <span className={styles.subLabel}>Popular Banks</span>
                      <div className={styles.bankList}>
                        {[
                          'HDFC Bank',
                          'ICICI Bank',
                          'State Bank of India',
                          'Axis Bank',
                          'Kotak Mahindra Bank',
                          'Punjab National Bank',
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            className={styles.bankPill}
                            data-selected={selectedBank === b}
                            onClick={() => setSelectedBank(b)}
                          >
                            {b}
                          </button>
                        ))}
                      </div>

                      <div className={styles.otherBankRow}>
                        <label htmlFor="other-banks-select" className={styles.subLabel}>
                          Or Select Other Bank:
                        </label>
                        <select
                          id="other-banks-select"
                          className={styles.bankSelect}
                          value={[
                            'HDFC Bank',
                            'ICICI Bank',
                            'State Bank of India',
                            'Axis Bank',
                            'Kotak Mahindra Bank',
                            'Punjab National Bank',
                          ].includes(selectedBank) ? '' : selectedBank}
                          onChange={(e) => {
                            if (e.target.value) setSelectedBank(e.target.value);
                          }}
                        >
                          <option value="">-- Choose from 15+ other banks --</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Union Bank of India">Union Bank of India</option>
                          <option value="IndusInd Bank">IndusInd Bank</option>
                          <option value="Federal Bank">Federal Bank</option>
                          <option value="Yes Bank">Yes Bank</option>
                          <option value="IDBI Bank">IDBI Bank</option>
                          <option value="Bank of India">Bank of India</option>
                          <option value="Indian Bank">Indian Bank</option>
                          <option value="Central Bank of India">Central Bank of India</option>
                          <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                          <option value="UCO Bank">UCO Bank</option>
                          <option value="RBL Bank">RBL Bank</option>
                          <option value="Karnataka Bank">Karnataka Bank</option>
                        </select>
                      </div>

                      {selectedBank && (
                        <div className={styles.selectedBankNotice}>
                          Selected: <strong>{selectedBank}</strong> (Simulated Internet Banking Gateway)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sleek Test Scenario Switcher */}
              <div className={styles.scenarioSection}>
                <span className={styles.sectionLabel}>Sandbox Test Scenario</span>
                <div className={styles.scenarioGrid}>
                  <div
                    className={styles.scenarioCard}
                    data-active={outcome === 'SUCCESS'}
                    data-type="SUCCESS"
                    onClick={() => setOutcome('SUCCESS')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.scenarioIcon}>✓</div>
                    <span className={styles.scenarioTitle}>Success</span>
                    <span className={styles.scenarioDesc}>Approve & unlock</span>
                  </div>

                  <div
                    className={styles.scenarioCard}
                    data-active={outcome === 'FAILURE'}
                    data-type="FAILURE"
                    onClick={() => setOutcome('FAILURE')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.scenarioIcon}>✕</div>
                    <span className={styles.scenarioTitle}>Decline</span>
                    <span className={styles.scenarioDesc}>Bank decline error</span>
                  </div>

                  <div
                    className={styles.scenarioCard}
                    data-active={outcome === 'CANCELLED'}
                    data-type="CANCELLED"
                    onClick={() => setOutcome('CANCELLED')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.scenarioIcon}>⊘</div>
                    <span className={styles.scenarioTitle}>Cancel</span>
                    <span className={styles.scenarioDesc}>User abort test</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                className={styles.payBtn}
                onClick={handlePay}
                aria-describedby={liveId}
              >
                <Lock size={15} />
                Confirm & Pay {formatPaise(order.amountPaise)}
                <ArrowRight size={15} />
              </button>

              <div className={styles.securityNote}>
                <ShieldCheck size={13} />
                <span>Simulated Sandbox Environment • No real money charged</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
