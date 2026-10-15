'use client';

import dynamic from 'next/dynamic';

export const MockCheckoutModal = dynamic(() => import('./MockCheckout'), {
  ssr: false,
});
