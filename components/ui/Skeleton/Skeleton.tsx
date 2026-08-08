import styles from './Skeleton.module.css';
import { clsx } from 'clsx';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
  count?: number;
}

export function Skeleton({
  width,
  height,
  variant = 'rect',
  className,
  count = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (count > 1) {
    return (
      <div className={styles.group}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={clsx(styles.skeleton, styles[variant], className)}
            style={style}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={clsx(styles.skeleton, styles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

// Preset skeleton layouts
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton height={20} width="60%" variant="text" />
      <Skeleton height={14} count={3} />
      <div className={styles.row}>
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={100} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeader}>
        {[25, 20, 20, 15, 20].map((w, i) => (
          <Skeleton key={i} height={14} width={`${w}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          {[25, 20, 20, 15, 20].map((w, j) => (
            <Skeleton key={j} height={14} width={`${w}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className={styles.statCard}>
      <Skeleton height={16} width="50%" />
      <Skeleton height={36} width="70%" />
    </div>
  );
}
