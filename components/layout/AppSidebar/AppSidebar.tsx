'use client';

import styles from './AppSidebar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Building2,
  GraduationCap,
  Plus,
  FileText,
  Bell,
  BookOpen,
  Video,
  IndianRupee,
  Crown,
} from 'lucide-react';
import type { Role } from '@prisma/client';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/drives', label: 'Drives', icon: Briefcase },
    { href: '/student/applications', label: 'My Applications', icon: FileText },
    { href: '/student/profile', label: 'Profile', icon: GraduationCap },
    { href: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  RECRUITER: [
    { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/recruiter/drives', label: 'My Drives', icon: Briefcase },
    { href: '/recruiter/company', label: 'Company', icon: Building2 },
    { href: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/recruiter/notifications', label: 'Notifications', icon: Bell },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/drives', label: 'Drives', icon: Briefcase },
    { href: '/admin/students', label: 'Students', icon: GraduationCap },
    { href: '/admin/companies', label: 'Companies', icon: Building2 },
    { href: '/admin/reports', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
};

const STUDENT_SUB_ITEMS: NavItem[] = [
  { href: '/student/mock-tests', label: 'Mock Tests', icon: BookOpen },
  { href: '/student/video-interviews', label: 'Video Interviews', icon: Video },
  { href: '/student/subscription', label: 'Subscription', icon: IndianRupee },
];

const ADMIN_SUB_ITEMS: NavItem[] = [
  { href: '/admin/video-interviews', label: 'Video Interviews', icon: Video },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: IndianRupee },
];

const CTA_BY_ROLE: Record<Role, { href: string; label: string } | null> = {
  STUDENT: null,
  RECRUITER: { href: '/recruiter/drives/new', label: 'Post New Drive' },
  ADMIN: { href: '/admin/drives/new', label: 'Post New Drive' },
};

const subscriptionsEnabled = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true';

interface AppSidebarProps {
  role: Role;
  userName?: string;
  tier?: string;
}

export function AppSidebar({ role, tier }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role];
  const subNavItems = subscriptionsEnabled
    ? role === 'STUDENT'
      ? STUDENT_SUB_ITEMS
      : role === 'ADMIN'
      ? ADMIN_SUB_ITEMS
      : []
    : [];
  const cta = CTA_BY_ROLE[role];

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <Image
          src="/logo-dark.png"
          alt="TPO Logo"
          width={34}
          height={34}
          className={styles.logoImg}
          priority
        />
        <div>
          <p className={styles.logoTitle}>TPO Portal</p>
          <p className={styles.logoSub}>
            {role === 'ADMIN' ? 'Admin Portal' : role === 'RECRUITER' ? 'Recruiter Hub' : 'Student Desk'}
          </p>
        </div>
      </div>

      {/* CTA button */}
      {cta && (
        <Link href={cta.href} className={styles.ctaButton} id="sidebar-cta">
          <Plus size={16} />
          {cta.label}
        </Link>
      )}

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, active && styles.navItemActive)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {subNavItems && subNavItems.length > 0 && (
          <>
            <div className={styles.navDivider} aria-hidden />
            {subNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.navItem, active && styles.navItemActive)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={18} className={styles.navIcon} />
                  <span>{item.label}</span>
                  {item.href === '/student/subscription' && tier && tier !== 'FREE' && (
                    <span
                      className={styles.crownPill}
                      data-tier={tier}
                      title={`${tier} Active`}
                    >
                      <Crown size={13} className={styles.crownSvg} />
                    </span>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
