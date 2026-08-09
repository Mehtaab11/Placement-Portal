'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './login.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '';
  const roleParam = searchParams.get('role');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const DEMO_ACCOUNTS = [
    { role: 'Student', email: 'student@demo.com', pass: 'Demo@1234', badge: '🎓 Student' },
    { role: 'Recruiter', email: 'recruiter@demo.com', pass: 'Demo@1234', badge: '💼 Recruiter' },
    { role: 'Admin', email: 'admin@demo.com', pass: 'Demo@1234', badge: '🛡️ Admin' },
  ];

  const handleFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError('');
  };

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError('Invalid email or password. Please try again or use a 1-click demo button below.');
      return;
    }

    // Fetch session to get role for redirect
    const res = await fetch('/api/auth/session');
    const session = await res.json() as { user?: { role?: string } };
    const role: string = session?.user?.role ?? 'STUDENT';

    const roleHome: Record<string, string> = {
      STUDENT: '/student/dashboard',
      RECRUITER: '/recruiter/dashboard',
      ADMIN: '/admin/dashboard',
    };

    const destination = callbackUrl || roleHome[role] || '/';
    router.push(destination);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Enter your login details to access your portal account</p>
      </div>

      {serverError && (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      )}

      {/* 1-Click Quick Demo Login Pill Buttons */}
      <div className={styles.quickFillContainer}>
        <span className={styles.quickFillTitle}>1-Click Demo Fill:</span>
        <div className={styles.quickFillButtons}>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              className={styles.quickFillBtn}
              onClick={() => handleFill(acc.email, acc.pass)}
            >
              {acc.badge}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@college.edu"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
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

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          icon={<LogIn size={18} />}
          id="login-submit"
        >
          Sign in
        </Button>
      </form>

      <div className={styles.divider}>
        <span>New to TPO Portal?</span>
      </div>

      <Link href="/register" className={styles.registerLink}>
        Create an account
      </Link>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: 'var(--color-text-tertiary)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    </div>
  );
}

// Wrapping in Suspense is required by Next.js 15 when useSearchParams() is used
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
