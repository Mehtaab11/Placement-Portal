'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Building2,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/Toast';
import { formatDate } from '@/lib/utils';
import { matchesBranch, matchesBranchList } from '@/lib/branchMatcher';
import styles from './studentDrives.module.css';

interface Drive {
  id: string;
  title: string;
  description: string;
  jobType: string;
  location: string;
  ctcMin: number;
  ctcMax: number;
  deadline: string;
  company: {
    id: string;
    name: string;
    website: string;
    industry: string;
    description: string;
  };
  eligibilityCriteria?: {
    minCGPA: number;
    maxBacklogs: number;
    allowedBranches: string[];
    allowedBatches: number[];
  };
  rounds: { id: string; name: string; roundNumber: number }[];
  isEligible: boolean;
  eligibilityReasons: string[];
  hasApplied: boolean;
  applicationStage: string | null;
}

function StudentDrivesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';

  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [applying, setApplying] = useState(false);
  const { addToast } = useToast();

  // Sync if query param changes externally
  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null) {
      setSearch(qParam);
    }
  }, [searchParams]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/drives');
      const data = await res.json();
      if (data.drives) setDrives(data.drives);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApply = async (driveId: string) => {
    try {
      setApplying(true);
      const res = await fetch('/api/student/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveId }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', message: data.error || 'Failed to submit application' });
        return;
      }

      addToast({
        type: 'success',
        message: data.alreadyApplied
          ? 'You have already applied for this drive!'
          : 'Application submitted successfully! Track it in My Applications.',
      });

      // Update local state immediately
      setDrives((prev) =>
        prev.map((d) =>
          d.id === driveId ? { ...d, hasApplied: true, applicationStage: 'APPLIED' } : d
        )
      );

      if (selectedDrive && selectedDrive.id === driveId) {
        setSelectedDrive({
          ...selectedDrive,
          hasApplied: true,
          applicationStage: 'APPLIED',
        });
      }
    } catch {
      addToast({ type: 'error', message: 'Network error occurred' });
    } finally {
      setApplying(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    const title = d.title || '';
    const compName = d.company?.name || '';
    const loc = d.location || '';
    const desc = d.description || '';
    const q = search.trim().toLowerCase();

    // Comprehensive search matching title, company, location, description, or allowed branches (e.g. "mechanical")
    const matchesSearch =
      !q ||
      title.toLowerCase().includes(q) ||
      compName.toLowerCase().includes(q) ||
      loc.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      d.jobType.toLowerCase().includes(q) ||
      matchesBranchList(d.eligibilityCriteria?.allowedBranches, q);

    const allowed = d.eligibilityCriteria?.allowedBranches;
    const matchesBranchDropdown =
      branchFilter === 'ALL' ||
      !allowed ||
      allowed.length === 0 ||
      allowed.some((b) => matchesBranch(b, branchFilter));

    const matchesJobType = jobTypeFilter === 'ALL' || d.jobType === jobTypeFilter;

    return matchesSearch && matchesBranchDropdown && matchesJobType;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Explore Placement Drives</h1>
          <p className={styles.subtitle}>
            Browse verified campus hiring drives, check eligibility criteria, and submit your application with one click.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by company, role, branch (e.g. Mechanical), or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
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

        <div className={styles.selectGroup}>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by branch"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by job type"
          >
            <option value="ALL">All Job Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>

      {/* Drive Grid */}
      {loading ? (
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className={styles.emptyState}>
          <Building2 size={40} color="var(--color-text-tertiary)" />
          <h3>No matching drives found</h3>
          <p>
            {search.trim()
              ? `No placement drives matched "${search}". Try checking other branches or clearing filters.`
              : 'Try adjusting your search criteria or branch filters.'}
          </p>
          {search.trim() && (
            <Button size="sm" variant="outline" onClick={() => setSearch('')} style={{ marginTop: '0.75rem' }}>
              Clear Search Query
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredDrives.map((d) => (
            <div key={d.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.companyBadge}>
                  <div className={styles.avatarLetter}>{d.company.name.charAt(0)}</div>
                  <div>
                    <h3 className={styles.companyName}>{d.company.name}</h3>
                    <span className={styles.industryTag}>{d.company.industry}</span>
                  </div>
                </div>

                <span
                  className={styles.eligibilityBadge}
                  data-eligible={d.isEligible ? 'true' : 'false'}
                >
                  {d.isEligible ? (
                    <>
                      <CheckCircle2 size={12} /> Eligible
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Ineligible
                    </>
                  )}
                </span>
              </div>

              <h2 className={styles.roleTitle}>{d.title}</h2>
              <p className={styles.driveSnippet}>{d.description.slice(0, 110)}...</p>

              <div className={styles.metaRow}>
                <span className={styles.ctc}>
                  <IndianRupee size={13} /> ₹{d.ctcMin}–{d.ctcMax} LPA
                </span>
                <span className={styles.location}>
                  <MapPin size={13} /> {d.location}
                </span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.deadlineText}>
                  Deadline: {formatDate(d.deadline)}
                </span>

                <button
                  className={styles.viewDetailsBtn}
                  onClick={() => setSelectedDrive(d)}
                >
                  {d.hasApplied ? 'View Status' : 'Details & Apply'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-In Details Drawer */}
      <Drawer
        open={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        title={selectedDrive?.title}
        footer={
          selectedDrive && (
            <div className={styles.drawerActions}>
              {selectedDrive.hasApplied ? (
                <div className={styles.appliedBanner}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Already applied (Stage: <strong>{selectedDrive.applicationStage}</strong>)</span>
                </div>
              ) : selectedDrive.isEligible ? (
                <Button
                  size="md"
                  fullWidth
                  loading={applying}
                  icon={<Send size={15} />}
                  onClick={() => handleApply(selectedDrive.id)}
                >
                  Submit 1-Click Application
                </Button>
              ) : (
                <div className={styles.ineligibleWarning}>
                  <XCircle size={16} />
                  <span>You do not meet this company&apos;s criteria.</span>
                </div>
              )}
            </div>
          )
        }
      >
        {selectedDrive && (
          <div className={styles.drawerContent}>
            <div className={styles.drawerCompanyHeader}>
              <div className={styles.drawerLogo}>{selectedDrive.company.name.charAt(0)}</div>
              <div>
                <h3 className={styles.drawerCompanyName}>{selectedDrive.company.name}</h3>
                <a
                  href={selectedDrive.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.drawerWebsite}
                >
                  {selectedDrive.company.website}
                </a>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h4 className={styles.sectionHeading}>Package & Overview</h4>
              <div className={styles.drawerMetaGrid}>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Compensation</span>
                  <span className={styles.metaVal}>₹{selectedDrive.ctcMin}–{selectedDrive.ctcMax} LPA</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Job Type</span>
                  <span className={styles.metaVal}>{selectedDrive.jobType}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaVal}>{selectedDrive.location}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Deadline</span>
                  <span className={styles.metaVal}>
                    {formatDate(selectedDrive.deadline)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h4 className={styles.sectionHeading}>Role Description</h4>
              <p className={styles.drawerDesc}>{selectedDrive.description}</p>
            </div>

            {selectedDrive.eligibilityCriteria && (
              <div className={styles.drawerSection}>
                <h4 className={styles.sectionHeading}>Eligibility Requirements</h4>
                <div className={styles.criteriaList}>
                  <div className={styles.critRow}>
                    <span>Minimum CGPA</span>
                    <strong>{selectedDrive.eligibilityCriteria.minCGPA}</strong>
                  </div>
                  <div className={styles.critRow}>
                    <span>Max Allowed Backlogs</span>
                    <strong>{selectedDrive.eligibilityCriteria.maxBacklogs}</strong>
                  </div>
                  <div className={styles.critRow}>
                    <span>Eligible Branches</span>
                    <strong>{selectedDrive.eligibilityCriteria.allowedBranches.join(', ')}</strong>
                  </div>
                </div>

                {!selectedDrive.isEligible && selectedDrive.eligibilityReasons.length > 0 && (
                  <div className={styles.reasonsBox}>
                    <p className={styles.reasonsTitle}>Why you are ineligible:</p>
                    <ul className={styles.reasonsList}>
                      {selectedDrive.eligibilityReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedDrive.rounds && selectedDrive.rounds.length > 0 && (
              <div className={styles.drawerSection}>
                <h4 className={styles.sectionHeading}>Hiring Process Rounds</h4>
                <div className={styles.roundsList}>
                  {selectedDrive.rounds.map((round, idx) => (
                    <div key={round.id} className={styles.roundStep}>
                      <div className={styles.roundNum}>{idx + 1}</div>
                      <span className={styles.roundName}>{round.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DrivesFallback() {
  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
    </div>
  );
}

export default function StudentDrivesPage() {
  return (
    <Suspense fallback={<DrivesFallback />}>
      <StudentDrivesContent />
    </Suspense>
  );
}
