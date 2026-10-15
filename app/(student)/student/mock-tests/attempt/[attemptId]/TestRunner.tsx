'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';
import styles from './TestRunner.module.css';

interface Question {
  id: string;
  prompt: string;
  options: string[];
  marks: number;
  section: string | null;
  order: number;
}

interface TestInfo {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  questions: Question[];
}

interface TestRunnerProps {
  attemptId: string;
  test: TestInfo;
  startedAt: string;
  initialAnswers: Record<string, number>;
}

const AUTOSAVE_INTERVAL_MS = 15_000;

export default function TestRunner({ attemptId, test, startedAt, initialAnswers }: TestRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    return Math.max(0, test.durationMinutes * 60 - elapsed);
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);

  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!submittedRef.current) void autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      void save(answersRef.current);
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(currentAnswers: Record<string, number>) {
    try {
      await fetch(`/api/student/mock-tests/attempts/${attemptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: currentAnswers }),
      });
    } catch {
      // Silent — autosave failure is non-critical
    }
  }

  const autoSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    await fetch(`/api/student/mock-tests/attempts/${attemptId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersRef.current, timeTakenSec: elapsed }),
    });

    setSubmitted(true);
    router.push(`/student/mock-tests/result/${attemptId}`);
  }, [attemptId, startedAt, router]);

  function selectAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionIndex };
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting || submittedRef.current) return;
    if (!confirm(`Submit test? ${unansweredCount} questions unanswered.`)) return;
    submittedRef.current = true;
    setSubmitting(true);

    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    await fetch(`/api/student/mock-tests/attempts/${attemptId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersRef.current, timeTakenSec: elapsed }),
    });

    setSubmitted(true);
    router.push(`/student/mock-tests/result/${attemptId}`);
  }

  const questions = test.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  const timeWarning = timeLeft < 5 * 60;

  if (submitted) {
    return (
      <div className={styles.container}>
        <p className={styles.submittingMsg}>Submitting… Please wait.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.testTitle}>{test.title}</h1>
        <div className={styles.timerBlock} data-warning={timeWarning} aria-live="polite" aria-label={`Time remaining: ${mm} minutes ${ss} seconds`}>
          <Clock size={16} />
          <span className={styles.timer}>{mm}:{ss}</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Question area */}
        <div className={styles.questionArea}>
          <div className={styles.questionMeta}>
            <span>Q{currentIndex + 1} of {questions.length}</span>
            {currentQuestion.section && <span className={styles.section}>{currentQuestion.section}</span>}
            <span className={styles.marks}>{currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}</span>
          </div>

          <p className={styles.prompt}>{currentQuestion.prompt}</p>

          <div className={styles.options} role="radiogroup" aria-label="Answer options">
            {(currentQuestion.options as string[]).map((opt, i) => {
              const selected = answers[currentQuestion.id] === i;
              return (
                <button
                  key={i}
                  className={styles.option}
                  data-selected={selected}
                  onClick={() => selectAnswer(currentQuestion.id, i)}
                  aria-pressed={selected}
                >
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Clear selection */}
          {answers[currentQuestion.id] !== undefined && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setAnswers((prev) => {
                  const next = { ...prev };
                  delete next[currentQuestion.id];
                  return next;
                });
              }}
            >
              Clear selection
            </button>
          )}

          {/* Navigation */}
          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              className={styles.navBtn}
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Palette */}
        <div className={styles.palette}>
          <div className={styles.paletteHeader}>
            <Flag size={14} />
            <span>Question Palette</span>
          </div>
          <div className={styles.paletteGrid}>
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  className={styles.paletteBtn}
                  data-state={isCurrent ? 'current' : isAnswered ? 'answered' : 'unanswered'}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Question ${i + 1}${isAnswered ? ' answered' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem} data-state="answered">Answered ({answeredCount})</span>
            <span className={styles.legendItem} data-state="unanswered">Not answered ({unansweredCount})</span>
          </div>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
