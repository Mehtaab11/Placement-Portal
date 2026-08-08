import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase, Users, CheckCircle, Calendar, Plus, ArrowRight } from 'lucide-react';
import styles from './recruiterDashboard.module.css';

export default async function RecruiterDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });

  const drives = recruiter
    ? await prisma.drive.findMany({
        where: { recruiterId: recruiter.id },
        include: {
          applications: {
            include: { student: true },
            orderBy: { appliedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const totalApplications = drives.reduce((acc, d) => acc + d.applications.length, 0);
  const totalShortlisted = drives.reduce(
    (acc, d) => acc + d.applications.filter((a) => a.stage === 'SHORTLISTED').length,
    0
  );
  const totalInterviews = drives.reduce(
    (acc, d) => acc + d.applications.filter((a) => a.stage === 'INTERVIEW').length,
    0
  );
  const totalOffered = drives.reduce(
    (acc, d) => acc + d.applications.filter((a) => a.stage === 'OFFERED').length,
    0
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {recruiter?.company?.name ? `${recruiter.company.name} Recruiting Center` : 'Recruiter Dashboard'}
          </h1>
          <p className={styles.subtitle}>
            Manage your on-campus recruitment pipeline, candidate reviews, and interview schedules.
          </p>
        </div>

        <Link href="/recruiter/drives/new" className={styles.primaryBtn}>
          <Plus size={16} /> Post New Drive
        </Link>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Briefcase size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{drives.length}</span>
            <span className={styles.statLabel}>Active Drives</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <Users size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalApplications}</span>
            <span className={styles.statLabel}>Total Applicants</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-purple-light)', color: 'var(--color-purple)' }}>
            <Calendar size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalInterviews}</span>
            <span className={styles.statLabel}>Interviews Slotted</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{totalOffered}</span>
            <span className={styles.statLabel}>Offers Extended</span>
          </div>
        </div>
      </div>

      {/* Posted Drives Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>My Placement Drives</h2>
          <Link href="/recruiter/drives" className={styles.viewAll}>
            Manage All Drives <ArrowRight size={14} />
          </Link>
        </div>

        {drives.length === 0 ? (
          <div className={styles.empty}>
            <p>You have not created any placement drives yet.</p>
            <Link href="/recruiter/drives/new" className={styles.primaryBtn}>
              Create your first drive
            </Link>
          </div>
        ) : (
          <div className={styles.driveTableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Drive Title</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Shortlisted</th>
                  <th>Offers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((d) => {
                  const apps = d.applications;
                  const shortlisted = apps.filter((a) => a.stage === 'SHORTLISTED').length;
                  const offered = apps.filter((a) => a.stage === 'OFFERED').length;

                  return (
                    <tr key={d.id}>
                      <td className={styles.tdTitle}>
                        <strong>{d.title}</strong>
                        <span className={styles.tdSub}>₹{d.ctcMin}–{d.ctcMax} LPA • {d.location}</span>
                      </td>
                      <td>
                        <span className={styles.badge} data-status={d.status}>
                          {d.status}
                        </span>
                      </td>
                      <td>{apps.length}</td>
                      <td>{shortlisted}</td>
                      <td>{offered}</td>
                      <td>
                        <Link href={`/recruiter/drives/${d.id}`} className={styles.actionLink}>
                          Review Candidates →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
