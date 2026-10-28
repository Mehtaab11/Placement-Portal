import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Printer, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import styles from './[paymentId]/receipt.module.css';
import { PrintButton, TransactionSelector } from './PrintButton';

export const metadata = {
  title: 'Subscription Receipt — Placement Portal',
};

export default async function ReceiptIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { paymentId } = await searchParams;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true, rollNumber: true, branch: true },
  });
  if (!student) redirect('/student/profile');

  // Fetch all payments for this student
  const allPayments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    include: { plan: true, subscription: true },
  });

  // Pick target payment: either matched by paymentId or latest
  let payment = paymentId
    ? allPayments.find((p) => p.id === paymentId)
    : allPayments[0];

  const isDemo = process.env.PAYMENT_PROVIDER === 'mock' || !process.env.PAYMENT_PROVIDER;

  // If no payment exists yet
  if (!payment) {
    return (
      <div className={styles.container}>
        <div className={styles.noPrint}>
          <Link href="/student/subscription" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Subscriptions
          </Link>
        </div>

        <div className={styles.receiptCard} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', marginBottom: '1rem' }}>
            <FileText size={36} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            No Payment Receipts Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            You haven't made any subscription payments yet. You are currently on the complimentary <strong>Free Tier</strong> with standard mock tests access.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              href="/student/subscription"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore Plans <ArrowRight size={14} />
            </Link>
            <Link
              href="/student/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.625rem 1.25rem',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.noPrint} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/student/subscription" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Subscriptions
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {allPayments.length > 1 && (
            <TransactionSelector
              currentId={payment.id}
              payments={allPayments.map((p) => ({
                id: p.id,
                planName: p.plan.name,
                amount: p.amountPaise / 100,
                date: formatDate(p.createdAt),
              }))}
            />
          )}
          <PrintButton />
        </div>
      </div>

      <div className={styles.receiptCard}>
        {isDemo && (
          <div className={styles.demoWatermark}>
            DEMO MODE — NO REAL MONEY CHARGED • OFFICIAL SIMULATED INVOICE
          </div>
        )}

        <div className={styles.receiptHeader}>
          <div>
            <div className={styles.logoRow}>
              <ShieldCheck size={28} className={styles.brandIcon} />
              <span className={styles.brandName}>Placement Portal</span>
            </div>
            <p className={styles.headerSubtitle}>Training & Placement Cell • Student Invoice</p>
          </div>
          <div className={styles.receiptMeta}>
            <div className={styles.receiptNumber}>
              Receipt #{payment.receiptNumber || payment.id.slice(0, 10).toUpperCase()}
            </div>
            <div className={styles.receiptDate}>
              Date: {formatDate(payment.createdAt)}
            </div>
            <div className={styles.statusPill} data-status={payment.status}>
              <CheckCircle2 size={14} /> {payment.status}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.detailsGrid}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Billed To:</h4>
            <p className={styles.studentName}>{student.fullName}</p>
            <p className={styles.studentDetail}>Roll No: {student.rollNumber || 'N/A'}</p>
            <p className={styles.studentDetail}>Branch: {student.branch}</p>
            <p className={styles.studentDetail}>Email: {session.user.email}</p>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Payment Info:</h4>
            <p className={styles.detailItem}><span>Provider:</span> <strong>{payment.provider} (Simulated)</strong></p>
            <p className={styles.detailItem}><span>Order ID:</span> <code>{payment.providerOrderId}</code></p>
            {payment.providerPaymentId && (
              <p className={styles.detailItem}><span>Payment Ref:</span> <code>{payment.providerPaymentId}</code></p>
            )}
            <p className={styles.detailItem}><span>Currency:</span> {payment.currency}</p>
            {payment.failureReason && (
              <p className={styles.detailItem} style={{ color: 'var(--color-danger)' }}>
                <span>Note:</span> {payment.failureReason}
              </p>
            )}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Duration</th>
                <th>Tier</th>
                <th className={styles.textRight}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{payment.plan.name} Subscription</strong>
                  <div className={styles.subtext}>{payment.plan.description}</div>
                </td>
                <td>{payment.plan.durationDays} Days</td>
                <td><span className={styles.tierBadge} data-tier={payment.plan.tier}>{payment.plan.tier}</span></td>
                <td className={styles.textRight}>₹{(payment.amountPaise / 100).toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.summaryLabel}>Subtotal</td>
                <td className={styles.textRight}>₹{(payment.amountPaise / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className={styles.summaryLabel}>GST (18% Included)</td>
                <td className={styles.textRight}>₹{((payment.amountPaise / 100) * 0.18 / 1.18).toFixed(2)}</td>
              </tr>
              <tr className={styles.totalRow}>
                <td colSpan={3} className={styles.totalLabel}>Total Paid</td>
                <td className={styles.totalAmount}>₹{(payment.amountPaise / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={styles.receiptFooter}>
          <p>This is a computer-generated simulated receipt for demo/mock placement readiness perks.</p>
          {payment.subscription && (
            <p className={styles.validityNotice}>
              Access Active Period: {formatDate(payment.subscription.currentPeriodStart)} — {formatDate(payment.subscription.currentPeriodEnd)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
