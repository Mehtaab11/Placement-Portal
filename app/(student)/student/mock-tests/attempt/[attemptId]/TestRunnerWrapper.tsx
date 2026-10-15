'use client';

import dynamic from 'next/dynamic';

export const DynamicTestRunner = dynamic(() => import('./TestRunner'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: '60vh', borderRadius: 'var(--radius-xl)' }} />
    </div>
  ),
});
