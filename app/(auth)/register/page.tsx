'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, UserPlus, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './register.module.css';
import { clsx } from 'clsx';

const ROLES = [
  {
    id: 'STUDENT' as const,
    label: 'Student',
    icon: GraduationCap,
    description: 'Browse and apply to placement drives',
  },
  {
    id: 'RECRUITER' as const,
    label: 'Recruiter',
    icon: Briefcase,
    description: 'Post drives and hire campus talent',
  },
  {
    id: 'ADMIN' as const,
    label: 'TPO Admin',
    icon: ShieldCheck,
    description: 'Manage the placement ecosystem',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json() as { error?: string };
      setServerError(body.error ?? 'Registration failed. Please try again.');
      return;
    }

    // Auto sign-in after registration
    const signInResult = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push('/login?registered=true');
      return;
    }

    const roleHome: Record<string, string> = {
      STUDENT: '/student/dashboard',
      RECRUITER: '/recruiter/dashboard',
      ADMIN: '/admin/dashboard',
    };
    router.push(roleHome[data.role] ?? '/');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join the TPO Portal today</p>
      </div>

      {/* Role selector */}
      <div className={styles.roleSection}>
        <p className={styles.roleLabel}>I am a…</p>
        <div className={styles.roleGrid}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                className={clsx(styles.roleCard, selectedRole === r.id && styles.roleCardActive)}
                onClick={() => setValue('role', r.id)}
                aria-pressed={selectedRole === r.id}
                id={`role-${r.id.toLowerCase()}`}
              >
                <Icon size={20} />
                <span className={styles.roleCardLabel}>{r.label}</span>
                <span className={styles.roleCardDesc}>{r.description}</span>
              </button>
            );
          })}
        </div>
        {errors.role && (
          <p className={styles.roleError} role="alert">{errors.role.message}</p>
        )}
      </div>

      {serverError && (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <Input
          id="register-email"
          label="Email address"
          type="email"
          placeholder="you@college.edu"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="register-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          hint="At least 8 characters with one uppercase letter and one number"
          suffixIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('password')}
        />

        <Input
          id="register-confirm-password"
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          suffixIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className={styles.eyeBtn}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          icon={<UserPlus size={18} />}
          id="register-submit"
        >
          Create account
        </Button>
      </form>

      <p className={styles.loginPrompt}>
        Already have an account?{' '}
        <Link href="/login" className={styles.loginLink}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
