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
  Loader2,
  Briefcase,
  GraduationCap,
  Building2,
  Compass,
} from 'lucide-react';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { SearchResultItem } from '@/app/api/search/route';

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
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setIsSearchOpen(true);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Global keyboard shortcuts (Ctrl+K, Esc, outside click)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        if (searchValue.trim().length > 0) {
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (showHelpModal) setShowHelpModal(false);
        if (showUserMenu) setShowUserMenu(false);
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showHelpModal, showUserMenu, isSearchOpen, searchValue]);

  const handleNavigate = (url: string) => {
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
    router.push(url);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isSearchOpen && searchResults.length > 0) {
        setIsSearchOpen(true);
        return;
      }
      if (searchResults.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setHighlightedIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        handleNavigate(searchResults[highlightedIndex].url);
      } else if (searchValue.trim()) {
        const query = encodeURIComponent(searchValue.trim());
        const defaultUrl =
          user?.role === 'STUDENT'
            ? `/student/drives?search=${query}`
            : user?.role === 'RECRUITER'
            ? `/recruiter/drives?search=${query}`
            : `/admin/drives?search=${query}`;
        handleNavigate(defaultUrl);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  // Group search results by category
  const categories: { key: SearchResultItem['category']; label: string; icon: typeof Briefcase }[] = [
    { key: 'pages', label: 'Quick Navigation', icon: Compass },
    { key: 'drives', label: 'Placement Drives', icon: Briefcase },
    {
      key: 'candidates',
      label: user?.role === 'RECRUITER' ? 'Applicants & Candidates' : 'Students',
      icon: GraduationCap,
    },
    { key: 'companies', label: 'Organizations', icon: Building2 },
  ];

  return (
    <>
      <header className={styles.header}>
        {/* Global Search bar */}
        <div className={styles.searchWrapper} ref={searchWrapperRef}>
          {isSearching ? (
            <Loader2 size={15} className={`${styles.searchIcon} ${styles.searchStateSpinner}`} aria-hidden="true" />
          ) : (
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          )}

          <input
            ref={searchInputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Search students, drives, branches, companies... (Ctrl+K)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => {
              if (searchValue.trim().length > 0) setIsSearchOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            aria-label="Global search"
            id="global-search"
            autoComplete="off"
          />

          {searchValue.length > 0 && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={clearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}

          <kbd className={styles.searchKbd} aria-hidden="true">⌘K</kbd>

          {/* Search Dropdown / Palette */}
          {isSearchOpen && (
            <div className={styles.searchDropdown} role="listbox" id="global-search-results">
              {isSearching && searchResults.length === 0 ? (
                <div className={styles.searchState}>
                  <Loader2 size={18} className={styles.searchStateSpinner} />
                  <span>Searching portal records...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className={styles.searchState}>
                  <span>No results found for &ldquo;<strong>{searchValue}</strong>&rdquo;</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
                    Try searching by role, branch (e.g. Mechanical, CSE), candidate name, or drive title.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.searchResultsList}>
                    {categories.map((cat) => {
                      const groupItems = searchResults.filter((r) => r.category === cat.key);
                      if (groupItems.length === 0) return null;
                      const CatIcon = cat.icon;

                      return (
                        <div key={cat.key} className={styles.searchGroup}>
                          <div className={styles.searchGroupHeader}>
                            <CatIcon size={12} />
                            <span>{cat.label}</span>
                          </div>
                          {groupItems.map((item) => {
                            const itemIndex = searchResults.indexOf(item);
                            const isActive = itemIndex === highlightedIndex;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                className={`${styles.searchItem} ${isActive ? styles.searchItemActive : ''}`}
                                onClick={() => handleNavigate(item.url)}
                                onMouseEnter={() => setHighlightedIndex(itemIndex)}
                                role="option"
                                aria-selected={isActive}
                              >
                                <div className={styles.searchItemIcon}>
                                  <CatIcon size={14} />
                                </div>
                                <div className={styles.searchItemBody}>
                                  <span className={styles.searchItemTitle}>{item.title}</span>
                                  <span className={styles.searchItemSubtitle}>{item.subtitle}</span>
                                </div>
                                {item.badge && (
                                  <span className={styles.searchBadge} data-status={item.badge}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.searchFooter}>
                    <span>
                      Press <kbd style={{ padding: '1px 4px', fontSize: '0.625rem' }}>↵</kbd> to open
                    </span>
                    <span className={styles.searchFooterShortcut}>
                      <kbd style={{ padding: '1px 4px', fontSize: '0.625rem' }}>↑↓</kbd> navigate •{' '}
                      <kbd style={{ padding: '1px 4px', fontSize: '0.625rem' }}>Esc</kbd> close
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
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
