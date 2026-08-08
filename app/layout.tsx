import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    default: 'TPO Portal — Training & Placement Office',
    template: '%s | TPO Portal',
  },
  description:
    'A unified command center for campus placements — connecting students, recruiters, and TPO administrators.',
  keywords: ['placement', 'campus recruitment', 'TPO', 'job portal', 'internship'],
  authors: [{ name: 'TPO Portal' }],
  openGraph: {
    title: 'TPO Portal — Training & Placement Office',
    description: 'Streamline campus placements with real-time tracking, analytics, and AI-powered insights.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
