import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative w-full max-w-md animate-slideIn shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-studio-700 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-studio-700 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-300">{message}</p>
    </Dialog>
  );
}

interface NameDialogProps {
  open: boolean;
  title: string;
  label: string;
  initialValue?: string;
  submitLabel: string;
  maxLength?: number;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

/** Single text field dialog used for create / rename flows. */
export function NameDialog({ open, title, label, initialValue = '', submitLabel, maxLength = 120, loading, onSubmit, onClose }: NameDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      {/* key resets the input each time the dialog opens */}
      <NameForm
        key={`${open}-${initialValue}`}
        label={label}
        initialValue={initialValue}
        submitLabel={submitLabel}
        maxLength={maxLength}
        loading={loading}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </Dialog>
  );
}

function NameForm({ label, initialValue, submitLabel, maxLength, loading, onSubmit, onClose }: Omit<NameDialogProps, 'open' | 'title'> & { initialValue: string; maxLength: number }) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmed) onSubmit(trimmed);
  };
  return (
    <form onSubmit={submit}>
      <label className="label" htmlFor="name-field">
        {label}
      </label>
      <input id="name-field" className="input" autoFocus value={value} maxLength={maxLength} onChange={(e) => setValue(e.target.value)} />
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!trimmed} loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
