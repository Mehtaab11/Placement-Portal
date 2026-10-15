'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star,
  MessageSquare,
} from 'lucide-react';
import styles from './videoRecorder.module.css';

interface Question {
  id: string;
  prompt: string;
  thinkSeconds: number;
  maxAnswerSeconds: number;
}

interface AnswerData {
  url: string;
  storageKey: string;
  durationSec: number;
}

interface VideoRecorderProps {
  session: {
    id: string;
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED';
    answers: Record<string, AnswerData>;
    selfRating?: { clarity: number; confidence: number; content: number } | null;
    reviewerFeedback?: string | null;
    template: {
      title: string;
      domain: string;
      description: string;
      questions: Question[];
    };
  };
  studentId: string;
}

export default function VideoRecorder({ session, studentId }: VideoRecorderProps) {
  const router = useRouter();
  const questions = (session.template.questions || []) as Question[];
  const isCompleted = session.status === 'SUBMITTED' || session.status === 'REVIEWED';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerData>>(session.answers || {});
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Recording states
  const [stage, setStage] = useState<'IDLE' | 'THINKING' | 'RECORDING' | 'PREVIEW'>(
    isCompleted ? 'PREVIEW' : 'IDLE',
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [retakeCount, setRetakeCount] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Self-rating state
  const [selfRating, setSelfRating] = useState({
    clarity: session.selfRating?.clarity || 0,
    confidence: session.selfRating?.confidence || 0,
    content: session.selfRating?.content || 0,
  });
  const [ratingSaved, setRatingSaved] = useState(false);

  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentQ = questions[currentIndex];

  // Clean up tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Request camera and microphone access
  const requestMedia = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: true,
      });
      streamRef.current = stream;
      setPermissionGranted(true);
      setPermissionError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      setPermissionGranted(false);
      setPermissionError(
        'Camera or microphone permission was denied. Please allow access in browser settings to practice video interviews.',
      );
    }
  }, []);

  useEffect(() => {
    if (!isCompleted && permissionGranted === null) {
      requestMedia();
    }
  }, [isCompleted, permissionGranted, requestMedia]);

  // When changing questions in IN_PROGRESS mode
  useEffect(() => {
    if (isCompleted) {
      setStage('PREVIEW');
      return;
    }
    const hasAnswer = answers[currentQ?.id];
    if (hasAnswer) {
      setStage('PREVIEW');
    } else {
      setStage('IDLE');
      if (streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, currentQ?.id, answers, isCompleted]);

  // Start Think Time
  const startThinking = () => {
    if (!currentQ) return;
    setStage('THINKING');
    setTimeLeft(currentQ.thinkSeconds || 15);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start Recording
  const startRecording = () => {
    if (!currentQ || !streamRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setStage('RECORDING');
    setTimeLeft(currentQ.maxAnswerSeconds || 60);
    recordedChunksRef.current = [];
    startTimeRef.current = Date.now();

    // Select supported mimeType
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const chosenType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: chosenType,
      videoBitsPerSecond: 800000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: chosenType || 'video/webm' });
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const blobUrl = URL.createObjectURL(blob);
      const storageKey = `video_interviews/${studentId}/${session.id}/${currentQ.id}.webm`;

      const answerData: AnswerData = {
        url: blobUrl,
        storageKey,
        durationSec,
      };

      setAnswers((prev) => ({ ...prev, [currentQ.id]: answerData }));
      setStage('PREVIEW');

      // Auto-save answer to server
      setSaving(true);
      try {
        await fetch(`/api/student/video-interviews/${session.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQ.id,
            answer: answerData,
          }),
        });
      } catch (e) {
        console.error('Failed to auto-save answer:', e);
      } finally {
        setSaving(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);

    // Recording countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Retake answer (max 1 retake per question)
  const handleRetake = () => {
    const currentRetakes = retakeCount[currentQ.id] || 0;
    if (currentRetakes >= 1) return;

    setRetakeCount((prev) => ({ ...prev, [currentQ.id]: currentRetakes + 1 }));
    setStage('IDLE');
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  // Final submission
  const handleSubmitSession = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/video-interviews/${session.id}`, {
        method: 'POST',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error('Error submitting session:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit self-rating
  const handleSaveSelfRating = async () => {
    try {
      const res = await fetch(`/api/student/video-interviews/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfRating }),
      });
      if (res.ok) {
        setRatingSaved(true);
        setTimeout(() => setRatingSaved(false), 3000);
      }
    } catch (e) {
      console.error('Error saving rating:', e);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const currentRetakesUsed = retakeCount[currentQ?.id] || 0;

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/student/video-interviews" className={styles.backLink}>
          <ArrowLeft size={16} /> Exit Studio
        </Link>
        <div className={styles.templateMeta}>
          <span className={styles.domainBadge}>{session.template.domain}</span>
          <h2 className={styles.sessionTitle}>{session.template.title}</h2>
        </div>
        <div className={styles.sessionStatusPill} data-status={session.status}>
          {session.status}
        </div>
      </div>

      {permissionError && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <div>
            <p className={styles.errorTitle}>Permissions Required</p>
            <p className={styles.errorDesc}>{permissionError}</p>
          </div>
          <button onClick={requestMedia} className={styles.retryPermBtn}>
            Try Again
          </button>
        </div>
      )}

      {/* Main Studio Area */}
      <div className={styles.studioLayout}>
        {/* Left Column: Video Viewport */}
        <div className={styles.videoColumn}>
          <div className={styles.videoWrapper}>
            {stage === 'PREVIEW' && answers[currentQ?.id] ? (
              <video
                key={answers[currentQ.id].url}
                src={answers[currentQ.id].url}
                controls
                className={styles.videoPlayer}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.videoFeed}
              />
            )}

            {/* Overlays during think / record */}
            {stage === 'THINKING' && (
              <div className={styles.overlay}>
                <div className={styles.timerBadge}>
                  <Sparkles size={16} />
                  <span>Think Time: {timeLeft}s</span>
                </div>
                <p className={styles.overlayHelp}>Prepare your thoughts. Recording begins automatically.</p>
                <button onClick={startRecording} className={styles.skipThinkBtn}>
                  Skip to Record
                </button>
              </div>
            )}

            {stage === 'RECORDING' && (
              <div className={styles.recordingOverlay}>
                <div className={styles.recordIndicator}>
                  <span className={styles.pulsingDot} />
                  <span>REC {timeLeft}s left</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          {!isCompleted && (
            <div className={styles.controlsBar}>
              {stage === 'IDLE' && (
                <button onClick={startThinking} className={styles.startRecordBtn}>
                  <Play size={18} /> Start Question ({currentQ?.thinkSeconds}s think)
                </button>
              )}

              {stage === 'RECORDING' && (
                <button onClick={stopRecording} className={styles.stopRecordBtn}>
                  <Square size={18} /> Finish Recording
                </button>
              )}

              {stage === 'PREVIEW' && (
                <div className={styles.previewActions}>
                  <button
                    onClick={handleRetake}
                    disabled={currentRetakesUsed >= 1}
                    className={styles.retakeBtn}
                    title={currentRetakesUsed >= 1 ? 'Retake limit reached (1 max)' : 'Retake answer'}
                  >
                    <RotateCcw size={16} /> Retake ({1 - currentRetakesUsed} left)
                  </button>
                  {saving && <span className={styles.savingText}>Saving...</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Question & Guidance / Self-Rating */}
        <div className={styles.sidebarColumn}>
          {/* Question Navigator */}
          <div className={styles.questionNav}>
            <span className={styles.navLabel}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className={styles.navButtons}>
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className={styles.navBtn}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
                className={styles.navBtn}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className={styles.questionCard}>
            <h3 className={styles.qPrompt}>{currentQ?.prompt}</h3>
            <div className={styles.qMeta}>
              <span>Think: {currentQ?.thinkSeconds}s</span>
              <span>•</span>
              <span>Max Answer: {currentQ?.maxAnswerSeconds}s</span>
            </div>
          </div>

          {/* Review & Self-Rating if Submitted */}
          {isCompleted ? (
            <div className={styles.reviewSection}>
              <h4 className={styles.sectionHeading}>Self Reflection</h4>
              <div className={styles.ratingGroup}>
                <label>Clarity & Articulation</label>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelfRating((r) => ({ ...r, clarity: s }))}
                      className={styles.starBtn}
                      data-active={s <= selfRating.clarity}
                    >
                      <Star size={18} fill={s <= selfRating.clarity ? '#F59E0B' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.ratingGroup}>
                <label>Confidence & Body Language</label>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelfRating((r) => ({ ...r, confidence: s }))}
                      className={styles.starBtn}
                      data-active={s <= selfRating.confidence}
                    >
                      <Star size={18} fill={s <= selfRating.confidence ? '#F59E0B' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.ratingGroup}>
                <label>Content & Depth</label>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelfRating((r) => ({ ...r, content: s }))}
                      className={styles.starBtn}
                      data-active={s <= selfRating.content}
                    >
                      <Star size={18} fill={s <= selfRating.content ? '#F59E0B' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSaveSelfRating} className={styles.saveRatingBtn}>
                Save Reflection
              </button>
              {ratingSaved && <span className={styles.savedAlert}>Saved!</span>}

              {session.reviewerFeedback && (
                <div className={styles.reviewerFeedbackCard}>
                  <div className={styles.feedbackHeader}>
                    <MessageSquare size={16} /> Placement Officer Feedback
                  </div>
                  <p className={styles.feedbackBody}>{session.reviewerFeedback}</p>
                </div>
              )}
            </div>
          ) : (
            /* Submission Block */
            <div className={styles.submissionBox}>
              <div className={styles.progressRow}>
                <span>Progress</span>
                <strong>
                  {answeredCount} / {questions.length} answered
                </strong>
              </div>
              <button
                onClick={handleSubmitSession}
                disabled={!allAnswered || submitting}
                className={styles.submitSessionBtn}
              >
                <CheckCircle2 size={18} />
                {submitting ? 'Submitting...' : 'Complete & Submit Interview'}
              </button>
              {!allAnswered && (
                <p className={styles.submitHint}>Record answers for all questions before submitting.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
