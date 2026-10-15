'use client';

import dynamic from 'next/dynamic';

export const DynamicVideoRecorder = dynamic(() => import('./VideoRecorder'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      <div className="skeleton" style={{ height: '360px', maxWidth: '640px', margin: '0 auto 1.5rem', borderRadius: '16px' }} />
      <p>Initializing camera and recording studio...</p>
    </div>
  ),
});
