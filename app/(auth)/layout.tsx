import type { Metadata } from 'next';
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
          <div className={styles.logo}>
            <span className={styles.logoIcon}>TP</span>
            <div>
              <p className={styles.logoTitle}>TPO Portal</p>
              <p className={styles.logoSub}>Management System</p>
            </div>
          </div>
          <div className={styles.brandContent}>
            <h1 className={styles.brandHeadline}>
              The Future of<br />Campus Placements.
            </h1>
            <p className={styles.brandDesc}>
              A unified command center bridging the gap between ambitious students,
              top-tier recruiters, and institutional administration.
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
