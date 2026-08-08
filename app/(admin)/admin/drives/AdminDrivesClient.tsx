'use client';

import { useState } from 'react';
import styles from './adminDrives.module.css';
import { Search, Briefcase, CheckCircle2, Users, Award, Eye, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { formatDate } from '@/lib/utils';

interface DriveItem {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  ctcMin: number;
  ctcMax: number;
  status: 'LIVE' | 'CLOSED' | 'DRAFT';
  deadline: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    website: string;
    industry: string;
  };
  eligibilityCriteria: {
    minCGPA: number;
    maxBacklogs: number;
    allowedBranches: string[];
    allowedBatches: number[];
  } | null;
  rounds: {
    id: string;
    name: string;
    roundNumber: number;
  }[];
  applications: {
    id: string;
    stage: string;
  }[];
}

interface Metrics {
  totalDrives: number;
  liveDrives: number;
  totalApps: number;
  totalOffers: number;
}

export function AdminDrivesClient({
  drives,
  metrics,
}: {
  drives: DriveItem[];
  metrics: Metrics;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDrive, setSelectedDrive] = useState<DriveItem | null>(null);

  const filtered = drives.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(q) ||
      d.company.name.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campus Placement Drives</h1>
          <p className={styles.subtitle}>
            Overview of all ongoing corporate recruitment campaigns and candidate traction.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricIconBlue}`}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.metricVal}>{metrics.totalDrives}</div>
            <div className={styles.metricLabel}>Total Drives Posted</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricIconGreen}`}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.metricVal}>{metrics.liveDrives}</div>
            <div className={styles.metricLabel}>Active Live Drives</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
            <Users size={22} />
          </div>
          <div>
            <div className={styles.metricVal}>{metrics.totalApps}</div>
            <div className={styles.metricLabel}>Candidate Registrations</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricIconOrange}`}>
            <Award size={22} />
          </div>
          <div>
            <div className={styles.metricVal}>{metrics.totalOffers}</div>
            <div className={styles.metricLabel}>Job Offers Released</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search drives by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Statuses ({drives.length})</option>
          <option value="LIVE">Live ({drives.filter((d) => d.status === 'LIVE').length})</option>
          <option value="CLOSED">Closed ({drives.filter((d) => d.status === 'CLOSED').length})</option>
          <option value="DRAFT">Draft ({drives.filter((d) => d.status === 'DRAFT').length})</option>
        </select>
      </div>

      {/* Drives Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Package (CTC)</th>
                <th>Location</th>
                <th>Allowed Branches</th>
                <th>Min CGPA</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className={styles.companyCell}>
                      <div className={styles.companyAvatar}>
                        {d.company.name.charAt(0)}
                      </div>
                      <div>
                        <span className={styles.companyName}>{d.company.name}</span>
                        <span className={styles.roleTitle}>{d.title}</span>
                      </div>
                    </div>
                  </td>
                  <td><strong>₹{d.ctcMin}–{d.ctcMax}</strong> LPA</td>
                  <td>{d.location}</td>
                  <td>
                    {d.eligibilityCriteria?.allowedBranches?.length
                      ? d.eligibilityCriteria.allowedBranches.join(', ')
                      : 'All Branches'}
                  </td>
                  <td><strong>{d.eligibilityCriteria?.minCGPA ?? 6.0}</strong>/10</td>
                  <td><strong>{d.applications.length}</strong> applied</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        d.status === 'LIVE'
                          ? styles.badgeLive
                          : d.status === 'CLOSED'
                          ? styles.badgeClosed
                          : styles.badgeDraft
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>{formatDate(d.deadline)}</td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setSelectedDrive(d)}
                      id={`view-drive-${d.id}`}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    No drives matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        open={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        title={selectedDrive?.title ?? 'Drive Details'}
      >
        {selectedDrive && (
          <div className={styles.drawerContent}>
            <div className={styles.drawerCompanyHeader}>
              <div className={styles.drawerLogo}>
                {selectedDrive.company.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>
                  {selectedDrive.company.name}
                </h3>
                <a
                  href={selectedDrive.company.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}
                >
                  {selectedDrive.company.website}
                </a>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h4 className={styles.sectionHeading}>Package & Overview</h4>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Compensation</span>
                  <span className={styles.metaVal}>
                    ₹{selectedDrive.ctcMin}–{selectedDrive.ctcMax} LPA
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Job Type</span>
                  <span className={styles.metaVal}>{selectedDrive.jobType}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaVal}>{selectedDrive.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Deadline</span>
                  <span className={styles.metaVal}>
                    {formatDate(selectedDrive.deadline)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h4 className={styles.sectionHeading}>Role Description</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {selectedDrive.description}
              </p>
            </div>

            {selectedDrive.eligibilityCriteria && (
              <div className={styles.drawerSection}>
                <h4 className={styles.sectionHeading}>Eligibility Requirements</h4>
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Min CGPA</span>
                    <span className={styles.metaVal}>
                      {selectedDrive.eligibilityCriteria.minCGPA}/10
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Max Backlogs</span>
                    <span className={styles.metaVal}>
                      {selectedDrive.eligibilityCriteria.maxBacklogs}
                    </span>
                  </div>
                  <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                    <span className={styles.metaLabel}>Eligible Branches</span>
                    <span className={styles.metaVal}>
                      {selectedDrive.eligibilityCriteria.allowedBranches.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.drawerSection}>
              <h4 className={styles.sectionHeading}>
                Selection Rounds ({selectedDrive.rounds.length})
              </h4>
              <div className={styles.roundsList}>
                {selectedDrive.rounds.map((r) => (
                  <div key={r.id} className={styles.roundStep}>
                    <span className={styles.roundNum}>{r.roundNumber}</span>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>{r.name}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
