'use client';

import styles from './Tooltip.module.css';
import { clsx } from 'clsx';
import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={clsx(styles.tooltip, styles[position])}
          role="tooltip"
          aria-hidden={!visible}
        >
          {content}
        </span>
      )}
    </span>
  );
}
