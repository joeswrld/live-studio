export type StatusTone = 'live' | 'ok' | 'warn' | 'idle' | 'info';

const TONES: Record<StatusTone, { dot: string; text: string; ring: string }> = {
  live: { dot: 'bg-live', text: 'text-live', ring: 'border-live/40 bg-live/10' },
  ok: { dot: 'bg-ok', text: 'text-ok', ring: 'border-ok/40 bg-ok/10' },
  warn: { dot: 'bg-warn', text: 'text-warn', ring: 'border-warn/40 bg-warn/10' },
  idle: { dot: 'bg-slate-500', text: 'text-slate-400', ring: 'border-studio-600 bg-studio-800' },
  info: { dot: 'bg-accent', text: 'text-accent', ring: 'border-accent/40 bg-accent/10' },
};

interface StatusIndicatorProps {
  tone: StatusTone;
  label: string;
  pulse?: boolean;
  className?: string;
}

/** Small pill with a status dot. Used for camera presence, session state, and recording state. */
export function StatusIndicator({ tone, label, pulse, className = '' }: StatusIndicatorProps) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${t.ring} ${t.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot} ${pulse ? 'animate-pulseDot' : ''}`} />
      {label}
    </span>
  );
}
