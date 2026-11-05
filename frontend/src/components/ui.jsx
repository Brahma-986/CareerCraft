import { LoaderCircle } from 'lucide-react';

export function Spinner({ className = 'h-4 w-4' }) {
  return <LoaderCircle className={`animate-spin ${className}`} />;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const styles = {
    primary: 'bg-primary text-white hover:bg-indigo-700',
    secondary: 'bg-secondary text-white hover:bg-violet-700',
    outline: 'border border-slate-200 bg-white text-heading hover:bg-slate-50',
    ghost: 'text-muted hover:bg-slate-100',
    danger: 'bg-danger text-white hover:bg-red-600',
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-heading">{label}</span>
      {children}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

const controlClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-indigo-100';

export function Input({ className = '', ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${controlClass} min-h-36 resize-y ${className}`} {...props} />;
}

export function Card({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-50 text-success',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-danger',
    indigo: 'bg-indigo-50 text-primary',
    violet: 'bg-violet-50 text-secondary',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {Icon ? <Icon className="mb-3 h-8 w-8 text-primary" /> : null}
      <h3 className="text-base font-semibold text-heading">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-heading">{title}</h3>
        <div className="mt-3 text-sm text-muted">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {children?.props ? null : null}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', loading, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-heading">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function ScoreRing({ score, label = 'Estimated match' }) {
  const value = Number.isFinite(Number(score)) ? Number(score) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? '#16A34A' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} stroke="#E2E8F0" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-heading">{value}</span>
          <span className="text-[11px] text-muted">/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-heading">{label}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
          Estimated compatibility based on skills, experience, projects, and keywords. This is not an official ATS score.
        </p>
      </div>
    </div>
  );
}
