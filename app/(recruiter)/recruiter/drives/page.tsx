import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Users, IndianRupee, ArrowRight, Briefcase } from 'lucide-react';
import styles from './drivesList.module.css';

export default async function RecruiterDrivesListPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  const drives = recruiter
    ? await prisma.drive.findMany({
        where: { recruiterId: recruiter.id },
        include: {
          applications: true,
          eligibilityCriteria: true,
          rounds: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Placement Drives</h1>
          <p className={styles.subtitle}>
            Monitor active drives, review candidate applications, and schedule interview rounds.
          </p>
        </div>

        <Link href="/recruiter/drives/new" className={styles.primaryBtn}>
          <Plus size={16} /> Post New Drive
        </Link>
      </div>

      {drives.length === 0 ? (
        <div className={styles.empty}>
          <Briefcase size={40} color="var(--color-text-tertiary)" />
          <h2>No drives created yet</h2>
          <p>Get started by creating your first campus placement drive.</p>
          <Link href="/recruiter/drives/new" className={styles.primaryBtn}>
            Post a Placement Drive
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {drives.map((d) => {
            const apps = d.applications;
            const shortlisted = apps.filter((a) => a.stage === 'SHORTLISTED').length;
            const offered = apps.filter((a) => a.stage === 'OFFERED').length;

            return (
              <div key={d.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.statusBadge} data-status={d.status}>
                    {d.status}
                  </span>
                  <span className={styles.jobType}>{d.jobType}</span>
                </div>

                <h2 className={styles.driveTitle}>{d.title}</h2>
                <p className={styles.locationText}>{d.location}</p>

                <div className={styles.metricsBox}>
                  <div className={styles.metric}>
                    <span className={styles.metricVal}>{apps.length}</span>
                    <span className={styles.metricLabel}>Applicants</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricVal}>{shortlisted}</span>
                    <span className={styles.metricLabel}>Shortlisted</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricVal}>{offered}</span>
                    <span className={styles.metricLabel}>Offers</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.ctc}>
                    ₹{d.ctcMin}–{d.ctcMax} LPA
                  </span>
                  <Link href={`/recruiter/drives/${d.id}`} className={styles.pipelineBtn}>
                    Manage Candidates <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
