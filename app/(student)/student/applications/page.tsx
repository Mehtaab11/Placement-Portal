import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import styles from './studentApps.module.css';

export default async function StudentApplicationsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  const applications = profile
    ? await prisma.application.findMany({
        where: { studentId: profile.id },
        include: {
          drive: {
            include: {
              company: true,
              rounds: { orderBy: { roundNumber: 'asc' } },
            },
          },
          stageHistory: { orderBy: { changedAt: 'desc' } },
          interviewSlots: { orderBy: { scheduledAt: 'desc' } },
        },
        orderBy: { appliedAt: 'desc' },
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Applications</h1>
          <p className={styles.subtitle}>
            Track your application status, interview schedules, and shortlisted results for every campus drive.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className={styles.empty}>
          <Briefcase size={40} color="var(--color-text-tertiary)" />
          <h2>No applications found</h2>
          <p>You haven’t applied for any recruitment drives yet.</p>
          <Link href="/student/drives" className={styles.primaryBtn}>
            Explore Active Drives
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {applications.map((app) => {
            const slot = app.interviewSlots?.[0];
            return (
              <div key={app.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.companyInfo}>
                    <div className={styles.logo}>{app.drive.company.name.charAt(0)}</div>
                    <div>
                      <h2 className={styles.roleTitle}>{app.drive.title}</h2>
                      <p className={styles.companyName}>{app.drive.company.name}</p>
                    </div>
                  </div>

                  <div className={styles.stageTag} data-stage={app.stage}>
                    {app.stage}
                  </div>
                </div>

                {/* Rounds Progress Bar */}
                <div className={styles.roundsSection}>
                  <p className={styles.sectionHeading}>Hiring Pipeline</p>
                  <div className={styles.pipeline}>
                    <div className={`${styles.step} ${styles.completed}`}>
                      <span className={styles.stepDot} />
                      <span className={styles.stepLabel}>Applied</span>
                    </div>

                    <div
                      className={`${styles.step} ${
                        app.stage !== 'APPLIED' ? styles.completed : styles.active
                      }`}
                    >
                      <span className={styles.stepDot} />
                      <span className={styles.stepLabel}>Shortlist</span>
                    </div>

                    <div
                      className={`${styles.step} ${
                        ['INTERVIEW', 'OFFERED'].includes(app.stage)
                          ? styles.completed
                          : ''
                      }`}
                    >
                      <span className={styles.stepDot} />
                      <span className={styles.stepLabel}>Interview</span>
                    </div>

                    <div
                      className={`${styles.step} ${
                        app.stage === 'OFFERED' ? styles.completed : ''
                      }`}
                    >
                      <span className={styles.stepDot} />
                      <span className={styles.stepLabel}>Offer</span>
                    </div>
                  </div>
                </div>

                {/* Interview Slot Alert if scheduled */}
                {slot && (
                  <div className={styles.interviewAlert}>
                    <Calendar size={16} />
                    <div>
                      <strong>Interview Scheduled: </strong>
                      {new Date(slot.scheduledAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <span className={styles.appliedDate}>
                    Applied on {formatDate(app.appliedAt)}
                  </span>
                  <span className={styles.ctc}>
                    ₹{app.drive.ctcMin}–{app.drive.ctcMax} LPA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
