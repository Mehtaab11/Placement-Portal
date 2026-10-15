import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import styles from './receipt.module.css';

export const metadata = {
  title: 'Payment Receipt — Placement Portal',
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { paymentId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true, rollNumber: true, branch: true },
  });
  if (!student) redirect('/student/profile');

  // Enforce ownership: student can only read their own receipt
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: true,
      subscription: true,
    },
  });

  if (!payment || payment.studentId !== student.id) {
    notFound();
  }

  const isDemo = process.env.PAYMENT_PROVIDER === 'mock' || !process.env.PAYMENT_PROVIDER;

  return (
    <div className={styles.container}>
      <div className={styles.noPrint}>
        <Link href="/student/subscription" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Subscriptions
        </Link>
      </div>

      <div className={styles.receiptCard}>
        {isDemo && (
          <div className={styles.demoWatermark}>
            DEMO MODE — NO REAL MONEY CHARGED
          </div>
        )}

        <div className={styles.receiptHeader}>
          <div>
            <div className={styles.logoRow}>
              <ShieldCheck size={28} className={styles.brandIcon} />
              <span className={styles.brandName}>Placement Portal</span>
            </div>
            <p className={styles.headerSubtitle}>Training & Placement Cell</p>
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
              Valid until: {formatDate(payment.subscription.currentPeriodEnd)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
