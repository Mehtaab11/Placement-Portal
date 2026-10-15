import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react';
import styles from './result.module.css';

export const metadata = { title: 'Test Result — TPO Portal' };

export default async function TestResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  if (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'true') notFound();

  const { attemptId } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect('/student/dashboard');

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        select: {
          title: true,
          totalMarks: true,
          durationMinutes: true,
          negativeMarking: true,
          packageId: true,
          // Full questions WITH correctIndex and explanation — safe since only revealed post-submission
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              prompt: true,
              options: true,
              correctIndex: true,
              explanation: true,
              marks: true,
              section: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.id) notFound();
  if (attempt.status !== 'SUBMITTED') {
    redirect(`/student/mock-tests`);
  }

  const answers = attempt.answers as Record<string, number>;
  const sectionStats = attempt.sectionStats as Record<string, { correct: number; wrong: number; skipped: number }> | null;
  const accuracy = attempt.correctCount && (attempt.correctCount + (attempt.wrongCount ?? 0)) > 0
    ? ((attempt.correctCount / (attempt.correctCount + (attempt.wrongCount ?? 0) + (attempt.skippedCount ?? 0))) * 100).toFixed(1)
    : '0';

  const scorePercent = attempt.test.totalMarks > 0
    ? Math.min(100, ((attempt.score ?? 0) / attempt.test.totalMarks) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <Link href="/student/mock-tests" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Tests
      </Link>

      {/* Score hero */}
      <div className={styles.scoreHero}>
        <h1 className={styles.testTitle}>{attempt.test.title}</h1>
        <div className={styles.scoreCircle} data-grade={scorePercent >= 80 ? 'excellent' : scorePercent >= 60 ? 'good' : 'needs-work'}>
          <span className={styles.scoreNum}>{(attempt.score ?? 0).toFixed(1)}</span>
          <span className={styles.scoreDenom}>/ {attempt.test.totalMarks}</span>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <CheckCircle2 size={16} color="var(--color-success)" />
            <span className={styles.statNum}>{attempt.correctCount ?? 0}</span>
            <span className={styles.statLbl}>Correct</span>
          </div>
          <div className={styles.stat}>
            <XCircle size={16} color="var(--color-error)" />
            <span className={styles.statNum}>{attempt.wrongCount ?? 0}</span>
            <span className={styles.statLbl}>Wrong</span>
          </div>
          <div className={styles.stat}>
            <MinusCircle size={16} color="var(--color-text-tertiary)" />
            <span className={styles.statNum}>{attempt.skippedCount ?? 0}</span>
            <span className={styles.statLbl}>Skipped</span>
          </div>
          <div className={styles.stat}>
            <Clock size={16} color="var(--color-info)" />
            <span className={styles.statNum}>{attempt.timeTakenSec ? `${Math.floor(attempt.timeTakenSec / 60)}m` : '—'}</span>
            <span className={styles.statLbl}>Time</span>
          </div>
        </div>

        {/* Score bar */}
        <div className={styles.scoreBarWrap}>
          <div className={styles.scoreBar}>
            <div className={styles.scoreBarFill} style={{ width: `${scorePercent}%` }} data-grade={scorePercent >= 80 ? 'excellent' : scorePercent >= 60 ? 'good' : 'needs-work'} />
          </div>
          <span className={styles.accuracyLabel}>Accuracy: {accuracy}%</span>
        </div>

        <p className={styles.submittedAt}>Submitted {formatDate(attempt.submittedAt)}</p>
      </div>

      {/* Section-wise breakdown */}
      {sectionStats && Object.keys(sectionStats).length > 1 && (
        <div className={styles.sectionBreakdown}>
          <h2 className={styles.sectionTitle}>Section Breakdown</h2>
          {Object.entries(sectionStats).map(([section, stats]) => {
            const total = stats.correct + stats.wrong + stats.skipped;
            const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
            return (
              <div key={section} className={styles.sectionRow}>
                <span className={styles.sectionName}>{section}</span>
                <div className={styles.sectionBar}>
                  <div className={styles.sectionBarFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.sectionPct}>{stats.correct}/{total} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Full solutions */}
      <div className={styles.solutionsSection}>
        <h2 className={styles.sectionTitle}>Solutions</h2>
        <div className={styles.questions}>
          {attempt.test.questions.map((q, idx) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.correctIndex;
            const isSkipped = chosen === undefined || chosen === -1;

            return (
              <div key={q.id} className={styles.questionCard} data-result={isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong'}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNum}>Q{idx + 1}</span>
                  <span className={styles.resultBadge} data-result={isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong'}>
                    {isSkipped ? 'Skipped' : isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                  {q.section && <span className={styles.qSection}>{q.section}</span>}
                </div>
                <p className={styles.questionPrompt}>{q.prompt}</p>
                <div className={styles.options}>
                  {(q.options as string[]).map((opt, i) => (
                    <div
                      key={i}
                      className={styles.option}
                      data-state={
                        i === q.correctIndex
                          ? 'correct'
                          : i === chosen && !isSkipped
                          ? 'wrong'
                          : 'neutral'
                      }
                    >
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className={styles.explanation}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
