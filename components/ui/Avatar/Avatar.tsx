import styles from './Avatar.module.css';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#EAB308',
  '#22C55E', '#06B6D4', '#3B82F6', '#14B8A6', '#F43F5E',
];

function getColor(name?: string): string {
  if (!name) return COLORS[0];
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name);
  const color = getColor(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={clsx(styles.avatar, styles[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(styles.avatar, styles[size], styles.initials, className)}
      style={{ background: color }}
      aria-label={name ?? 'User avatar'}
      role="img"
    >
      {initials}
    </div>
  );
}
