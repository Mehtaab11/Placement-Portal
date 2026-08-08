'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'tpo_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeState(saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState('system');
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      }
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const computeResolved = (t: Theme): ResolvedTheme => {
      if (t === 'system') {
        return media.matches ? 'dark' : 'light';
      }
      return t;
    };

    const resolved = computeResolved(theme);
    setResolvedTheme(resolved);

    // Add smooth transition class briefly
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    root.setAttribute('data-theme', resolved);

    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 250);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const next = e.matches ? 'dark' : 'light';
        setResolvedTheme(next);
        root.setAttribute('data-theme', next);
      }
    };

    media.addEventListener('change', handleMediaChange);
    return () => {
      clearTimeout(timer);
      media.removeEventListener('change', handleMediaChange);
    };
  }, [theme, mounted]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
