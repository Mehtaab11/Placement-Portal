'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Video,
  CheckCircle2,
  Clock,
  Crown,
  Search,
  MessageSquare,
  Eye,
  Star,
  Users,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  X,
  Play,
  Calendar,
  Send,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/Toast';
import { formatDate } from '@/lib/utils';
import styles from './adminVideo.module.css';

interface AdminVideoInterviewsClientProps {
  initialSessions: any[];
  upgradedStudents: any[];
  templates: any[];
  metrics: {
    totalSessions: number;
    pendingReview: number;
    reviewed: number;
    upgradedCount: number;
  };
}

const QUICK_FEEDBACK_CHIPS = [
  'Structured answer well using the STAR framework',
  'Good eye contact, clear articulation & confident tone',
  'Strong technical depth and relevant project examples',
  'Try to be more concise and avoid filler words (um/uh)',
  'Solid attempt! Work on structuring key takeaways first',
  'Excellent problem-solving approach and situational clarity',
];

export function AdminVideoInterviewsClient({
  initialSessions,
  upgradedStudents,
  templates,
  metrics,
}: AdminVideoInterviewsClientProps) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [activeTab, setActiveTab] = useState<'submissions' | 'upgraded' | 'templates'>('submissions');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');

  // Review Drawer state
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { addToast } = useToast();

  // Extract distinct domains from templates
  const domains = ['ALL', ...Array.from(new Set(templates.map((t) => t.domain).filter(Boolean)))];

  // Filtering submissions
  const filteredSessions = sessions.filter((s) => {
    const name = s.student?.fullName || '';
    const roll = s.student?.rollNumber || '';
    const branch = s.student?.branch || '';
    const title = s.template?.title || '';
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      name.toLowerCase().includes(q) ||
      roll.toLowerCase().includes(q) ||
      branch.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesDomain = domainFilter === 'ALL' || s.template?.domain === domainFilter;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Open review drawer
  const handleOpenReview = (session: any) => {
    setSelectedSession(session);
    setSelectedQuestionIndex(0);
    setFeedbackText(session.reviewerFeedback || '');
  };

  // Submit official review
  const handleSubmitReview = async () => {
    if (!selectedSession) return;
    if (!feedbackText.trim()) {
      addToast({ type: 'error', message: 'Please write review feedback before submitting.' });
      return;
    }

    try {
      setSubmittingFeedback(true);
      const res = await fetch(`/api/admin/video-interviews/${selectedSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerFeedback: feedbackText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', message: data.error || 'Failed to submit review' });
        return;
      }

      addToast({
        type: 'success',
        message: 'Evaluation submitted successfully! Student has been notified.',
      });

      // Update local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? { ...s, status: 'REVIEWED', reviewerFeedback: feedbackText.trim(), reviewedAt: new Date().toISOString() }
            : s
        )
      );

      setSelectedSession((prev: any) =>
        prev ? { ...prev, status: 'REVIEWED', reviewerFeedback: feedbackText.trim() } : null
      );
    } catch {
      addToast({ type: 'error', message: 'Network error submitting feedback' });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const currentQuestions = (selectedSession?.template?.questions || []) as any[];
  const currentQ = currentQuestions[selectedQuestionIndex] || currentQuestions[0];
  const currentAnswers = (selectedSession?.answers || {}) as Record<string, any>;
  const currentAnswer = currentQ ? currentAnswers[currentQ.id] : null;
  const selfRating = selectedSession?.selfRating as { clarity?: number; confidence?: number; content?: number } | null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mock Video Interview Review Studio</h1>
          <p className={styles.subtitle}>
            Inspect video recordings from upgraded students (PRO / PREMIUM), verify self-reflections, and provide TPO feedback.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <Video size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{metrics.totalSessions}</div>
            <div className={styles.statLabel}>Total Video Sessions</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconOrange}`}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{metrics.pendingReview}</div>
            <div className={styles.statLabel}>Awaiting TPO Review</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{metrics.reviewed}</div>
            <div className={styles.statLabel}>Reviewed & Completed</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <Crown size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{metrics.upgradedCount}</div>
            <div className={styles.statLabel}>Upgraded Students Active</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`${styles.tabBtn} ${activeTab === 'submissions' ? styles.tabBtnActive : ''}`}
        >
          <Video size={16} /> Submissions & Reviews
          <span className={`${styles.tabBadge} ${metrics.pendingReview > 0 ? styles.tabBadgeAlert : ''}`}>
            {metrics.pendingReview > 0 ? `${metrics.pendingReview} pending` : sessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upgraded')}
          className={`${styles.tabBtn} ${activeTab === 'upgraded' ? styles.tabBtnActive : ''}`}
        >
          <Crown size={16} /> Upgraded Students Directory
          <span className={styles.tabBadge}>{upgradedStudents.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`${styles.tabBtn} ${activeTab === 'templates' ? styles.tabBtnActive : ''}`}
        >
          <BookOpen size={16} /> Interview Question Templates
          <span className={styles.tabBadge}>{templates.length}</span>
        </button>
      </div>

      {/* ─── TAB 1: Submissions ─── */}
      {activeTab === 'submissions' && (
        <>
          {/* Filters */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by student name, roll number, branch, or template title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                  }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses ({sessions.length})</option>
              <option value="SUBMITTED">Needs Review ({sessions.filter((s) => s.status === 'SUBMITTED').length})</option>
              <option value="REVIEWED">Reviewed ({sessions.filter((s) => s.status === 'REVIEWED').length})</option>
              <option value="IN_PROGRESS">In Progress ({sessions.filter((s) => s.status === 'IN_PROGRESS').length})</option>
            </select>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className={styles.select}
              aria-label="Filter by domain"
            >
              {domains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom === 'ALL' ? 'All Domains' : dom}
                </option>
              ))}
            </select>
          </div>

          {/* Submissions Grid */}
          {filteredSessions.length === 0 ? (
            <div className={styles.emptyState}>
              <Video size={42} color="var(--color-text-tertiary)" />
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>No video interview submissions found</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', maxWidth: '480px' }}>
                {search.trim() || statusFilter !== 'ALL' || domainFilter !== 'ALL'
                  ? 'No submissions match your current search and filter criteria.'
                  : 'Upgraded students with PRO and PREMIUM plans can record mock video interviews. Once submitted, their recordings will appear here for evaluation.'}
              </p>
              {(search.trim() || statusFilter !== 'ALL' || domainFilter !== 'ALL') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                    setDomainFilter('ALL');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.submissionsGrid}>
              {filteredSessions.map((s) => {
                const subTier = s.student?.subscriptions?.[0]?.plan?.tier || s.student?.subscriptions?.[0]?.tier || 'PRO';
                const rating = s.selfRating as { clarity?: number; confidence?: number; content?: number } | null;

                return (
                  <div key={s.id} className={styles.card}>
                    <div className={styles.cardHead}>
                      <div className={styles.studentMeta}>
                        <div className={styles.avatarCircle}>
                          {(s.student?.fullName || 'S').charAt(0)}
                        </div>
                        <div>
                          <h3 className={styles.studentName}>
                            {s.student?.fullName || 'Student'}
                            <span className={styles.tierPill} data-tier={subTier}>
                              <Crown size={11} /> {subTier}
                            </span>
                          </h3>
                          <p className={styles.metaLine}>
                            {s.student?.branch} • Roll: {s.student?.rollNumber || 'N/A'} • CGPA {s.student?.cgpa || '—'}
                          </p>
                        </div>
                      </div>

                      <span className={styles.statusPill} data-status={s.status}>
                        {s.status === 'SUBMITTED' ? 'Needs Review' : s.status}
                      </span>
                    </div>

                    <div>
                      <span className={styles.templateTag}>
                        <Video size={13} color="var(--color-primary)" />
                        {s.template?.title}
                        {s.template?.domain && ` (${s.template.domain})`}
                      </span>
                    </div>

                    <div className={styles.cardDates}>
                      <span>Started: {formatDate(s.startedAt)}</span>
                      {s.submittedAt && <span>Submitted: {formatDate(s.submittedAt)}</span>}
                    </div>

                    {rating && (
                      <div className={styles.ratingSummary}>
                        <span>Self Reflection</span>
                        <strong>
                          Clarity: {rating.clarity || 0}/5 • Confidence: {rating.confidence || 0}/5 • Content: {rating.content || 0}/5
                        </strong>
                      </div>
                    )}

                    {s.reviewerFeedback && (
                      <div className={styles.feedbackBlock}>
                        <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Placement Officer Feedback:</strong>
                          <p style={{ margin: '2px 0 0 0' }}>{s.reviewerFeedback}</p>
                        </div>
                      </div>
                    )}

                    <div className={styles.cardFoot}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                        {Object.keys(s.answers || {}).length} questions recorded
                      </span>

                      <button
                        type="button"
                        className={`${styles.reviewActionBtn} ${s.status === 'REVIEWED' ? styles.reviewActionBtnOutline : ''}`}
                        onClick={() => handleOpenReview(s)}
                      >
                        {s.status === 'SUBMITTED' ? (
                          <>
                            <Sparkles size={14} /> Review & Evaluate
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> View Submission
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: Upgraded Students ─── */}
      {activeTab === 'upgraded' && (
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Branch & Batch</th>
                  <th>Subscription Tier</th>
                  <th>Valid Until</th>
                  <th>Sessions Taken</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upgradedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                      No active upgraded students found. Grant subscriptions or test with student checkout.
                    </td>
                  </tr>
                ) : (
                  upgradedStudents.map((st) => {
                    const activeSub = st.subscriptions?.[0];
                    const tierName = activeSub?.plan?.name || activeSub?.tier || 'PRO';

                    return (
                      <tr key={st.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className={styles.avatarCircle}>{(st.fullName || 'S').charAt(0)}</div>
                            <div>
                              <strong style={{ display: 'block' }}>{st.fullName}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {st.user?.email} • Roll: {st.rollNumber}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span>{st.branch}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'block' }}>
                            Batch {st.batch || '—'} • CGPA {st.cgpa || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.tierPill} data-tier={activeSub?.tier}>
                            <Crown size={12} /> {tierName}
                          </span>
                        </td>
                        <td>
                          {activeSub?.currentPeriodEnd ? formatDate(activeSub.currentPeriodEnd) : 'Lifetime'}
                        </td>
                        <td>
                          <strong>{st.videoSessions?.length || 0}</strong> interviews
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.reviewActionBtnOutline}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                            onClick={() => {
                              setSearch(st.fullName);
                              setActiveTab('submissions');
                            }}
                          >
                            Filter Submissions →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Templates ─── */}
      {activeTab === 'templates' && (
        <div className={styles.templatesGrid}>
          {templates.map((tmpl) => {
            const qList = (tmpl.questions || []) as any[];

            return (
              <div key={tmpl.id} className={styles.templateCard}>
                <div className={styles.templateHead}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                      {tmpl.title}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      Domain: <strong>{tmpl.domain || 'General'}</strong>
                    </p>
                  </div>
                  <span className={styles.tierPill} data-tier={tmpl.requiredTier || 'PRO'}>
                    <Crown size={12} /> {tmpl.requiredTier || 'PRO'}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {tmpl.description}
                </p>

                <div style={{ background: 'var(--color-bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                    Questions ({qList.length}):
                  </span>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {qList.map((q, idx) => (
                      <li key={q.id || idx}>
                        {q.prompt} <span style={{ color: 'var(--color-text-tertiary)' }}>({q.thinkSeconds}s think / {q.maxAnswerSeconds}s max)</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span>Published: {tmpl.isPublished ? 'Yes (Live)' : 'Draft'}</span>
                  <span><strong>{tmpl._count?.sessions || 0}</strong> total attempts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Video Evaluation & Review Drawer ─── */}
      <Drawer
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title={selectedSession ? `Evaluation: ${selectedSession.student?.fullName}` : 'Review'}
        width="560px"
        footer={
          selectedSession && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Button size="sm" variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                loading={submittingFeedback}
                icon={<Send size={14} />}
                onClick={handleSubmitReview}
              >
                {selectedSession.status === 'REVIEWED' ? 'Update Feedback' : 'Release Feedback to Student'}
              </Button>
            </div>
          )
        }
      >
        {selectedSession && (
          <div className={styles.drawerBody}>
            {/* Student Details Header */}
            <div className={styles.drawerTop}>
              <div className={styles.drawerStudent}>
                <div className={styles.avatarCircle} style={{ width: 44, height: 44 }}>
                  {(selectedSession.student?.fullName || 'S').charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                    {selectedSession.student?.fullName}
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {selectedSession.student?.user?.email} • Roll: {selectedSession.student?.rollNumber}
                  </p>
                </div>
              </div>

              <span className={styles.statusPill} data-status={selectedSession.status}>
                {selectedSession.status}
              </span>
            </div>

            {/* Academic Snapshot */}
            <div className={styles.drawerGrid}>
              <div className={styles.drawerStat}>
                <span>Branch & Batch</span>
                <strong>{selectedSession.student?.branch} ({selectedSession.student?.batch})</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>CGPA / Academics</span>
                <strong>{selectedSession.student?.cgpa || '—'} / 10</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Interview Template</span>
                <strong>{selectedSession.template?.title}</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Submitted On</span>
                <strong>{selectedSession.submittedAt ? formatDate(selectedSession.submittedAt) : 'In Progress'}</strong>
              </div>
            </div>

            {/* Self-Rating Card */}
            {selfRating && (
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerHeading}>
                  <Star size={15} color="#F59E0B" /> Student Self-Reflection Scores
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', display: 'block' }}>Clarity</span>
                    <strong style={{ fontSize: '1rem', color: '#F59E0B' }}>{selfRating.clarity || 0}/5</strong>
                  </div>
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', display: 'block' }}>Confidence</span>
                    <strong style={{ fontSize: '1rem', color: '#F59E0B' }}>{selfRating.confidence || 0}/5</strong>
                  </div>
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', display: 'block' }}>Content Depth</span>
                    <strong style={{ fontSize: '1rem', color: '#F59E0B' }}>{selfRating.content || 0}/5</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Questions & Video Answers */}
            <div className={styles.drawerSection}>
              <h4 className={styles.drawerHeading}>
                <Video size={15} color="var(--color-primary)" /> Question Recordings ({currentQuestions.length})
              </h4>

              {/* Question selector tabs */}
              <div className={styles.questionTabs}>
                {currentQuestions.map((q, idx) => {
                  const hasAnswer = Boolean(currentAnswers[q.id]);
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      className={`${styles.questionTabBtn} ${selectedQuestionIndex === idx ? styles.questionTabBtnActive : ''}`}
                      onClick={() => setSelectedQuestionIndex(idx)}
                    >
                      Q{idx + 1} {hasAnswer ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Active question prompt */}
              {currentQ && (
                <div className={styles.qPromptCard}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{currentQ.prompt}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', display: 'block', marginTop: '4px' }}>
                    Think time: {currentQ.thinkSeconds}s • Max answer: {currentQ.maxAnswerSeconds}s
                  </span>
                </div>
              )}

              {/* Video Player Box */}
              <div className={styles.videoBox}>
                {currentAnswer?.url ? (
                  <video
                    key={currentAnswer.url}
                    src={currentAnswer.url}
                    controls
                    playsInline
                    className={styles.videoElement}
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <Video size={36} color="var(--color-text-tertiary)" />
                    <span>
                      {currentAnswer
                        ? `Recorded Answer (${currentAnswer.durationSec || 0}s duration)`
                        : 'No recording available for this question yet.'}
                    </span>
                    {currentAnswer?.storageKey && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                        Key: {currentAnswer.storageKey}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Feedback & Evaluation Form */}
            <div className={styles.drawerSection}>
              <h4 className={styles.drawerHeading}>
                <MessageSquare size={15} color="#7C3AED" /> TPO Reviewer Evaluation & Feedback
              </h4>

              {/* Quick feedback chips */}
              <div className={styles.chipsContainer}>
                {QUICK_FEEDBACK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={styles.chipBtn}
                    onClick={() => {
                      setFeedbackText((prev) => (prev ? `${prev}\n• ${chip}` : `• ${chip}`));
                    }}
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                className={styles.feedbackTextarea}
                placeholder="Write actionable, constructive feedback for this student's response structure, delivery, technical depth, and body language..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

