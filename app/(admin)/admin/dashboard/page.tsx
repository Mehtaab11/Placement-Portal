import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, Building2, Briefcase, Award, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './adminDashboard.module.css';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const totalStudents = await prisma.studentProfile.count();
  const placedStudents = await prisma.studentProfile.count({ where: { isPlaced: true } });
  const totalCompanies = await prisma.company.count();
  const totalDrives = await prisma.drive.count();

  const drives = await prisma.drive.findMany({
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const placementPct = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0';

  // Branch wise stats
  const branches = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];
  const branchStats = await Promise.all(
    branches.map(async (b) => {
      const total = await prisma.studentProfile.count({ where: { branch: b } });
      const placed = await prisma.studentProfile.count({ where: { branch: b, isPlaced: true } });
      const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
      return { branch: b, total, placed, pct };
    })
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>TPO Placement Overview</h1>
          <p className={styles.subtitle}>
            Check active campus drives, current student placement numbers, and hiring company updates in one dashboard.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalStudents}</span>
            <span className={styles.statLabel}>Registered Students</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Award size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{placedStudents}</span>
            <span className={styles.statLabel}>Placed Candidates</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{placementPct}%</span>
            <span className={styles.statLabel}>Overall Placement Rate</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-purple-light)', color: 'var(--color-purple)' }}>
            <Building2 size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalCompanies}</span>
            <span className={styles.statLabel}>Partner Companies</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Branch-wise Progress & Recent Drives */}
      <div className={styles.sectionsGrid}>
        {/* Left: Branch-Wise Placement Rate */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Branch-Wise Placement Progress</h2>
            <Link href="/admin/reports" className={styles.viewAll}>
              Full Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.branchBars}>
            {branchStats.map((s) => (
              <div key={s.branch} className={styles.branchRow}>
                <div className={styles.branchMeta}>
                  <strong className={styles.branchName}>{s.branch}</strong>
                  <span className={styles.branchCount}>
                    {s.placed}/{s.total} Placed ({s.pct}%)
                  </span>
                </div>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Drives Overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Campus Drives</h2>
            <Link href="/admin/drives" className={styles.viewAll}>
              View All Drives <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.driveList}>
            {drives.map((d) => (
              <div key={d.id} className={styles.driveRow}>
                <div className={styles.driveInfo}>
                  <strong className={styles.driveTitle}>{d.title}</strong>
                  <span className={styles.driveSub}>
                    {d.company.name} • ₹{d.ctcMin}–{d.ctcMax} LPA
                  </span>
                </div>

                <div className={styles.driveMetaRight}>
                  <span className={styles.badge} data-status={d.status}>
                    {d.status}
                  </span>
                  <span className={styles.applicantCount}>
                    {d._count.applications} applicants
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
