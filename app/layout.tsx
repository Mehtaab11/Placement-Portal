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
  authors: [{ name: 'Mehtab Aalam & Amit Thakur' }],
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'TPO Portal — Training & Placement Office',
    description: 'Streamline campus placements with real-time tracking, analytics, and AI-powered insights.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('tpo_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d)){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
