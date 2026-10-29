'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Download, Eye, CheckCircle2, XCircle, Award, X, Loader2 } from 'lucide-react';
import styles from './students.module.css';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { matchesBranch } from '@/lib/branchMatcher';

function StudentDirectoryContent({ initialStudents }: { initialStudents: any[] }) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

  const [students] = useState<any[]>(initialStudents);
  const [search, setSearch] = useState(initialSearch);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null) {
      setSearch(qParam);
    }
  }, [searchParams]);

  const filtered = students.filter((s) => {
    const name = s.fullName || '';
    const email = s.user?.email || '';
    const roll = s.rollNumber || '';
    const branch = s.branch || '';
    const skills = s.skills || [];
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      roll.toLowerCase().includes(q) ||
      matchesBranch(branch, q) ||
      skills.some((sk: string) => sk.toLowerCase().includes(q));

    const matchesBranchDropdown = branchFilter === 'ALL' || matchesBranch(branch, branchFilter);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PLACED' && s.isPlaced) ||
      (statusFilter === 'UNPLACED' && !s.isPlaced);

    return matchesSearch && matchesBranchDropdown && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Roll Number', 'Name', 'Email', 'Branch', 'Batch', 'CGPA', 'Backlogs', 'Status', 'Placed Company', 'Package (LPA)'];
    const rows = filtered.map((s) => [
      s.rollNumber,
      `"${s.fullName || 'Student'}"`,
      s.user?.email,
      s.branch,
      s.batch,
      s.cgpa,
      s.backlogs,
      s.isPlaced ? 'Placed' : 'Seeking Placement',
      `"${s.placedCompany || 'N/A'}"`,
      s.placedCTC || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TPO_Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Master Student Directory</h1>
          <p className={styles.subtitle}>
            Search and filter student records, check their placement status, and export the student directory to CSV.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={exportCSV} icon={<Download size={15} />}>
          Export Cohort CSV
        </Button>
      </div>

      {/* Compact Side-by-Side Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, roll number, email, or branch (e.g. Mechanical)..."
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

        <div className={styles.filterGroup}>
          <div className={styles.selectWrapper}>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className={styles.select}
              aria-label="Filter by branch"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
              aria-label="Filter by placement status"
            >
              <option value="ALL">All Placement Statuses</option>
              <option value="PLACED">Placed Only</option>
              <option value="UNPLACED">Seeking Placement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch</th>
                <th>Batch</th>
                <th>CGPA</th>
                <th>Status</th>
                <th>Placed Offer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    {search.trim() ? (
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>No students found matching &ldquo;{search}&rdquo;</p>
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          style={{
                            marginTop: '0.5rem',
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Clear search filter
                        </button>
                      </div>
                    ) : (
                      'No students match the selected filters.'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>
                          {(s.fullName || s.user?.email || 'S').charAt(0)}
                        </div>
                        <div>
                          <strong className={styles.studentName}>{s.fullName || 'Student'}</strong>
                          <span className={styles.studentRoll}>{s.rollNumber}</span>
                          <span className={styles.studentEmail}>{s.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.branchPill}>{s.branch}</span>
                    </td>
                    <td>{s.batch || '—'}</td>
                    <td>
                      <strong className={styles.cgpaVal}>{s.cgpa}</strong>
                      <span className={styles.cgpaScale}>/10</span>
                    </td>
                    <td>
                      <span className={styles.statusBadge} data-status={s.isPlaced ? 'PLACED' : 'UNPLACED'}>
                        {s.isPlaced ? 'Placed' : 'Seeking'}
                      </span>
                    </td>
                    <td>
                      {s.isPlaced ? (
                        <div className={styles.offerDetails}>
                          <strong>{s.placedCompany}</strong>
                          <span>₹{s.placedCTC} LPA</span>
                        </div>
                      ) : (
                        <span className={styles.noOfferText}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedStudent(s)}
                        aria-label={`View dossier for ${s.fullName}`}
                      >
                        <Eye size={14} /> View Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-In Dossier Drawer */}
      <Drawer
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.fullName || 'Student Dossier'}
        width="500px"
      >
        {selectedStudent && (
          <div className={styles.drawerContent}>
            {/* Header / Avatar */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerAvatar}>
                {(selectedStudent.fullName || 'S').charAt(0)}
              </div>
              <div>
                <h3 className={styles.drawerName}>{selectedStudent.fullName}</h3>
                <p className={styles.drawerRoll}>Roll No: {selectedStudent.rollNumber}</p>
                <p className={styles.drawerEmail}>{selectedStudent.user?.email}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className={styles.drawerGrid}>
              <div className={styles.drawerStat}>
                <span>Branch</span>
                <strong>{selectedStudent.branch}</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Batch</span>
                <strong>{selectedStudent.batch}</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>CGPA</span>
                <strong>{selectedStudent.cgpa} / 10</strong>
              </div>
              <div className={styles.drawerStat}>
                <span>Active Backlogs</span>
                <strong>{selectedStudent.backlogs}</strong>
              </div>
            </div>

            {selectedStudent.isPlaced && (
              <div className={styles.placedBox}>
                <Award size={20} color="var(--color-success)" />
                <div>
                  <strong>Placed at {selectedStudent.placedCompany}</strong>
                  <p>Compensation: ₹{selectedStudent.placedCTC} LPA</p>
                </div>
              </div>
            )}

            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div>
                <span className={styles.sectionHead}>Technical Skills</span>
                <div className={styles.skillsList}>
                  {selectedStudent.skills.map((skill: string) => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.applications && selectedStudent.applications.length > 0 && (
              <div>
                <span className={styles.sectionHead}>Drive Applications ({selectedStudent.applications.length})</span>
                <div className={styles.appsList}>
                  {selectedStudent.applications.map((app: any) => (
                    <div key={app.id} className={styles.appRow}>
                      <div>
                        <strong>{app.drive?.title}</strong>
                        <span className={styles.appCompany}>{app.drive?.company?.name}</span>
                      </div>
                      <span className={styles.stagePill} data-stage={app.stage}>
                        {app.stage}
                      </span>
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

export default function StudentDirectoryClient({ initialStudents }: { initialStudents: any[] }) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        </div>
      }
    >
      <StudentDirectoryContent initialStudents={initialStudents} />
    </Suspense>
  );
}
