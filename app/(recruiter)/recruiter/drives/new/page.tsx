'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Briefcase, IndianRupee, Layers, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './newDrive.module.css';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useToast } from '@/components/ui/Toast/Toast';

export default function NewDrivePage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [branches, setBranches] = useState<string[]>(['CSE', 'IT', 'ECE']);
  const [rounds, setRounds] = useState<string[]>([
    'Online Assessment',
    'Technical Round 1',
    'HR Interview',
  ]);
  const [newRound, setNewRound] = useState('');

  const router = useRouter();
  const { addToast } = useToast();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      jobType: 'FULL_TIME',
      location: 'Bangalore, India',
      ctcMin: 10,
      ctcMax: 16,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minCGPA: 7.0,
      maxBacklogs: 0,
    },
  });

  const toggleBranch = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter((x) => x !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const addRound = () => {
    if (newRound.trim()) {
      setRounds([...rounds, newRound.trim()]);
      setNewRound('');
    }
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/recruiter/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          allowedBranches: branches,
          rounds: rounds.map((name) => ({ name })),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', message: result.error || 'Failed to create drive' });
        return;
      }

      addToast({ type: 'success', message: 'Placement drive published successfully!' });
      router.push('/recruiter/drives');
    } catch {
      addToast({ type: 'error', message: 'Network error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Post a Placement Drive</h1>
        <p className={styles.subtitle}>
          Create and publish on-campus hiring drives with custom eligibility criteria and interview rounds.
        </p>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ''}`}>
          <div className={styles.stepCircle}>1</div>
          <span>Job & Compensation</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.stepItem} ${step >= 2 ? styles.stepActive : ''}`}>
          <div className={styles.stepCircle}>2</div>
          <span>Eligibility Criteria</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.stepItem} ${step >= 3 ? styles.stepActive : ''}`}>
          <div className={styles.stepCircle}>3</div>
          <span>Hiring Rounds</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
        {/* Step 1: Job Details */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Step 1: Role Overview & Compensation</h2>

            <div className={styles.formGrid}>
              <Input
                label="Job Title"
                placeholder="e.g. Associate Software Engineer - SDE 1"
                required
                {...register('title')}
              />

              <div>
                <label className={styles.fieldLabel}>Job Type</label>
                <select className={styles.select} {...register('jobType')}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <Input
                label="Job Location"
                placeholder="e.g. Bangalore, India / Remote"
                required
                {...register('location')}
              />

              <Input
                label="Application Deadline"
                type="date"
                required
                {...register('deadline')}
              />

              <Input
                label="Minimum CTC (LPA)"
                type="number"
                step="0.5"
                required
                {...register('ctcMin')}
              />

              <Input
                label="Maximum CTC (LPA)"
                type="number"
                step="0.5"
                required
                {...register('ctcMax')}
              />
            </div>

            <div className={styles.fullWidth}>
              <label className={styles.fieldLabel}>Role Description & Requirements</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Detail the technical responsibilities, tools, and campus expectations..."
                required
                {...register('description')}
              />
            </div>

            <div className={styles.footer}>
              <div />
              <Button type="button" size="md" onClick={() => setStep(2)} icon={<ArrowRight size={15} />}>
                Next: Eligibility Criteria
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Eligibility */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Step 2: Eligibility Rules</h2>

            <div className={styles.formGrid}>
              <Input
                label="Minimum CGPA Requirement"
                type="number"
                step="0.1"
                required
                {...register('minCGPA')}
              />

              <Input
                label="Maximum Allowed Active Backlogs"
                type="number"
                required
                {...register('maxBacklogs')}
              />
            </div>

            <div className={styles.fullWidth}>
              <label className={styles.fieldLabel}>Allowed Engineering Branches</label>
              <div className={styles.branchTags}>
                {['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`${styles.branchPill} ${branches.includes(b) ? styles.branchPillActive : ''}`}
                    onClick={() => toggleBranch(b)}
                  >
                    {branches.includes(b) && <CheckCircle2 size={12} />} {b}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <Button type="button" variant="outline" size="md" onClick={() => setStep(1)} icon={<ArrowLeft size={15} />}>
                Back
              </Button>
              <Button type="button" size="md" onClick={() => setStep(3)} icon={<ArrowRight size={15} />}>
                Next: Hiring Rounds
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Hiring Rounds */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Step 3: Define Interview & Selection Rounds</h2>

            <div className={styles.roundInputRow}>
              <input
                type="text"
                placeholder="Add custom round (e.g. Coding Challenge, System Design)..."
                value={newRound}
                onChange={(e) => setNewRound(e.target.value)}
                className={styles.roundInput}
              />
              <Button type="button" size="sm" onClick={addRound}>
                Add Round
              </Button>
            </div>

            <div className={styles.roundsList}>
              {rounds.map((r, idx) => (
                <div key={idx} className={styles.roundItem}>
                  <span className={styles.roundNum}>{idx + 1}</span>
                  <span className={styles.roundName}>{r}</span>
                  <button
                    type="button"
                    onClick={() => removeRound(idx)}
                    className={styles.deleteRound}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <Button type="button" variant="outline" size="md" onClick={() => setStep(2)} icon={<ArrowLeft size={15} />}>
                Back
              </Button>
              <Button type="submit" size="md" loading={submitting} icon={<CheckCircle2 size={16} />}>
                Publish Placement Drive
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
