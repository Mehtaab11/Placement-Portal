'use client';

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
  const [outcome, setOutcome] = useState<SimulatedOutcome>('SUCCESS');
  const [state, setState] = useState<CheckoutState>('idle');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const liveId = useId();

  // Listen for upgrade button clicks anywhere on the page
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
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      // Fetch order on open
      if (planId && state === 'idle' && !order) {
        void createOrder(planId);
      }
    } else {
      dialog.close();
      // Reset on close
      setState('idle');
      setOrder(null);
      setError(null);
      setReceipt(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Disable Esc while processing
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (state !== 'processing') handleClose();
      }
    };
    dialog.addEventListener('keydown', handler);
    return () => dialog.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleClose = useCallback(() => {
    if (state === 'processing') return;
    setOpen(false);
    setPlanId(null);
  }, [state]);

  async function createOrder(id: string) {
    setState('processing');
    try {
      const res = await fetch('/api/student/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      });
      const data = await res.json() as { orderId?: string; amountPaise?: number; currency?: string; planSummary?: OrderInfo['planSummary']; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to create order');
      if (!data.orderId || !data.planSummary) throw new Error('Invalid order response');
      setOrder({ orderId: data.orderId, amountPaise: data.amountPaise!, currency: data.currency!, planSummary: data.planSummary });
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
      const data = await res.json() as { status?: string; receiptNumber?: string; failureReason?: string; error?: string };

      if (data.status === 'PAID') {
        setReceipt(data.receiptNumber ?? null);
        setState('success');
        router.refresh();
      } else {
        setError(data.failureReason ?? data.error ?? 'Payment failed');
        setState('failure');
      }
    } catch {
      setError('Network error. Please try again.');
      setState('failure');
    }
  }

  function formatPaise(paise: number) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="checkout-title"
      aria-modal="true"
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.dialogHeader}>
          <h2 id="checkout-title" className={styles.dialogTitle}>
            {state === 'success' ? 'Payment Successful' : state === 'failure' && !order ? 'Error' : 'Complete Your Upgrade'}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close checkout"
            disabled={state === 'processing'}
          >
            <X size={18} />
          </button>
        </div>

        {/* DEMO MODE banner */}
        <div className={styles.demoBanner} role="note">
          DEMO MODE — No real money is charged. Payments are fully simulated.
        </div>

        {/* Live status region */}
        <div id={liveId} aria-live="polite" className="sr-only">
          {state === 'processing' ? 'Processing payment…' : ''}
          {state === 'success' ? 'Payment successful!' : ''}
          {state === 'failure' ? `Payment failed: ${error}` : ''}
        </div>

        {/* Processing overlay */}
        {state === 'processing' && (
          <div className={styles.processingOverlay}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Processing payment…</p>
          </div>
        )}

        {/* Success state */}
        {state === 'success' && (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} />
            </div>
            <h3 className={styles.successTitle}>Payment Confirmed!</h3>
            {receipt && (
              <p className={styles.receiptNote}>
                Receipt: <strong>{receipt}</strong>
                {' — '}
                <a href={`/student/subscription/receipt`} className={styles.receiptLink}>View receipt</a>
              </p>
            )}
            <div className={styles.successActions}>
              <button className={styles.primaryBtn} onClick={() => { handleClose(); router.push('/student/dashboard'); }}>
                Go to Dashboard
              </button>
              <button className={styles.secondaryBtn} onClick={() => { handleClose(); router.push('/student/mock-tests'); }}>
                Start a Mock Test
              </button>
            </div>
          </div>
        )}

        {/* Failure state */}
        {state === 'failure' && (
          <div className={styles.failureState}>
            <div className={styles.failureIcon}><AlertCircle size={48} /></div>
            <h3 className={styles.failureTitle}>Payment Failed</h3>
            <p className={styles.failureReason}>{error}</p>
            <div className={styles.successActions}>
              <button className={styles.primaryBtn} onClick={() => {
                setState('idle');
                setError(null);
                if (planId) void createOrder(planId);
              }}>
                Try Again
              </button>
              <button className={styles.secondaryBtn} onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )}

        {/* Idle / processing normal checkout */}
        {(state === 'idle' || state === 'processing') && order && (
          <>
            {/* Order summary */}
            <div className={styles.orderSummary}>
              <div className={styles.orderRow}>
                <span>{order.planSummary.name} ({order.planSummary.durationDays}d)</span>
                <span>{formatPaise(order.amountPaise)}</span>
              </div>
              <div className={styles.orderRow}>
                <span className={styles.gstNote}>GST included (0% for demo)</span>
                <span>₹0</span>
              </div>
              <div className={styles.orderTotal}>
                <span>Total</span>
                <strong>{formatPaise(order.amountPaise)}</strong>
              </div>
            </div>

            {/* Payment method tabs — visual only */}
            <div className={styles.tabs} role="tablist">
              {(['upi', 'card', 'netbanking'] as PaymentTab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={styles.tab}
                  data-active={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t === 'upi' && <Smartphone size={14} />}
                  {t === 'card' && <CreditCard size={14} />}
                  {t === 'netbanking' && <Building2 size={14} />}
                  {t === 'upi' ? 'UPI' : t === 'card' ? 'Card' : 'Net Banking'}
                </button>
              ))}
            </div>

            {/* Visual-only tab content — NO real data collected */}
            <div className={styles.tabContent} role="tabpanel">
              {tab === 'upi' && (
                <div className={styles.demoField}>
                  <label className={styles.demoFieldLabel}>UPI ID</label>
                  <input
                    type="text"
                    readOnly
                    value="demo@upi"
                    className={styles.demoInput}
                    aria-label="Demo UPI ID (read-only)"
                  />
                  <p className={styles.demoHint}>Demo UPI — no real transaction</p>
                </div>
              )}
              {tab === 'card' && (
                <div className={styles.demoField}>
                  <label className={styles.demoFieldLabel}>Card Number</label>
                  <input
                    type="text"
                    readOnly
                    value="4111 1111 1111 1111 (demo)"
                    className={styles.demoInput}
                    aria-label="Demo card number (read-only)"
                  />
                  <p className={styles.demoHint}>No real card data is collected or stored.</p>
                </div>
              )}
              {tab === 'netbanking' && (
                <div className={styles.demoField}>
                  <label className={styles.demoFieldLabel}>Bank</label>
                  <input
                    type="text"
                    readOnly
                    value="Demo National Bank"
                    className={styles.demoInput}
                    aria-label="Demo bank (read-only)"
                  />
                  <p className={styles.demoHint}>Simulated net banking — no real transfer.</p>
                </div>
              )}
            </div>

            {/* Simulation outcome selector */}
            <fieldset className={styles.outcomeSelector}>
              <legend className={styles.outcomeLegend}>Test Scenario</legend>
              {(['SUCCESS', 'FAILURE', 'CANCELLED'] as SimulatedOutcome[]).map((o) => (
                <label key={o} className={styles.outcomeOption}>
                  <input
                    type="radio"
                    name="outcome"
                    value={o}
                    checked={outcome === o}
                    onChange={() => setOutcome(o)}
                  />
                  <span>
                    {o === 'SUCCESS' ? 'Simulate successful payment' : o === 'FAILURE' ? 'Simulate payment failure' : 'Cancel payment'}
                  </span>
                </label>
              ))}
            </fieldset>

            <button
              className={styles.payBtn}
              onClick={handlePay}
              disabled={state === 'processing'}
              aria-describedby={liveId}
            >
              Pay {formatPaise(order.amountPaise)}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
