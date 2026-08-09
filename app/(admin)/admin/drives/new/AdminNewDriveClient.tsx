'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  GraduationCap,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import styles from './adminNewDrive.module.css';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useToast } from '@/components/ui/Toast/Toast';

interface CompanyOption {
  id: string;
  name: string;
  industry: string;
  size: string;
}

const ALL_BRANCHES = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];
const ALL_BATCHES = [2024, 2025, 2026];

export function AdminNewDriveClient({ initialCompanies }: { initialCompanies: CompanyOption[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [companyId, setCompanyId] = useState(initialCompanies[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [location, setLocation] = useState('Bangalore, India (Hybrid)');
  const [ctcMin, setCtcMin] = useState(10);
  const [ctcMax, setCtcMax] = useState(16);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Eligibility
  const [minCGPA, setMinCGPA] = useState(7.0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [branches, setBranches] = useState<string[]>(['CSE', 'IT', 'ECE']);
  const [batches, setBatches] = useState<number[]>([2024, 2025]);
  const [skillsText, setSkillsText] = useState('JavaScript, Python, React, Data Structures');

  // Rounds
  const [rounds, setRounds] = useState<string[]>([
    'Online Coding Assessment',
    'Technical Interview Round 1',
    'HR & Management Discussion',
  ]);
  const [newRoundName, setNewRoundName] = useState('');

  const toggleBranch = (b: string) => {
    if (branches.includes(b)) {
      if (branches.length > 1) setBranches(branches.filter((x) => x !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const toggleBatch = (yr: number) => {
    if (batches.includes(yr)) {
      if (batches.length > 1) setBatches(batches.filter((x) => x !== yr));
    } else {
      setBatches([...batches, yr]);
    }
  };

  const addRound = () => {
    if (newRoundName.trim()) {
      setRounds([...rounds, newRoundName.trim()]);
      setNewRoundName('');
    }
  };

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter((_, i) => i !== index));
    }
  };

  const validateStep1 = () => {
    if (!companyId) {
      addToast({ type: 'error', message: 'Please select a hiring company.' });
      return false;
    }
    if (!title.trim()) {
      addToast({ type: 'error', message: 'Please enter the job role title.' });
      return false;
    }
    if (!location.trim()) {
      addToast({ type: 'error', message: 'Please enter job location.' });
      return false;
    }
    if (!deadline) {
      addToast({ type: 'error', message: 'Please set application deadline date.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;

    try {
      setSubmitting(true);
      const parsedSkills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        companyId,
        title: title.trim(),
        description:
          description.trim() ||
          `Campus recruitment drive for the position of ${title} at ${selectedCompany?.name || 'Company'}.`,
        jobType,
        location: location.trim(),
        ctcMin: Number(ctcMin),
        ctcMax: Number(ctcMax),
        deadline,
        minCGPA: Number(minCGPA),
        maxBacklogs: Number(maxBacklogs),
        allowedBranches: branches,
        allowedBatches: batches,
        requiredSkills: parsedSkills,
        rounds: rounds.map((name) => ({ name })),
      };

      const res = await fetch('/api/admin/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', message: data.error || 'Failed to create placement drive' });
        return;
      }

      addToast({ type: 'success', message: 'Placement drive published successfully!' });
      router.push('/admin/drives');
    } catch {
      addToast({ type: 'error', message: 'Network error occurred while creating drive' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCompany = initialCompanies.find((c) => c.id === companyId);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/admin/drives" className={styles.backLink}>
              <ArrowLeft size={14} /> Back to Drives
            </Link>
          </div>
          <h1 className={styles.title}>Post a Placement Drive</h1>
          <p className={styles.subtitle}>
            Create and publish a new campus recruitment drive with eligibility criteria and interview rounds.
          </p>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className={styles.stepper}>
        <button
          type="button"
          className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ''}`}
          onClick={() => setStep(1)}
        >
          <div className={styles.stepCircle}>1</div>
          <span>Company & Job Info</span>
        </button>
        <div className={styles.stepLine} />
        <button
          type="button"
          className={`${styles.stepItem} ${step >= 2 ? styles.stepActive : ''}`}
          onClick={() => validateStep1() && setStep(2)}
        >
          <div className={styles.stepCircle}>2</div>
          <span>Eligibility Criteria</span>
        </button>
        <div className={styles.stepLine} />
        <button
          type="button"
          className={`${styles.stepItem} ${step >= 3 ? styles.stepActive : ''}`}
          onClick={() => validateStep1() && setStep(3)}
        >
          <div className={styles.stepCircle}>3</div>
          <span>Interview Rounds</span>
        </button>
      </div>

      <div className={styles.formLayout}>
        {/* Main Step Form Card */}
        <div className={styles.formCard}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                <Building2 size={20} className={styles.stepIcon} />
                Company & Job Details
              </h2>

              <div className={styles.field}>
                <label htmlFor="company-select" className={styles.label}>
                  Partner Company <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="company-select"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className={styles.selectInput}
                  >
                    {initialCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="drive-title" className={styles.label}>
                  Job Role / Title <span className={styles.required}>*</span>
                </label>
                <Input
                  id="drive-title"
                  placeholder="e.g. Graduate Software Engineer - SDE 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.field}>
                  <label htmlFor="job-type" className={styles.label}>
                    Employment Type
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="job-type"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="FULL_TIME">Full-time Employee</option>
                      <option value="INTERNSHIP">Internship + PPO</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="job-location" className={styles.label}>
                    Work Location <span className={styles.required}>*</span>
                  </label>
                  <Input
                    id="job-location"
                    placeholder="e.g. Bangalore, Hyderabad, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.field}>
                  <label htmlFor="ctc-min" className={styles.label}>
                    Min CTC (in LPA)
                  </label>
                  <Input
                    id="ctc-min"
                    type="number"
                    step="0.5"
                    value={ctcMin}
                    onChange={(e) => setCtcMin(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="ctc-max" className={styles.label}>
                    Max CTC (in LPA)
                  </label>
                  <Input
                    id="ctc-max"
                    type="number"
                    step="0.5"
                    value={ctcMax}
                    onChange={(e) => setCtcMax(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="drive-deadline" className={styles.label}>
                  Application Deadline <span className={styles.required}>*</span>
                </label>
                <Input
                  id="drive-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="drive-desc" className={styles.label}>
                  Job Description & Overview
                </label>
                <textarea
                  id="drive-desc"
                  rows={4}
                  className={styles.textarea}
                  placeholder="Provide brief role overview, expected deliverables, and team context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.stepActions}>
                <div />
                <Button
                  onClick={() => validateStep1() && setStep(2)}
                  icon={<ArrowRight size={16} />}
                >
                  Continue to Eligibility
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                <GraduationCap size={20} className={styles.stepIcon} />
                Student Eligibility Criteria
              </h2>

              <div className={styles.field}>
                <label className={styles.label}>Allowed Engineering Branches</label>
                <div className={styles.chipGroup}>
                  {ALL_BRANCHES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`${styles.chipBtn} ${branches.includes(b) ? styles.chipBtnActive : ''}`}
                      onClick={() => toggleBranch(b)}
                    >
                      {b} {branches.includes(b) && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Graduation Batches</label>
                <div className={styles.chipGroup}>
                  {ALL_BATCHES.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`${styles.chipBtn} ${batches.includes(yr) ? styles.chipBtnActive : ''}`}
                      onClick={() => toggleBatch(yr)}
                    >
                      Class of {yr} {batches.includes(yr) && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.field}>
                  <label htmlFor="min-cgpa" className={styles.label}>
                    Minimum CGPA Cutoff
                  </label>
                  <Input
                    id="min-cgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="max-backlogs" className={styles.label}>
                    Max Allowed Active Backlogs
                  </label>
                  <Input
                    id="max-backlogs"
                    type="number"
                    min="0"
                    max="10"
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="skills-text" className={styles.label}>
                  Required Skills (Comma separated)
                </label>
                <Input
                  id="skills-text"
                  placeholder="e.g. React, Node.js, SQL, Problem Solving"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                />
              </div>

              <div className={styles.stepActions}>
                <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} icon={<ArrowRight size={16} />}>
                  Continue to Interview Rounds
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                <Layers size={20} className={styles.stepIcon} />
                Interview & Selection Pipeline
              </h2>

              <p className={styles.stepHint}>
                Define the sequence of assessment rounds students will progress through.
              </p>

              <div className={styles.roundsList}>
                {rounds.map((roundName, idx) => (
                  <div key={idx} className={styles.roundItem}>
                    <div className={styles.roundNumberBadge}>{idx + 1}</div>
                    <span className={styles.roundNameText}>{roundName}</span>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        className={styles.roundDeleteBtn}
                        onClick={() => removeRound(idx)}
                        aria-label="Remove round"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.addRoundRow}>
                <Input
                  placeholder="Add another round (e.g. Group Discussion, Final HR)..."
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRound();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addRound} icon={<Plus size={16} />}>
                  Add Round
                </Button>
              </div>

              <div className={styles.stepActions}>
                <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  icon={<CheckCircle2 size={16} />}
                  id="submit-admin-drive"
                >
                  Publish Placement Drive
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Live Summary Preview Sidebar */}
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <Sparkles size={16} color="var(--color-primary)" />
            <span className={styles.previewTitle}>Drive Preview Summary</span>
          </div>

          <div className={styles.previewContent}>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Company</span>
              <span className={styles.previewVal}>{selectedCompany?.name || 'Select Company'}</span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Role Title</span>
              <span className={styles.previewVal}>{title || 'Not specified'}</span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Package (CTC)</span>
              <span className={styles.previewVal}>
                ₹{ctcMin} – ₹{ctcMax} LPA ({jobType.replace('_', ' ')})
              </span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Location</span>
              <span className={styles.previewVal}>{location || 'Not set'}</span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Eligible Branches</span>
              <span className={styles.previewVal}>{branches.join(', ')}</span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Min CGPA / Max Backlogs</span>
              <span className={styles.previewVal}>
                {minCGPA} CGPA • Max {maxBacklogs} backlogs
              </span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Application Deadline</span>
              <span className={styles.previewVal}>{deadline}</span>
            </div>

            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Total Rounds</span>
              <span className={styles.previewVal}>{rounds.length} Selection Rounds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
