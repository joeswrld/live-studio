import type { ReactNode } from 'react';
import { VideoOff } from 'lucide-react';

export type MonitorKind = 'program' | 'preview' | 'camera';

interface VideoMonitorProps {
  kind: MonitorKind;
  /** Label shown in the corner, e.g. camera name. */
  label?: string;
  /** Attach a MediaStream here in later phases. Phase 1 never provides one. */
  stream?: MediaStream | null;
  /** Message shown when there is no stream. */
  emptyMessage?: string;
  children?: ReactNode;
}

const BORDERS: Record<MonitorKind, string> = {
  program: 'border-live',
  preview: 'border-ok',
  camera: 'border-studio-600',
};
const TAGS: Record<MonitorKind, { text: string; cls: string } | null> = {
  program: { text: 'PGM', cls: 'bg-live text-white' },
  preview: { text: 'PVW', cls: 'bg-ok text-black' },
  camera: null,
};

/**
 * 16:9 video monitor. Renders a <video> when a MediaStream is supplied,
 * otherwise an honest "no signal" slate. The transport layer in later phases
 * only has to pass `stream`.
 */
export function VideoMonitor({ kind, label, stream, emptyMessage = 'No signal', children }: VideoMonitorProps) {
  const tag = TAGS[kind];
  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-md border-2 bg-black ${BORDERS[kind]}`}>
      {stream ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          ref={(el) => {
            if (el && el.srcObject !== stream) el.srcObject = stream;
          }}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#0b0e13,#0b0e13_10px,#0e121a_10px,#0e121a_20px)] text-slate-500">
          <VideoOff className="h-6 w-6" />
          <span className="text-xs font-medium">{emptyMessage}</span>
        </div>
      )}
      {tag && <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${tag.cls}`}>{tag.text}</span>}
      {label && <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/70 px-2 py-0.5 text-xs text-slate-200">{label}</span>}
      {children}
    </div>
  );
}
