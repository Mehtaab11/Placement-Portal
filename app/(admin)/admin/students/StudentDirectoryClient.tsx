'use client';

import { useState } from 'react';
import { Search, Download, Eye, CheckCircle2, XCircle, Award } from 'lucide-react';
import styles from './students.module.css';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Button } from '@/components/ui/Button/Button';

export default function StudentDirectoryClient({ initialStudents }: { initialStudents: any[] }) {
  const [students] = useState<any[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const filtered = students.filter((s) => {
    const name = s.fullName || '';
    const email = s.user?.email || '';
    const roll = s.rollNumber || '';

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      roll.toLowerCase().includes(search.toLowerCase());

    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PLACED' && s.isPlaced) ||
      (statusFilter === 'UNPLACED' && !s.isPlaced);

    return matchesSearch && matchesBranch && matchesStatus;
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
            Filter candidate records, inspect placement histories, and export institutional cohorts.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={exportCSV} icon={<Download size={15} />}>
          Export Cohort CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Placement Statuses</option>
          <option value="PLACED">Placed Only</option>
          <option value="UNPLACED">Seeking Placement</option>
        </select>
      </div>

      {/* Student Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Placement Status</th>
                <th>Offer / Company</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.rollNumber}</strong></td>
                  <td>
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>{s.fullName || 'Student'}</span>
                      <span className={styles.studentEmail}>{s.user?.email}</span>
                    </div>
                  </td>
                  <td><span className={styles.branchTag}>{s.branch}</span></td>
                  <td><strong>{s.cgpa}</strong>/10</td>
                  <td>{s.backlogs}</td>
                  <td>
                    <span className={styles.statusPill} data-placed={s.isPlaced ? 'true' : 'false'}>
                      {s.isPlaced ? 'Placed' : 'Seeking'}
                    </span>
                  </td>
                  <td>
                    {s.isPlaced ? (
                      <span className={styles.placedMeta}>
                        {s.placedCompany} (₹{s.placedCTC} LPA)
                      </span>
                    ) : (
                      <span className={styles.unplacedMeta}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => setSelectedStudent(s)}
                    >
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Student Detail Drawer */}
      <Drawer
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.fullName || 'Student Dossier'}
        width="480px"
      >
        {selectedStudent && (
          <div className={styles.drawerBody}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerAvatar}>
                {(selectedStudent.fullName || 'S').charAt(0)}
              </div>
              <div>
                <h3 className={styles.drawerName}>{selectedStudent.fullName}</h3>
                <p className={styles.drawerEmail}>{selectedStudent.user?.email}</p>
                <span className={styles.drawerRoll}>Roll No: {selectedStudent.rollNumber}</span>
              </div>
            </div>

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
                        <strong>{app.drive.title}</strong>
                        <span className={styles.appCompany}>{app.drive.company.name}</span>
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
