'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-text-primary)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <Printer size={14} /> Print / Save PDF
    </button>
  );
}

export function TransactionSelector({
  payments,
  currentId,
}: {
  payments: Array<{ id: string; planName: string; amount: number; date: string }>;
  currentId: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
      <span>Transaction:</span>
      <select
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
        value={currentId}
        onChange={(e) => {
          window.location.href = `/student/subscription/receipt?paymentId=${e.target.value}`;
        }}
      >
        {payments.map((p) => (
          <option key={p.id} value={p.id}>
            {p.planName} - ₹{p.amount.toFixed(0)} ({p.date})
          </option>
        ))}
      </select>
    </div>
  );
}
