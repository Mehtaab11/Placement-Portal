'use client';

import styles from './AppSidebar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  GraduationCap,
  Plus,
  FileText,
  Bell,
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

const CTA_BY_ROLE: Record<Role, { href: string; label: string } | null> = {
  STUDENT: null,
  RECRUITER: { href: '/recruiter/drives/new', label: 'Post New Drive' },
  ADMIN: { href: '/admin/drives/new', label: 'Post New Drive' },
};

interface AppSidebarProps {
  role: Role;
  userName?: string;
}

export function AppSidebar({ role, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role];
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
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={styles.bottom}>
        <Link
          href={`/${role.toLowerCase()}/settings`}
          className={clsx(styles.navItem, pathname.includes('/settings') && styles.navItemActive)}
        >
          <Settings size={18} />
          Settings
        </Link>
        <button
          className={clsx(styles.navItem, styles.logoutBtn)}
          onClick={() => signOut({ callbackUrl: '/login' })}
          id="sidebar-logout"
        >
          <LogOut size={18} />
          Sign out
        </button>
        {userName && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userText}>
              <p className={styles.userName}>{userName}</p>
              <p className={styles.userRole}>{role.charAt(0) + role.slice(1).toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
