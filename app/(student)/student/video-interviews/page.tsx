import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getStudentEntitlements } from '@/lib/subscription/entitlements';
import Link from 'next/link';
import { Video, Lock, Clock } from 'lucide-react';
import styles from './videoInterviews.module.css';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Video Interviews — TPO Portal' };

export default async function VideoInterviewsPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const entitlements = await getStudentEntitlements(session.user.id);

  const hasVideoAccess =
    (entitlements.tier === 'PRO' || entitlements.tier === 'PREMIUM') &&
    entitlements.isActive &&
    entitlements.features.videoInterviewsPerMonth > 0;

  const templates = await prisma.videoInterviewTemplate.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      domain: true,
      description: true,
      requiredTier: true,
      questions: true,
    },
  });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const sessions = profile
    ? await prisma.videoInterviewSession.findMany({
        where: { studentId: profile.id },
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          startedAt: true,
          reviewerFeedback: true,
          template: { select: { title: true } },
        },
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video Interview Practice</h1>
        <p className={styles.subtitle}>
          Record video responses to common interview questions and receive feedback.
        </p>
      </div>

      {/* Access gate */}
      {!hasVideoAccess && (
        <div className={styles.gateCard}>
          <Lock size={32} color="var(--color-text-tertiary)" />
          <h2 className={styles.gateTitle}>Upgrade to Access Video Interviews</h2>
          <p className={styles.gateDesc}>
            Video interview practice is available with PRO and PREMIUM plans. Practice answering common HR and technical questions, review your recordings, and get expert feedback.
          </p>
          <Link href="/student/subscription" className={styles.upgradeBtn}>
            View Plans
          </Link>
        </div>
      )}

      {/* Templates */}
      <div className={styles.grid}>
        {templates.map((tmpl) => {
          const questionCount = (tmpl.questions as unknown[]).length;
          const templateLocked =
            !hasVideoAccess ||
            (tmpl.requiredTier === 'PREMIUM' && entitlements.tier !== 'PREMIUM');

          return (
            <div key={tmpl.id} className={styles.card} data-locked={templateLocked}>
              <div className={styles.cardHeader}>
                <Video size={20} color={templateLocked ? 'var(--color-text-tertiary)' : 'var(--color-primary)'} />
                <div className={styles.cardTier}>
                  {tmpl.requiredTier && (
                    <span className={styles.tierBadge} data-tier={tmpl.requiredTier}>{tmpl.requiredTier}</span>
                  )}
                </div>
              </div>
              <h3 className={styles.cardTitle}>{tmpl.title}</h3>
              {tmpl.domain && <p className={styles.cardDomain}>{tmpl.domain}</p>}
              <p className={styles.cardDesc}>{tmpl.description}</p>
              <div className={styles.cardMeta}>
                <Clock size={13} />
                <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
              </div>

              {templateLocked ? (
                <div className={styles.lockNote}>
                  <Lock size={14} />
                  {!hasVideoAccess ? 'Requires PRO or higher' : `Requires ${tmpl.requiredTier}`}
                </div>
              ) : (
                <Link href={`/student/video-interviews/${tmpl.id}`} className={styles.startBtn}>
                  Start Practice
                </Link>
              )}
            </div>
          );
        })}

        {templates.length === 0 && (
          <div className={styles.empty}>
            <Video size={40} color="var(--color-text-tertiary)" />
            <p>No interview templates published yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Past sessions */}
      {sessions.length > 0 && (
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>Past Sessions</h2>
          <div className={styles.sessionList}>
            {sessions.map((s) => (
              <div key={s.id} className={styles.sessionCard}>
                <div>
                  <p className={styles.sessionTemplate}>{s.template.title}</p>
                  <p className={styles.sessionDate}>{formatDate(s.startedAt)}</p>
                </div>
                <div className={styles.sessionRight}>
                  <span className={styles.statusBadge} data-status={s.status}>
                    {s.status}
                  </span>
                  {s.reviewerFeedback && (
                    <span className={styles.feedbackDot} title="Feedback available" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
