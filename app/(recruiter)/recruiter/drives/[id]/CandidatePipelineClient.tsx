'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserCheck, Calendar, CheckCircle2, XCircle, ArrowLeft, Eye, Award } from 'lucide-react';
import styles from './pipeline.module.css';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/Toast';
import { formatDate } from '@/lib/utils';

export default function CandidatePipelineClient({ drive }: { drive: any }) {
  const [applications, setApplications] = useState<any[]>(drive.applications || []);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');

  const { addToast } = useToast();

  const handleUpdateStage = async (appId: string, newStage: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/recruiter/applications/${appId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          notes: updateNotes,
          interviewTime: newStage === 'INTERVIEW' && interviewDate ? interviewDate : undefined,
        }),
      });

      if (!res.ok) {
        addToast({ type: 'error', message: 'Failed to update candidate stage' });
        return;
      }

      addToast({ type: 'success', message: `Candidate stage updated to ${newStage}!` });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, stage: newStage });
      }
    } catch {
      addToast({ type: 'error', message: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter((a) => {
    const name = a.student.fullName || '';
    const email = a.student.user?.email || '';
    const branch = a.student.branch || '';

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      branch.toLowerCase().includes(search.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || a.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className={styles.container}>
      {/* Back to Drives link */}
      <Link href="/recruiter/drives" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to all placement drives
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{drive.title} — Candidate Pipeline</h1>
          <p className={styles.subtitle}>
            {applications.length} total applicants • CTC: ₹{drive.ctcMin}–{drive.ctcMax} LPA • {drive.location}
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search candidate name, email, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Stages ({applications.length})</option>
          <option value="APPLIED">Applied ({applications.filter((a) => a.stage === 'APPLIED').length})</option>
          <option value="SHORTLISTED">Shortlisted ({applications.filter((a) => a.stage === 'SHORTLISTED').length})</option>
          <option value="INTERVIEW">Interview ({applications.filter((a) => a.stage === 'INTERVIEW').length})</option>
          <option value="OFFERED">Offered ({applications.filter((a) => a.stage === 'OFFERED').length})</option>
          <option value="REJECTED">Rejected ({applications.filter((a) => a.stage === 'REJECTED').length})</option>
        </select>
      </div>

      {/* Candidate Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Stage</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className={styles.candidateCell}>
                      <div className={styles.avatar}>
                        {(app.student.fullName || 'S').charAt(0)}
                      </div>
                      <div>
                        <strong className={styles.candidateName}>{app.student.fullName || 'Student'}</strong>
                        <span className={styles.candidateEmail}>{app.student.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.branchTag}>{app.student.branch}</span></td>
                  <td><strong>{app.student.cgpa}</strong>/10</td>
                  <td>{app.student.backlogs}</td>
                  <td>
                    <span className={styles.stageBadge} data-stage={app.stage}>
                      {app.stage}
                    </span>
                  </td>
                  <td>{formatDate(app.appliedAt)}</td>
                  <td>
                    <button
                      className={styles.reviewBtn}
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye size={14} /> Review Candidate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Review Drawer */}
      <Drawer
        open={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.student?.fullName || 'Candidate Profile'}
        width="520px"
      >
        {selectedApp && (
          <div className={styles.drawerBody}>
            {/* Header info */}
            <div className={styles.drawerTop}>
              <div className={styles.drawerAvatar}>
                {(selectedApp.student.fullName || 'S').charAt(0)}
              </div>
              <div>
                <h3 className={styles.drawerName}>{selectedApp.student.fullName}</h3>
                <p className={styles.drawerEmail}>{selectedApp.student.user?.email}</p>
                <p className={styles.drawerPhone}>{selectedApp.student.phone}</p>
              </div>
            </div>

            {/* Academic stats */}
            <div className={styles.drawerGrid}>
              <div className={styles.drawerStat}>
                <span>Branch</span>
                <strong>{selectedApp.student.branch}</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>CGPA</span>
                <strong>{selectedApp.student.cgpa} / 10</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Batch</span>
                <strong>{selectedApp.student.batch}</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Backlogs</span>
                <strong>{selectedApp.student.backlogs}</strong>
              </div>
            </div>

            {/* Skills */}
            {selectedApp.student.skills && selectedApp.student.skills.length > 0 && (
              <div>
                <span className={styles.sectionHead}>Verified Skills</span>
                <div className={styles.skillsRow}>
                  {selectedApp.student.skills.map((s: string) => (
                    <span key={s} className={styles.skillPill}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Stage Actions */}
            <div className={styles.stageActionsCard}>
              <span className={styles.sectionHead}>Update Recruitment Stage</span>
              <p className={styles.stageSub}>
                Current status: <strong style={{ color: 'var(--color-primary)' }}>{selectedApp.stage}</strong>
              </p>

              <div className={styles.stageButtons}>
                <Button
                  size="sm"
                  variant={selectedApp.stage === 'SHORTLISTED' ? 'primary' : 'outline'}
                  loading={updating}
                  onClick={() => handleUpdateStage(selectedApp.id, 'SHORTLISTED')}
                  icon={<UserCheck size={14} />}
                >
                  Shortlist
                </Button>

                <Button
                  size="sm"
                  variant={selectedApp.stage === 'INTERVIEW' ? 'primary' : 'outline'}
                  loading={updating}
                  onClick={() => handleUpdateStage(selectedApp.id, 'INTERVIEW')}
                  icon={<Calendar size={14} />}
                >
                  Interview
                </Button>

                <Button
                  size="sm"
                  variant={selectedApp.stage === 'OFFERED' ? 'primary' : 'outline'}
                  loading={updating}
                  onClick={() => handleUpdateStage(selectedApp.id, 'OFFERED')}
                  icon={<Award size={14} />}
                >
                  Make Offer
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  loading={updating}
                  onClick={() => handleUpdateStage(selectedApp.id, 'REJECTED')}
                  icon={<XCircle size={14} />}
                >
                  Reject
                </Button>
              </div>

              {/* Schedule interview slot */}
              <div className={styles.interviewInput}>
                <label className={styles.fieldLabel}>Set Interview Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
