import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Globe,
  ShieldCheck,
  Users,
  Briefcase,
  ArrowLeft,
  Mail,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';
import styles from '../companies.module.css';
import { formatDate, formatCTC } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      drives: {
        include: {
          eligibilityCriteria: true,
          rounds: { orderBy: { roundNumber: 'asc' } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      recruiters: {
        include: {
          user: { select: { email: true, createdAt: true } },
        },
      },
    },
  });

  if (!company) notFound();

  const liveDrives = company.drives.filter((d) => d.status === 'LIVE');

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div>
        <Link
          href="/admin/companies"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Companies
        </Link>
      </div>

      {/* Hero Header */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.modalLogo} style={{ width: 64, height: 64, fontSize: '1.75rem' }}>
              {company.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {company.name}
                {company.verified && (
                  <ShieldCheck size={20} color="var(--color-success)" />
                )}
              </h1>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <span className={styles.modalBadge}>{company.industry}</span>
                <span className={styles.modalBadge}>Employees: {company.size || '50+'}</span>
                {company.verified && (
                  <span className={styles.verifiedTag}>
                    Verified Partner
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className={styles.actionBtn}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              <Globe size={15} /> Visit Website <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className={styles.modalStatsGrid}>
          <div className={styles.modalStatItem}>
            <span className={styles.modalStatNum}>{liveDrives.length}</span>
            <span className={styles.modalStatTitle}>Active Drives</span>
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

        {/* About Overview */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Building2 size={16} color="var(--color-primary)" />
            Company Overview
          </h2>
          <p className={styles.sectionDesc}>
            {company.description || `${company.name} is a verified hiring partner on the campus recruitment portal.`}
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
            <h2 className={styles.sectionTitle}>
              <Briefcase size={16} color="var(--color-primary)" />
              Campus Recruitment Drives ({company.drives.length})
            </h2>
            <Link href="/admin/drives" className={styles.clickHint}>
              Manage Drives →
            </Link>
          </div>

          {company.drives.length === 0 ? (
            <p className={styles.sectionDesc} style={{ fontStyle: 'italic' }}>
              No recruitment drives posted yet by this company.
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
                      <strong>{d.location || 'Office / Campus'}</strong>
                    </span>
                    <span className={styles.driveMetaItem}>
                      <span>Deadline:</span>
                      <strong>{formatDate(d.deadline)}</strong>
                    </span>
                  </div>

                  {d.eligibilityCriteria && (
                    <div className={styles.driveMetaRow} style={{ color: 'var(--color-text-tertiary)', fontSize: '0.6875rem' }}>
                      <span>Min CGPA: <strong>{d.eligibilityCriteria.minCGPA || 0}</strong></span>
                      <span>•</span>
                      <span>Max Backlogs: <strong>{d.eligibilityCriteria.maxBacklogs}</strong></span>
                      <span>•</span>
                      <span>Branches: <strong>{d.eligibilityCriteria.allowedBranches?.join(', ') || 'All'}</strong></span>
                    </div>
                  )}

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
          <h2 className={styles.sectionTitle}>
            <Users size={16} color="var(--color-primary)" />
            Recruiter Contacts ({company.recruiters.length})
          </h2>
          {company.recruiters.length === 0 ? (
            <p className={styles.sectionDesc} style={{ fontStyle: 'italic' }}>
              No recruiter contacts assigned to this company.
            </p>
          ) : (
            <div className={styles.recruitersList}>
              {company.recruiters.map((r) => (
                <div key={r.id} className={styles.recruiterCard}>
                  <span className={styles.recruiterName}>{r.fullName || 'Recruiter'}</span>
                  <span className={styles.recruiterRole}>{r.designation || 'Talent Acquisition'}</span>
                  <a href={`mailto:${r.user?.email}`} className={styles.recruiterEmail}>
                    <Mail size={12} /> {r.user?.email}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
