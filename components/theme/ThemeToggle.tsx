'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
  id?: string;
}

export function ThemeToggle({ className, id = 'theme-toggle-btn' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      id={id}
      className={`${styles.toggleBtn} ${className ?? ''}`}
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={styles.iconWrapper} key={isDark ? 'dark' : 'light'}>
        {isDark ? (
          <Sun size={17} className={styles.sunIcon} />
        ) : (
          <Moon size={17} className={styles.moonIcon} />
        )}
      </div>
    </button>
  );
}
