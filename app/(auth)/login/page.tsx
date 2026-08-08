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
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError('Invalid email or password. Please try again.');
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
        <p className={styles.subtitle}>Sign in to your TPO Portal account</p>
      </div>

      {serverError && (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      )}

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

      {/* Demo credentials hint */}
      <div className={styles.demoHint}>
        <p className={styles.demoTitle}>Demo credentials (after seeding)</p>
        <div className={styles.demoRows}>
          <span>Student: student@demo.com / Demo@1234</span>
          <span>Recruiter: recruiter@demo.com / Demo@1234</span>
          <span>Admin: admin@demo.com / Demo@1234</span>
        </div>
      </div>
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
