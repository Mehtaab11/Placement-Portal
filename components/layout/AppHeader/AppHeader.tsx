'use client';

import styles from './AppHeader.module.css';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  user?: {
    name?: string | null;
    email?: string;
    role?: string;
  };
  unreadNotifications?: number;
  notificationsHref?: string;
}

export function AppHeader({
  title: _title,
  subtitle: _subtitle,
  actions: _actions,
  user,
  unreadNotifications = 0,
  notificationsHref = '#',
}: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={styles.header}>
      {/* Search bar */}
      <div className={styles.searchWrapper}>
        <Search size={15} className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          className={styles.searchInput}
          placeholder="Search students, drives, companies... (Ctrl+K)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          aria-label="Global search"
          id="global-search"
        />
        <kbd className={styles.searchKbd} aria-hidden="true">⌘K</kbd>
      </div>

      <div className={styles.right}>
        {/* Theme toggle */}
        <ThemeToggle id="header-theme-toggle" />

        {/* Notifications bell */}
        <Link
          href={notificationsHref}
          className={styles.iconBtn}
          aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
          id="notifications-bell"
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* Help */}
        <button className={styles.iconBtn} aria-label="Help" id="header-help">
          <HelpCircle size={18} />
        </button>

        {/* User avatar */}
        {user && (
          <Link
            href={`/${user.role?.toLowerCase()}/settings`}
            className={styles.userBtn}
            aria-label="Account settings"
            id="header-user"
          >
            <Avatar name={user.name ?? user.email} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}

