'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  addToast: (options: { type?: ToastType; title?: string; message: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[item.type];

  const handleRemove = useCallback(() => {
    setExiting(true);
    setTimeout(onRemove, 250);
  }, [onRemove]);

  useEffect(() => {
    const timer = setTimeout(handleRemove, item.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [handleRemove, item.duration]);

  return (
    <div
      className={clsx(styles.toast, styles[item.type], exiting && styles.exiting)}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        <Icon size={16} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{item.title}</p>
        {item.message && <p className={styles.message}>{item.message}</p>}
      </div>
      <button
        className={styles.close}
        onClick={handleRemove}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    addToast: ({ type = 'info', title = '', message }) =>
      addToast({ type, title: title || message, message: title ? message : undefined }),
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className={styles.container} aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Standalone export for convenience
export function Toast({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  return <ToastItem item={item} onRemove={onRemove} />;
}
