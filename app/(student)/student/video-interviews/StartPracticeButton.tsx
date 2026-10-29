'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import styles from './videoInterviews.module.css';

export function StartPracticeButton({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/video-interviews/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        router.push(`/student/video-interviews/${data.sessionId}`);
      } else {
        router.push(`/student/video-interviews/${templateId}`);
      }
    } catch {
      router.push(`/student/video-interviews/${templateId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.startBtn}
      onClick={handleStart}
      disabled={loading}
      style={{
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
      }}
    >
      {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
      {loading ? 'Starting...' : 'Start Practice'}
    </button>
  );
}

