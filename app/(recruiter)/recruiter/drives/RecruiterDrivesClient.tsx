'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, ArrowRight, Briefcase, Search, X, Loader2 } from 'lucide-react';
import { matchesBranchList } from '@/lib/branchMatcher';
import styles from './drivesList.module.css';

interface RecruiterDrivesClientProps {
  initialDrives: any[];
}

function RecruiterDrivesList({ initialDrives }: RecruiterDrivesClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null) {
      setSearch(qParam);
    }
  }, [searchParams]);

  const filtered = initialDrives.filter((d) => {
    const title = d.title || '';
    const loc = d.location || '';
    const jobType = d.jobType || '';
    const status = d.status || '';
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      title.toLowerCase().includes(q) ||
      loc.toLowerCase().includes(q) ||
      jobType.toLowerCase().includes(q) ||
      status.toLowerCase().includes(q) ||
      matchesBranchList(d.eligibilityCriteria?.allowedBranches, q)
    );
  });

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

      {initialDrives.length > 0 && (
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search drives by role, location, status, or branch (e.g. Mechanical)..."
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
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {initialDrives.length === 0 ? (
        <div className={styles.empty}>
          <Briefcase size={40} color="var(--color-text-tertiary)" />
          <h2>No drives created yet</h2>
          <p>Get started by creating your first campus placement drive.</p>
          <Link href="/recruiter/drives/new" className={styles.primaryBtn}>
            Post a Placement Drive
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Briefcase size={40} color="var(--color-text-tertiary)" />
          <h2>No matching drives found</h2>
          <p>No drives match your search query &ldquo;{search}&rdquo;.</p>
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              marginTop: '0.5rem',
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '6px 14px',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((d) => {
            const apps = d.applications || [];
            const shortlisted = apps.filter((a: any) => a.stage === 'SHORTLISTED').length;
            const offered = apps.filter((a: any) => a.stage === 'OFFERED').length;

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

export function RecruiterDrivesClient({ initialDrives }: RecruiterDrivesClientProps) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        </div>
      }
    >
      <RecruiterDrivesList initialDrives={initialDrives} />
    </Suspense>
  );
}

