import { t, useLocale } from '../lib/i18n';
import { BrandLogo } from './BrandLogo';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, ArrowRight, Building2, LoaderCircle, X } from 'lucide-react';
import { errorDescription } from '../lib/error-messages';
import { humanize } from '../lib/format';
export const cn = (...values: ClassValue[]) => twMerge(clsx(values));
const buttonStyles = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    },
    size: { normal: '', small: 'btn-small', icon: 'btn-icon' },
  },
  defaultVariants: { variant: 'primary', size: 'normal' },
});
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonStyles> & { asChild?: boolean; busy?: boolean }
>(function Button({ className, variant, size, asChild, busy, children, disabled, ...props }, ref) {
  useLocale();
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || busy}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {busy && <LoaderCircle size={16} className="spin" />}
          {children}
        </>
      )}
    </Component>
  );
});
export function Badge({ value }: { value: unknown }) {
  useLocale();
  const status = String(value ?? 'Unknown');
  const tone =
    /AVAILABLE|CLEARED|CONFIRMED|COMPLETED|PAID|APPROVED|ACTIVE|RESOLVED|SOLD|^true$/i.test(status)
      ? 'success'
      : /REJECTED|BOUNCED|CANCELLED|REVERSED|BLOCKED|LOST|^false$/i.test(status)
        ? 'danger'
        : /PENDING|RESERVED|DRAFT|OVERDUE|NEGOTIATION/i.test(status)
          ? 'warning'
          : 'info';
  return (
    <span className={`badge badge-${tone}`}>
      <span className="status-dot" />
      {humanize(status)}
    </span>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  useLocale();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn('modal', wide && 'modal-wide', className)}
          {...(description ? {} : { 'aria-describedby': undefined })}
          onEscapeKeyDown={(event) => {
            // The combobox handles Escape first, leaving the enclosing form open.
            if (event.target instanceof Element && event.target.closest('.select-popover'))
              event.preventDefault();
          }}
        >
          <header className="modal-header">
            <div>
              <Dialog.Title>{t(title)}</Dialog.Title>
              {description && <Dialog.Description>{t(description)}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={t('Close dialog')}>
                <X size={19} />
              </Button>
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function EmptyState({
  title = 'A fresh start',
  description = 'Records will appear here as your team starts working.',
  action,
  compact,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  useLocale();
  return (
    <div className={cn('empty-state', compact && 'empty-compact')}>
      <div className="empty-icon">
        <Building2 size={24} />
      </div>
      <h3>{t(title)}</h3>
      <p>{t(description)}</p>
      {action}
    </div>
  );
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  useLocale();
  const { title, message, details } = errorDescription(error);
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
        {details.length > 0 && (
          <ul className="error-details">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      {retry && (
        <Button variant="secondary" size="small" onClick={retry}>
          {t('Try again')}
        </Button>
      )}
    </div>
  );
}
export function Skeleton({ rows = 4 }: { rows?: number }) {
  useLocale();
  return (
    <div className="skeleton-group" role="status" aria-label={t('Loading records')}>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  useLocale();
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{t(eyebrow)}</div>}
        <h1>{t(title)}</h1>
        {description && <p>{t(description)}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  useLocale();
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={14} />
    </button>
  );
}
export function BrandedLoader() {
  useLocale();
  return (
    <div className="boot-loader">
      <BrandLogo variant="symbol" className="loader-emblem" />
      <h2>etihadrealestate</h2>
      <span className="loading-line" />
      <p>{t('Preparing your workspace')}</p>
    </div>
  );
}
