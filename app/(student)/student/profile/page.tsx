'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, CheckCircle2, Award, Sparkles, FileText, Plus, Trash2, Save } from 'lucide-react';
import styles from './studentProfile.module.css';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useToast } from '@/components/ui/Toast/Toast';

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'ACADEMIC' | 'SKILLS' | 'RESUME'>('PERSONAL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [atsData, setAtsData] = useState<{
    score: number;
    matched: string[];
    suggested: string[];
    resumeUrl: string | null;
  } | null>(null);

  const { addToast } = useToast();

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/student/profile');
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setValue('fullName', p.fullName || '');
          setValue('phone', p.phone || '');
          setValue('dateOfBirth', p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '');
          setValue('gender', p.gender || '');
          setValue('address', p.address || '');
          setValue('linkedinUrl', p.linkedinUrl || '');
          setValue('githubUrl', p.githubUrl || '');
          setValue('branch', p.branch || 'CSE');
          setValue('batch', p.batch || 2025);
          setValue('cgpa', p.cgpa || 0);
          setValue('backlogs', p.backlogs || 0);
          setValue('rollNumber', p.rollNumber || '');
          if (Array.isArray(p.skills)) setSkillsList(p.skills);
          if (p.resumeUrl) {
            setAtsData({
              score: 85,
              matched: p.skills || ['JavaScript', 'React', 'SQL'],
              suggested: ['Docker', 'AWS', 'Next.js'],
              resumeUrl: p.resumeUrl,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const onSaveProfile = async (formData: any) => {
    try {
      setSaving(true);
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, skills: skillsList }),
      });
      if (res.ok) {
        addToast({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        addToast({ type: 'error', message: 'Failed to update profile' });
      }
    } catch {
      addToast({ type: 'error', message: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter((s) => s !== skill));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const form = new FormData();
      form.append('resume', file);
      form.append('skills', skillsList.join(', '));

      const res = await fetch('/api/student/resume', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        setAtsData({
          score: data.atsScore,
          matched: data.matchedKeywords,
          suggested: data.suggestedKeywords,
          resumeUrl: data.resumeUrl,
        });
        addToast({ type: 'success', message: 'Resume uploaded and analyzed by ATS!' });
      } else {
        addToast({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch {
      addToast({ type: 'error', message: 'Upload error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading student profile...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Profile & Placement Resume</h1>
          <p className={styles.subtitle}>
            Your profile details and verified academic stats determine your drive eligibility.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'PERSONAL' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('PERSONAL')}
        >
          Personal Info
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'ACADEMIC' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ACADEMIC')}
        >
          Academic Records
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'SKILLS' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('SKILLS')}
        >
          Skills & Tech Stack
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'RESUME' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('RESUME')}
        >
          ATS Resume & Matcher
        </button>
      </div>

      <form onSubmit={handleSubmit(onSaveProfile)} className={styles.formCard}>
        {/* Tab 1: Personal Info */}
        {activeTab === 'PERSONAL' && (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <Input label="Full Name" {...register('fullName')} />
              <Input label="Phone Number" {...register('phone')} />
              <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
              <Input label="Gender" {...register('gender')} placeholder="Male / Female / Other" />
              <Input label="LinkedIn URL" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
              <Input label="GitHub URL" {...register('githubUrl')} placeholder="https://github.com/..." />
            </div>
            <div className={styles.fullWidth}>
              <label className={styles.fieldLabel}>Residential Address</label>
              <textarea
                className={styles.textarea}
                rows={3}
                {...register('address')}
                placeholder="Enter current address..."
              />
            </div>
          </div>
        )}

        {/* Tab 2: Academic Info */}
        {activeTab === 'ACADEMIC' && (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.fieldLabel}>Branch / Department</label>
                <select className={styles.select} {...register('branch')}>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <Input label="Graduation Batch" type="number" {...register('batch')} />
              <Input label="Cumulative CGPA (out of 10)" type="number" step="0.01" {...register('cgpa')} />
              <Input label="Active Backlogs" type="number" {...register('backlogs')} />
              <Input label="College Roll Number" {...register('rollNumber')} />
            </div>
          </div>
        )}

        {/* Tab 3: Skills */}
        {activeTab === 'SKILLS' && (
          <div className={styles.tabContent}>
            <div className={styles.skillsInputRow}>
              <input
                type="text"
                placeholder="Type a skill (e.g. React, Python, Docker)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className={styles.skillInput}
              />
              <Button type="button" size="sm" onClick={handleAddSkill} icon={<Plus size={14} />}>
                Add Skill
              </Button>
            </div>

            <div className={styles.tagsCloud}>
              {skillsList.map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className={styles.removeTagBtn}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ATS Resume */}
        {activeTab === 'RESUME' && (
          <div className={styles.tabContent}>
            <div className={styles.uploadBox}>
              <UploadCloud size={40} color="var(--color-primary)" />
              <h3 className={styles.uploadTitle}>Upload your PDF Resume</h3>
              <p className={styles.uploadSub}>We analyze your resume against placement drive keywords in real-time.</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                id="resume-file-input"
                className={styles.fileInput}
              />
              <label htmlFor="resume-file-input" className={styles.uploadBtn}>
                {uploading ? 'Analyzing Resume...' : 'Choose Resume File'}
              </label>
            </div>

            {atsData && (
              <div className={styles.atsCard}>
                <div className={styles.atsHeader}>
                  <div className={styles.scoreCircle}>
                    <span className={styles.scoreVal}>{atsData.score}</span>
                    <span className={styles.scoreMax}>/100</span>
                  </div>
                  <div>
                    <h3 className={styles.atsTitle}>ATS Keyword Match Score</h3>
                    <p className={styles.atsSub}>Your resume matches standard requirements for SDE and Analytics roles.</p>
                  </div>
                </div>

                <div className={styles.atsSections}>
                  <div>
                    <span className={styles.atsSectionHead}>Matched Keywords:</span>
                    <div className={styles.pillRow}>
                      {atsData.matched.map((kw) => (
                        <span key={kw} className={styles.matchPill}>
                          <CheckCircle2 size={12} /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={styles.atsSectionHead}>Suggested Keywords to Add:</span>
                    <div className={styles.pillRow}>
                      {atsData.suggested.map((kw) => (
                        <span key={kw} className={styles.suggestPill}>
                          <Sparkles size={12} /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.formFooter}>
          <Button type="submit" size="md" loading={saving} icon={<Save size={16} />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
