import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Video, MessageSquare } from 'lucide-react';
import styles from './adminVideo.module.css';

export const metadata = { title: 'Mock Video Interviews — Admin' };

export default async function AdminVideoInterviewsPage() {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const sessions = await prisma.videoInterviewSession.findMany({
    include: {
      student: { select: { fullName: true, rollNumber: true, branch: true } },
      template: { select: { title: true, domain: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Video Interview Submissions</h1>
          <p className={styles.subtitle}>
            Review student async interview recordings, view self-reflections, and provide feedback.
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {sessions.map((s) => {
          const rating = s.selfRating as { clarity?: number; confidence?: number; content?: number } | null;
          return (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h3 className={styles.studentName}>{s.student.fullName} ({s.student.rollNumber || 'N/A'})</h3>
                  <p className={styles.metaLine}>{s.template.title} • {s.student.branch}</p>
                </div>
                <span className={styles.statusPill} data-status={s.status}>
                  {s.status}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.dateLine}>Started: {formatDate(s.startedAt)}</div>
                {s.submittedAt && <div className={styles.dateLine}>Submitted: {formatDate(s.submittedAt)}</div>}

                {rating && (
                  <div className={styles.ratingSummary}>
                    <span>Self-Rating: </span>
                    <strong>
                      Clarity: {rating.clarity || 0}/5 • Confidence: {rating.confidence || 0}/5 • Content: {rating.content || 0}/5
                    </strong>
                  </div>
                )}

                {s.reviewerFeedback && (
                  <div className={styles.feedbackBlock}>
                    <MessageSquare size={14} />
                    <span><strong>Feedback:</strong> {s.reviewerFeedback}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardFoot}>
                <Link href={`/student/video-interviews/${s.id}`} className={styles.viewBtn}>
                  <Video size={14} /> Open Recording Session
                </Link>
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className={styles.emptyState}>No video interview sessions recorded yet.</div>
        )}
      </div>
    </div>
  );
}
