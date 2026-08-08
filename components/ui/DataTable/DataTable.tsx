'use client';

import styles from './DataTable.module.css';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectAll?: (selected: boolean) => void;
  onSelectRow?: (key: string, selected: boolean) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDir,
  onSort,
  selectable,
  selectedKeys,
  onSelectAll,
  onSelectRow,
  loading,
  emptyState,
  className,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedKeys?.size === data.length;
  const someSelected = (selectedKeys?.size ?? 0) > 0 && !allSelected;

  if (!loading && data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.tableScroll}>
        <table className={styles.table} aria-busy={loading}>
          <thead>
            <tr>
              {selectable && (
                <th className={clsx(styles.th, styles.checkboxCol)}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(styles.th, col.sortable && styles.sortable, col.align && styles[col.align])}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className={styles.thContent}>
                    {col.header}
                    {col.sortable && (
                      <span className={styles.sortIcon} aria-hidden="true">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    {selectable && (
                      <td className={styles.td}>
                        <span className={clsx(styles.skeletonCell, 'skeleton')} style={{ width: 16, height: 16 }} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={styles.td}>
                        <span className={clsx(styles.skeletonCell, 'skeleton')} style={{ width: '80%', height: 14 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row, index) => {
                  const key = keyExtractor(row);
                  const selected = selectedKeys?.has(key) ?? false;
                  return (
                    <tr
                      key={key}
                      className={clsx(styles.row, selected && styles.selectedRow)}
                    >
                      {selectable && (
                        <td className={clsx(styles.td, styles.checkboxCol)}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selected}
                            onChange={(e) => onSelectRow?.(key, e.target.checked)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={clsx(styles.td, col.align && styles[col.align])}
                        >
                          {col.render
                            ? col.render(row, index)
                            : String((row as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
