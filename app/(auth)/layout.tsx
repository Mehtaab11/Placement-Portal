import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './auth.module.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign in to TPO Portal',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      {/* Left brand panel */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <Link href="/" className={styles.logoLink} title="Return to Dashboard">
            <div className={styles.logo}>
              <Image
                src="/logo-dark.png"
                alt="TPO Logo"
                width={40}
                height={40}
                className={styles.logoImg}
                priority
              />
              <div>
                <p className={styles.logoTitle}>TPO Portal</p>
                <p className={styles.logoSub}>Management System</p>
              </div>
            </div>
          </Link>
          <div className={styles.brandContent}>
            <h1 className={styles.brandHeadline}>
              The Future of<br />Campus Placements.
            </h1>
            <p className={styles.brandDesc}>
              Connect college students, recruiting companies, and placement officers in one easy place to organize campus hiring, track applications, and secure job offers.
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>4,200+</span>
              <span className={styles.statLabel}>Students Placed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>156</span>
              <span className={styles.statLabel}>Companies</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>68%</span>
              <span className={styles.statLabel}>Placement Rate</span>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className={styles.bgDecor1} aria-hidden="true" />
        <div className={styles.bgDecor2} aria-hidden="true" />
      </div>

      {/* Right form panel */}
      <div className={styles.form}>
        <div className={styles.formInner}>
          {children}
        </div>
      </div>
    </div>
  );
}
