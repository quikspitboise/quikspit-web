'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

/*
 * Small, touch-friendly building blocks for the admin. Inputs use a 16px
 * font so iOS does not zoom on focus, and targets are at least 44px tall.
 */

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-white/10 disabled:text-neutral-500',
  secondary: 'border border-white/15 text-white hover:border-white/35 hover:bg-white/[0.04]',
  ghost: 'text-neutral-300 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-red-500/40 text-red-200 hover:bg-red-500/10',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'min-h-9 px-3 text-sm' : 'min-h-11 px-4 text-sm',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const inputClass =
  'w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2.5 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-red-500 aria-[invalid=true]:border-red-500/70 sm:text-sm';

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  /** Receives ids to wire the control to its label and messages. */
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-200">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  error,
  value,
  onChange,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
          {...props}
        />
      )}
    </Field>
  );
}

/** Textarea that grows with its content, so long copy is readable on a phone. */
export function TextArea({
  label,
  hint,
  error,
  value,
  onChange,
  className,
  rows = 3,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          className={cx(inputClass, 'field-sizing-content min-h-20 resize-y leading-relaxed')}
          {...props}
        />
      )}
    </Field>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx('flex min-h-11 items-start justify-between gap-4', className)}>
      <label htmlFor={id} className="cursor-pointer pt-2.5 text-sm">
        <span className="block font-medium text-neutral-200">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="group relative mt-1.5 inline-flex h-8 w-14 shrink-0 items-center rounded-full disabled:opacity-50"
      >
        <span className={cx('absolute inset-0 rounded-full transition-colors', checked ? 'bg-red-600' : 'bg-white/15')} />
        <span
          className={cx(
            'relative ml-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex max-w-full overflow-x-auto rounded-lg border border-white/10 p-1', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'min-h-9 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors',
              active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-white/15 text-neutral-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  danger: 'border-red-500/30 bg-red-500/10 text-red-200',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium', badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ title, description, actions, children, className }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-4 sm:p-6', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {description && <p className="mt-1 max-w-2xl text-sm text-neutral-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = 'info', children, actions, className }: {
  tone?: BadgeTone;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cx('rounded-xl border px-4 py-3 text-sm', badgeTones[tone], className)}
    >
      <div className="leading-relaxed">{children}</div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('h-4 w-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Sheets and dialogs (native <dialog>: focus trap, Escape, top layer) ─── */

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  bodyClassName = 'overflow-y-auto overscroll-contain px-4 py-5 sm:px-6',
}: {
  open: boolean;
  bodyClassName?: string;
  /** Called for Escape, the close button, and backdrop taps. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'full';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const widths = { md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', full: 'sm:max-w-none' };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cx(
        'admin-sheet m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/80 sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:p-4',
        widths[size],
        size === 'full' && 'sm:h-dvh sm:max-h-none sm:p-0',
      )}
    >
      {open && (
        <div
          className={cx(
            'dialog-enter flex h-full flex-col overflow-hidden bg-neutral-950 sm:max-h-[calc(92dvh-2rem)] sm:rounded-2xl sm:border sm:border-white/10',
            size === 'full' && 'sm:h-full sm:max-h-none sm:rounded-none sm:border-0',
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4">
            <div className="min-w-0 pt-2">
              <h2 id={titleId} className="truncate text-lg font-semibold text-white">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-neutral-400">{description}</p>}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mr-2">
              <CloseIcon />
            </IconButton>
          </header>
          <div className={cx('min-h-0 flex-1', bodyClassName)}>{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 bg-neutral-950 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}

type ConfirmOptions = {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
};

type ConfirmState = ConfirmOptions & { resolve: (confirmed: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);
const ToastContext = createContext<((toast: Omit<Toast, 'id'>) => void) | null>(null);

type Toast = { id: number; tone: 'success' | 'error' | 'warning' | 'info'; message: ReactNode };

const toastTones: Record<Toast['tone'], string> = {
  success: 'border-emerald-500/40 text-emerald-100',
  error: 'border-red-500/50 text-red-100',
  warning: 'border-amber-500/50 text-amber-100',
  info: 'border-white/15 text-neutral-100',
};

/** Confirm dialogs and toasts for everything inside the admin. */
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...options, resolve })),
    [],
  );

  const settle = useCallback((confirmed: boolean) => {
    setConfirmState((state) => {
      state?.resolve(confirmed);
      return null;
    });
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmState && !dialog.open) dialog.showModal();
    if (!confirmState && dialog.open) dialog.close();
  }, [confirmState]);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-1), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.tone === 'error' || toast.tone === 'warning' ? 9000 : 5000);
    },
    [dismiss],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      <ToastContext.Provider value={notify}>
        {children}

        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          onCancel={(event) => {
            event.preventDefault();
            settle(false);
          }}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-0 text-white backdrop:bg-black/80"
        >
          {confirmState && (
            <div className="dialog-enter p-5 sm:p-6">
              <h2 id={titleId} className="text-lg font-semibold">{confirmState.title}</h2>
              {confirmState.body && <div className="mt-2 text-sm leading-relaxed text-neutral-400">{confirmState.body}</div>}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button onClick={() => settle(false)} autoFocus>
                  {confirmState.cancelLabel ?? 'Cancel'}
                </Button>
                <Button variant={confirmState.tone === 'danger' ? 'danger' : 'primary'} onClick={() => settle(true)}>
                  {confirmState.confirmLabel ?? 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </dialog>

        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[60] flex flex-col items-center gap-2 px-4"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={cx(
                'dialog-enter pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-neutral-900/95 px-4 py-3 text-sm shadow-2xl shadow-black/60',
                toastTones[toast.tone],
              )}
            >
              <div className="min-w-0 flex-1 pt-0.5 leading-relaxed">{toast.message}</div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded p-1 text-neutral-400 hover:text-white"
                aria-label="Dismiss"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside AdminFeedbackProvider');
  return confirm;
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside AdminFeedbackProvider');
  return notify;
}

/* ─── Icons ─── */

type IconProps = { className?: string };
const iconBase = 'fill-none stroke-current';

export function CloseIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={cx(iconBase, className)} viewBox="0 0 20 20" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function ChevronIcon({ className = 'h-4 w-4', direction = 'down' }: IconProps & { direction?: 'down' | 'up' | 'right' }) {
  const rotation = { down: '', up: 'rotate-180', right: '-rotate-90' }[direction];
  return (
    <svg className={cx(iconBase, 'transition-transform', rotation, className)} viewBox="0 0 16 16" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function ArrowIcon({ className = 'h-4 w-4', direction }: IconProps & { direction: 'up' | 'down' }) {
  return (
    <svg className={cx(iconBase, direction === 'down' && 'rotate-180', className)} viewBox="0 0 16 16" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 13V3M4 7l4-4 4 4" />
    </svg>
  );
}

export function EyeIcon({ className = 'h-5 w-5', off = false }: IconProps & { off?: boolean }) {
  return (
    <svg className={cx(iconBase, className)} viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

export function PlusIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={cx(iconBase, className)} viewBox="0 0 16 16" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={cx(iconBase, className)} viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function GripIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

export function ExternalIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={cx(iconBase, className)} viewBox="0 0 16 16" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h4v4M13 3L7 9M11 9v4H3V5h4" />
    </svg>
  );
}
