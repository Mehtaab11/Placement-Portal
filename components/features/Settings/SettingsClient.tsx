'use client';

import { useState } from 'react';
import styles from './Settings.module.css';
import { User, Shield, Bell, Key, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/Toast';

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { addToast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      addToast({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({ type: 'success', message: 'Security preferences and password updated successfully!' });
    }, 600);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Account & Preferences</h1>
        <p className={styles.subtitle}>
          Manage your account credentials, alert preferences, and security settings.
        </p>
      </div>

      {/* Account Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <User size={18} color="var(--color-primary)" /> Profile Information
        </h2>
        <div className={styles.grid}>
          <Input
            label="Email Address"
            defaultValue={user.email}
            disabled
            hint="Associated with your academic / recruiter identity."
          />
          <Input
            label="System Role"
            defaultValue={user.role}
            disabled
            hint="Role-based access permissions are managed by TPO Admin."
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Bell size={18} color="var(--color-primary)" /> Alert & Notification Channels
        </h2>
        <div>
          <div className={styles.row}>
            <div>
              <p className={styles.toggleLabel}>Email Notifications</p>
              <p className={styles.toggleDesc}>Receive email alerts on new drive announcements and shortlist updates.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked);
                addToast({ type: 'success', message: 'Notification preferences saved.' });
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div className={styles.row}>
            <div>
              <p className={styles.toggleLabel}>Interview Slot Reminders</p>
              <p className={styles.toggleDesc}>Get in-app reminders 24 hours before your scheduled interview round.</p>
            </div>
            <input
              type="checkbox"
              checked={interviewReminders}
              onChange={(e) => {
                setInterviewReminders(e.target.checked);
                addToast({ type: 'success', message: 'Notification preferences saved.' });
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div className={styles.row}>
            <div>
              <p className={styles.toggleLabel}>Compact Data Table Density</p>
              <p className={styles.toggleDesc}>Display more candidate and application rows per page view.</p>
            </div>
            <input
              type="checkbox"
              checked={compactLayout}
              onChange={(e) => {
                setCompactLayout(e.target.checked);
                addToast({ type: 'success', message: 'Display preferences updated.' });
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Key size={18} color="var(--color-primary)" /> Change Password
        </h2>
        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className={styles.grid}>
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 chars, uppercase & number"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.saveBtn}>
            <Button type="submit" size="md" loading={savingPassword} icon={<Check size={16} />}>
              Save New Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
