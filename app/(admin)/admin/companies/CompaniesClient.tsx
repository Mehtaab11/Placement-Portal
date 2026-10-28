'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Globe,
  ShieldCheck,
  Search,
  ExternalLink,
  Users,
  Briefcase,
  Calendar,
  MapPin,
  X,
  Mail,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import styles from './companies.module.css';
import { formatDate, formatCTC } from '@/lib/utils';

export interface RecruiterInfo {
  id: string;
  fullName: string;
  designation: string;
  user: {
    email: string;
    createdAt?: Date | string;
  };
}

export interface DriveInfo {
  id: string;
  title: string;
  status: string;
  jobType: string;
  location: string;
  ctcMin: number;
  ctcMax: number;
  deadline: Date | string;
  description: string;
  eligibilityCriteria?: {
    minCGPA: number;
    maxBacklogs: number;
    allowedBranches: string[];
  } | null;
  rounds?: Array<{
    id?: string;
    name: string;
    roundNumber: number;
  }>;
  _count?: {
    applications: number;
  };
}

export interface CompanyWithDetails {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  description: string;
  address?: string;
  verified: boolean;
  verifiedAt?: Date | string | null;
  createdAt: Date | string;
  drives: DriveInfo[];
  recruiters: RecruiterInfo[];
}

export function CompaniesClient({
  initialCompanies,
}: {
  initialCompanies: CompanyWithDetails[];
}) {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCompany) {
        setSelectedCompany(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompany]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedCompany) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedCompany]);

  // Industries list
  const industries = [
    'ALL',
    ...Array.from(new Set(initialCompanies.map((c) => c.industry).filter(Boolean))),
  ];

  // Filtering
  const filtered = initialCompanies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.recruiters.some((r) => r.fullName.toLowerCase().includes(search.toLowerCase()));

    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  // Aggregate stats
  const totalLiveDrives = initialCompanies.reduce(
    (acc, c) => acc + c.drives.filter((d) => d.status === 'LIVE').length,
    0,
  );
  const totalRecruiters = initialCompanies.reduce((acc, c) => acc + c.recruiters.length, 0);
  const totalVerified = initialCompanies.filter((c) => c.verified).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partner Companies & Recruiters</h1>
          <p className={styles.subtitle}>
            Browse corporate recruitment partners, inspect active campus hiring drives, and view verified recruiter points of contact. Click any company card to view full profiles and drives.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{initialCompanies.length}</div>
            <div className={styles.statLabel}>Partner Companies</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{totalVerified}</div>
            <div className={styles.statLabel}>Verified Partners</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{totalLiveDrives}</div>
            <div className={styles.statLabel}>Live Campus Drives</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{totalRecruiters}</div>
            <div className={styles.statLabel}>Registered HRs</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search by company, industry, or recruiter name..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.industryFilters}>
          {industries.map((ind) => (
            <button
              key={ind}
              type="button"
              className={styles.filterPill}
              data-active={selectedIndustry === ind}
              onClick={() => setSelectedIndustry(ind)}
            >
              {ind === 'ALL' ? 'All Industries' : ind}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            No partner companies match your search or filter. Try clearing filters.
          </div>
        ) : (
          filtered.map((c) => {
            const liveCount = c.drives.filter((d) => d.status === 'LIVE').length;
            return (
              <div
                key={c.id}
                className={styles.card}
                onClick={() => setSelectedCompany(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCompany(c);
                  }
                }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.logo}>{c.name.charAt(0)}</div>
                  <div>
                    <h2 className={styles.companyName}>
                      {c.name}
                    </h2>
                    <span className={styles.industry}>
                      {c.industry} • Employees: {c.size || 'N/A'}
                    </span>
                  </div>
                </div>

                <p className={styles.desc}>{c.description}</p>

                <div className={styles.metaRow}>
                  <span
                    className={styles.webLink}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(c.website, '_blank', 'noreferrer');
                    }}
                  >
                    <Globe size={13} /> {c.website.replace(/^https?:\/\//, '')}
                  </span>
                  <span className={styles.drivesCount}>
                    <strong>{liveCount}</strong> live {liveCount === 1 ? 'drive' : 'drives'}
                  </span>
                </div>

                <div className={styles.footer}>
                  <span className={styles.verifiedTag}>
                    <ShieldCheck size={14} color="var(--color-success)" /> Verified Partner
                  </span>
                  <span className={styles.clickHint}>
                    View Details <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

// ─── CompanyDetailsModal ──────────────────────────────────────────────────────

function CompanyDetailsModal({
  company,
  onClose,
}: {
  company: CompanyWithDetails;
  onClose: () => void;
}) {
  const liveDrives = company.drives.filter((d) => d.status === 'LIVE');

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="company-modal-title"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalLogo}>{company.name.charAt(0)}</div>
            <div className={styles.modalTitleRow}>
              <h2 id="company-modal-title" className={styles.modalCompanyName}>
                {company.name}
                {company.verified && (
                  <ShieldCheck size={18} color="var(--color-success)" />
                )}
              </h2>
              <div className={styles.badgesRow}>
                <span className={styles.modalBadge}>{company.industry}</span>
                <span className={styles.modalBadge}>Size: {company.size || '50+'}</span>
                {company.verified && (
                  <span className={styles.verifiedTag} style={{ fontSize: '0.75rem' }}>
                    Verified Partner
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close company details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Quick Stats Grid */}
          <div className={styles.modalStatsGrid}>
            <div className={styles.modalStatItem}>
              <span className={styles.modalStatNum}>{liveDrives.length}</span>
              <span className={styles.modalStatTitle}>Live Drives</span>
            </div>
            <div className={styles.modalStatItem}>
              <span className={styles.modalStatNum}>{company.drives.length}</span>
              <span className={styles.modalStatTitle}>Total Drives</span>
            </div>
            <div className={styles.modalStatItem}>
              <span className={styles.modalStatNum}>{company.recruiters.length}</span>
              <span className={styles.modalStatTitle}>HR Contacts</span>
            </div>
            <div className={styles.modalStatItem}>
              <span className={styles.modalStatNum}>{formatDate(company.createdAt).split(',')[1]?.trim() || '2024'}</span>
              <span className={styles.modalStatTitle}>Partner Since</span>
            </div>
          </div>

          {/* About Company */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Building2 size={16} color="var(--color-primary)" />
              Company Overview
            </h3>
            <p className={styles.sectionDesc}>
              {company.description || `${company.name} is a verified hiring partner on the TPO campus placement portal.`}
            </p>
            {company.address && (
              <p className={styles.sectionDesc} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                <MapPin size={13} color="var(--color-text-tertiary)" />
                {company.address}
              </p>
            )}
          </div>

          {/* Campus Placement Drives */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Briefcase size={16} color="var(--color-primary)" />
                Placement Drives ({company.drives.length})
              </h3>
              <Link
                href="/admin/drives"
                className={styles.clickHint}
                onClick={onClose}
              >
                Go to Drives Manager →
              </Link>
            </div>

            {company.drives.length === 0 ? (
              <p className={styles.sectionDesc} style={{ fontStyle: 'italic' }}>
                No active placement drives currently published by this company.
              </p>
            ) : (
              <div className={styles.drivesList}>
                {company.drives.map((d) => (
                  <div key={d.id} className={styles.driveCard}>
                    <div className={styles.driveCardTop}>
                      <span className={styles.driveTitle}>{d.title}</span>
                      <span className={styles.driveStatus} data-status={d.status}>
                        {d.status}
                      </span>
                    </div>

                    <div className={styles.driveMetaRow}>
                      <span className={styles.driveMetaItem}>
                        <span>Package:</span>
                        <strong>{formatCTC(d.ctcMin)} – {formatCTC(d.ctcMax)}</strong>
                      </span>
                      <span className={styles.driveMetaItem}>
                        <span>Type:</span>
                        <strong>{d.jobType.replace('_', ' ')}</strong>
                      </span>
                      <span className={styles.driveMetaItem}>
                        <span>Location:</span>
                        <strong>{d.location || 'Campus / Office'}</strong>
                      </span>
                      <span className={styles.driveMetaItem}>
                        <span>Deadline:</span>
                        <strong>{formatDate(d.deadline)}</strong>
                      </span>
                    </div>

                    {/* Eligibility details if present */}
                    {d.eligibilityCriteria && (
                      <div className={styles.driveMetaRow} style={{ color: 'var(--color-text-tertiary)', fontSize: '0.6875rem' }}>
                        <span>Min CGPA: <strong>{d.eligibilityCriteria.minCGPA || 0}</strong></span>
                        <span>•</span>
                        <span>Max Backlogs: <strong>{d.eligibilityCriteria.maxBacklogs}</strong></span>
                        <span>•</span>
                        <span>Branches: <strong>{d.eligibilityCriteria.allowedBranches?.join(', ') || 'All'}</strong></span>
                      </div>
                    )}

                    {/* Selection Rounds Pipeline */}
                    {d.rounds && d.rounds.length > 0 && (
                      <div className={styles.driveRoundsWrap}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Rounds:</span>
                        {d.rounds.map((r, idx) => (
                          <span key={idx} className={styles.roundPill}>
                            {idx + 1}. {r.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recruiter Contacts */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Users size={16} color="var(--color-primary)" />
              Recruiter & Talent Contacts ({company.recruiters.length})
            </h3>
            {company.recruiters.length === 0 ? (
              <p className={styles.sectionDesc} style={{ fontStyle: 'italic' }}>
                No active recruiter profiles attached to this company.
              </p>
            ) : (
              <div className={styles.recruitersList}>
                {company.recruiters.map((r) => (
                  <div key={r.id} className={styles.recruiterCard}>
                    <span className={styles.recruiterName}>{r.fullName || 'Recruiter'}</span>
                    <span className={styles.recruiterRole}>{r.designation || 'Talent Acquisition'}</span>
                    <a
                      href={`mailto:${r.user?.email}`}
                      className={styles.recruiterEmail}
                      title={`Email ${r.fullName}`}
                    >
                      <Mail size={12} /> {r.user?.email}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className={styles.actionBtn}
          >
            <Globe size={14} /> Visit Website <ExternalLink size={12} />
          </a>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
