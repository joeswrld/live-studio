import { Smartphone } from 'lucide-react';
import type { Camera } from '@/types';
import { isCameraLive, timeAgo } from '@/lib/format';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { VideoMonitor } from './VideoMonitor';

interface CameraTileProps {
  camera: Camera;
  isPreview?: boolean;
  isProgram?: boolean;
  /** Current time, passed in so a parent ticker can re-evaluate presence staleness. */
  now: number;
  onSelect?: () => void;
}

export function CameraTile({ camera, isPreview, isProgram, now, onSelect }: CameraTileProps) {
  const online = isCameraLive(camera.status, camera.last_seen_at, now);
  const ring = isProgram ? 'ring-2 ring-live' : isPreview ? 'ring-2 ring-ok' : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      className={`panel group w-full rounded-lg p-2 text-left transition hover:border-studio-500 disabled:cursor-default ${ring}`}
    >
      <VideoMonitor
        kind="camera"
        emptyMessage={online ? 'Connected · video not transported yet' : 'Camera offline'}
      />
      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{camera.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-slate-500">
            <Smartphone className="h-3 w-3 shrink-0" />
            {camera.device_label || 'No device yet'} · {online ? 'active' : `seen ${timeAgo(camera.last_seen_at)}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isProgram && <StatusIndicator tone="live" label="Program" />}
          {isPreview && !isProgram && <StatusIndicator tone="ok" label="Preview" />}
          {!isProgram && !isPreview && <StatusIndicator tone={online ? 'ok' : 'idle'} label={online ? 'Online' : 'Offline'} pulse={online} />}
        </div>
      </div>
    </button>
  );
}
