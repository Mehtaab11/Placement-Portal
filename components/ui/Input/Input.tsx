import styles from './Input.module.css';
import { clsx } from 'clsx';
import type { InputHTMLAttributes, ReactNode, ForwardedRef } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefixIcon, suffixIcon, required, className, id, ...props },
  ref: ForwardedRef<HTMLInputElement>,
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {prefixIcon && (
          <span className={styles.prefix} aria-hidden="true">{prefixIcon}</span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            styles.input,
            error && styles.error,
            prefixIcon && styles.hasPrefix,
            suffixIcon && styles.hasSuffix,
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {suffixIcon && (
          <span className={styles.suffix}>{suffixIcon}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
});
