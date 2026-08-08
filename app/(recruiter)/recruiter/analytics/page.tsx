import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BarChart3, Users, CheckCircle, TrendingUp } from 'lucide-react';
import styles from './recruiterAnalytics.module.css';

export default async function RecruiterAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      drives: {
        include: {
          applications: {
            include: { student: true },
          },
        },
      },
    },
  });

  const drives = recruiter?.drives || [];
  const allApps = drives.flatMap((d) => d.applications);
  const totalApplied = allApps.length;
  const totalShortlisted = allApps.filter((a) => a.stage === 'SHORTLISTED').length;
  const totalInterviewed = allApps.filter((a) => a.stage === 'INTERVIEW').length;
  const totalOffered = allApps.filter((a) => a.stage === 'OFFERED').length;

  const conversionRate = totalApplied > 0 ? ((totalOffered / totalApplied) * 100).toFixed(1) : '0';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hiring Funnel & Conversion Analytics</h1>
          <p className={styles.subtitle}>
            Analyze candidate throughput across each stage of your campus recruitment drives.
          </p>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#EEF2FF', color: '#6366F1' }}>
            <Users size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalApplied}</span>
            <span className={styles.statLabel}>Total Applicants</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <BarChart3 size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalShortlisted}</span>
            <span className={styles.statLabel}>Shortlisted Candidates</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalOffered}</span>
            <span className={styles.statLabel}>Offers Released</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FDF4FF', color: '#A855F7' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{conversionRate}%</span>
            <span className={styles.statLabel}>Overall Conversion</span>
          </div>
        </div>
      </div>

      {/* Visual Hiring Funnel Bars */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recruitment Funnel Throughput</h2>
        <div className={styles.funnel}>
          <div className={styles.funnelStage}>
            <div className={styles.funnelHeader}>
              <span>1. Applications Submitted</span>
              <strong>{totalApplied} (100%)</strong>
            </div>
            <div className={styles.funnelBar}>
              <div className={styles.funnelFill} style={{ width: '100%', background: '#6366F1' }} />
            </div>
          </div>

          <div className={styles.funnelStage}>
            <div className={styles.funnelHeader}>
              <span>2. Profile Shortlisted</span>
              <strong>
                {totalShortlisted} ({totalApplied > 0 ? ((totalShortlisted / totalApplied) * 100).toFixed(0) : 0}%)
              </strong>
            </div>
            <div className={styles.funnelBar}>
              <div
                className={styles.funnelFill}
                style={{
                  width: `${totalApplied > 0 ? (totalShortlisted / totalApplied) * 100 : 0}%`,
                  background: '#D97706',
                }}
              />
            </div>
          </div>

          <div className={styles.funnelStage}>
            <div className={styles.funnelHeader}>
              <span>3. Interview Rounds</span>
              <strong>
                {totalInterviewed} ({totalApplied > 0 ? ((totalInterviewed / totalApplied) * 100).toFixed(0) : 0}%)
              </strong>
            </div>
            <div className={styles.funnelBar}>
              <div
                className={styles.funnelFill}
                style={{
                  width: `${totalApplied > 0 ? (totalInterviewed / totalApplied) * 100 : 0}%`,
                  background: '#A855F7',
                }}
              />
            </div>
          </div>

          <div className={styles.funnelStage}>
            <div className={styles.funnelHeader}>
              <span>4. Final Offers</span>
              <strong>
                {totalOffered} ({totalApplied > 0 ? ((totalOffered / totalApplied) * 100).toFixed(0) : 0}%)
              </strong>
            </div>
            <div className={styles.funnelBar}>
              <div
                className={styles.funnelFill}
                style={{
                  width: `${totalApplied > 0 ? (totalOffered / totalApplied) * 100 : 0}%`,
                  background: '#16A34A',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
