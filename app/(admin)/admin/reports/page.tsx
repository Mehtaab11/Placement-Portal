import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Award, IndianRupee, Users, TrendingUp, Building2, CheckCircle2 } from 'lucide-react';
import styles from './reports.module.css';

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const totalStudents = await prisma.studentProfile.count();
  const placedStudents = await prisma.studentProfile.count({ where: { isPlaced: true } });
  const totalOffers = await prisma.application.count({ where: { stage: 'OFFERED' } });

  const placedProfiles = await prisma.studentProfile.findMany({
    where: { isPlaced: true, placedCTC: { not: null } },
    select: { placedCTC: true },
  });

  const ctcs = placedProfiles.map((p) => p.placedCTC || 0);
  const highestCTC = ctcs.length > 0 ? Math.max(...ctcs) : 0;
  const avgCTC = ctcs.length > 0 ? (ctcs.reduce((a, b) => a + b, 0) / ctcs.length).toFixed(1) : 0;
  const overallRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const branches = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];
  const branchData = await Promise.all(
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
          <h1 className={styles.title}>Placement Analytics & Reports</h1>
          <p className={styles.subtitle}>
            Track placement percentages, salary packages, and branch statistics across the current academic season.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalStudents}</span>
            <span className={styles.statLabel}>Total Eligible Batch</span>
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
            <IndianRupee size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>₹{avgCTC} LPA</span>
            <span className={styles.statLabel}>Average CTC</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-purple-light)', color: 'var(--color-purple)' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>₹{highestCTC} LPA</span>
            <span className={styles.statLabel}>Highest CTC Package</span>
          </div>
        </div>
      </div>

      {/* Branch Table */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Department-Wise Placement Summary</h2>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Department</th>
                <th>Registered Students</th>
                <th>Placed Candidates</th>
                <th>Placement Rate</th>
                <th>Progress Bar</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map((d) => (
                <tr key={d.branch}>
                  <td><strong>{d.branch}</strong></td>
                  <td>{d.total}</td>
                  <td>{d.placed}</td>
                  <td><strong>{d.pct}%</strong></td>
                  <td style={{ width: '40%' }}>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${d.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
