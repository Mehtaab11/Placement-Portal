'use client';

import styles from './Tabs.module.css';
import { clsx } from 'clsx';
import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: ReactNode;
  variant?: 'line' | 'pill';
}

export function Tabs({ tabs, defaultTab, activeTab: controlledTab, onTabChange, children, variant = 'line' }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id);
  const active = controlledTab ?? internalTab;

  const handleClick = (id: string) => {
    setInternalTab(id);
    onTabChange?.(id);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(styles.tabList, styles[variant])}
        role="tablist"
        aria-label="Tab navigation"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
            className={clsx(
              styles.tab,
              active === tab.id && styles.active,
              tab.disabled && styles.disabled,
            )}
            onClick={() => !tab.disabled && handleClick(tab.id)}
            tabIndex={active === tab.id ? 0 : -1}
          >
            {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={styles.badge}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className={styles.panel}
      >
        {children}
      </div>
    </div>
  );
}
