'use client';

import styles from './AppHeader.module.css';
import {
  Search,
  Bell,
  HelpCircle,
  X,
  BookOpen,
  Keyboard,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Escape') {
        if (showHelpModal) setShowHelpModal(false);
        if (showUserMenu) setShowUserMenu(false);
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showHelpModal, showUserMenu]);

  return (
    <>
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

          {/* Help button - opens modal */}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Help and quick guide"
            id="header-help"
            onClick={() => setShowHelpModal(true)}
            title="Help & Support"
          >
            <HelpCircle size={18} />
          </button>

          {/* User profile dropdown menu */}
          {user && (
            <div className={styles.userMenuWrapper} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userMenuTrigger}
                onClick={() => setShowUserMenu((prev) => !prev)}
                data-open={showUserMenu}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                id="header-user-menu-btn"
              >
                <Avatar name={user.name ?? user.email} size="sm" />
                <span className={styles.userNameLabel}>
                  {user.name || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} className={styles.chevronIcon} />
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    <Avatar name={user.name ?? user.email} size="sm" />
                    <div className={styles.dropdownUserText}>
                      <span className={styles.dropdownUserName}>{user.name || 'User'}</span>
                      <span className={styles.dropdownUserEmail}>{user.email}</span>
                      <span className={styles.dropdownRoleBadge}>{user.role || 'STUDENT'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/${user.role?.toLowerCase()}/profile`}
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={15} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href={`/${user.role?.toLowerCase()}/settings`}
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutDropdownItem}`}
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Quick Help & Support Modal */}
      {showHelpModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowHelpModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <HelpCircle size={20} className={styles.modalHeaderIcon} />
                <h2 id="help-modal-title" className={styles.modalTitle}>
                  Portal Help & Quick Guide
                </h2>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowHelpModal(false)}
                aria-label="Close help modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Quick Guide */}
              <div className={styles.helpSection}>
                <div className={styles.helpSectionHeader}>
                  <BookOpen size={16} color="var(--color-primary)" />
                  <h3>Role Guidance & Tips</h3>
                </div>
                <div className={styles.helpCards}>
                  <div className={styles.helpCard}>
                    <div className={styles.helpCardHead}>
                      <span className={styles.helpRoleBadge}>🎓 Student</span>
                    </div>
                    <p className={styles.helpCardText}>
                      Browse active placement drives, check CGPA eligibility, apply with your verified resume, and track interview calls.
                    </p>
                  </div>

                  <div className={styles.helpCard}>
                    <div className={styles.helpCardHead}>
                      <span className={styles.helpRoleBadge}>💼 Recruiter</span>
                    </div>
                    <p className={styles.helpCardText}>
                      Publish hiring drives, filter eligible candidate cohorts by branch, schedule assessment rounds, and release offers.
                    </p>
                  </div>

                  <div className={styles.helpCard}>
                    <div className={styles.helpCardHead}>
                      <span className={styles.helpRoleBadge}>🛡️ TPO Admin</span>
                    </div>
                    <p className={styles.helpCardText}>
                      Post and manage campus drives, verify partner companies, inspect candidate records, and export directory reports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className={styles.helpSection}>
                <div className={styles.helpSectionHeader}>
                  <Keyboard size={16} color="var(--color-primary)" />
                  <h3>Keyboard Shortcuts</h3>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Global Search</span>
                  <div className={styles.shortcutKey}><kbd>Ctrl</kbd> + <kbd>K</kbd></div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Close Popups & Drawers</span>
                  <div className={styles.shortcutKey}><kbd>Esc</kbd></div>
                </div>
              </div>

              {/* Support Contact */}
              <div className={styles.helpSection}>
                <div className={styles.helpSectionHeader}>
                  <Phone size={16} color="var(--color-primary)" />
                  <h3>TPO Office Contact Desk</h3>
                </div>
                <div className={styles.contactDetails}>
                  <div className={styles.contactItem}>
                    <Mail size={14} />
                    <span>Email: <strong>tpo@college.edu</strong></span>
                  </div>
                  <div className={styles.contactItem}>
                    <Phone size={14} />
                    <span>Helpline: <strong>+91 (080) 2456-7890</strong></span>
                  </div>
                  <div className={styles.contactItem}>
                    <MapPin size={14} />
                    <span>Office: <strong>Room 204, Administrative Block (Mon–Sat 9AM–5PM)</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalDismissBtn}
                onClick={() => setShowHelpModal(false)}
              >
                <CheckCircle2 size={16} /> Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

