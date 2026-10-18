import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera as CameraIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSessions } from '@/hooks/useSessions';
import { useCameras } from '@/hooks/useCameras';
import { useNow } from '@/hooks/useNow';
import { useToast } from '@/contexts/ToastContext';
import { isCameraLive } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorNotice, PageHeader, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { NoSessionsState, SessionSelect, useActiveSession } from '@/components/layout/SessionPicker';
import { VideoMonitor } from '@/components/studio/VideoMonitor';
import { CameraTile } from '@/components/studio/CameraTile';
import { ProductionControls } from '@/components/studio/ProductionControls';

export default function Studio() {
  const { sessions, loading: sessionsLoading, refresh } = useSessions();
  const { active, select } = useActiveSession(sessions, sessionsLoading);
  const { cameras, loading, error } = useCameras(active?.id);
  const toast = useToast();
  const now = useNow();
  const [busy, setBusy] = useState(false);

  if (sessionsLoading) return <Spinner />;
  if (!active) return <><PageHeader title="Live production studio" /><NoSessionsState /></>;

  const byId = new Map(cameras.map((c) => [c.id, c]));
  const previewCam = active.preview_camera_id ? byId.get(active.preview_camera_id) : undefined;
  const programCam = active.program_camera_id ? byId.get(active.program_camera_id) : undefined;
  const onlineCount = cameras.filter((c) => isCameraLive(c.status, c.last_seen_at, now)).length;

  const saveSwitcher = async (preview: string | null, program: string | null) => {
    setBusy(true);
    const { error: err } = await supabase
      .from('production_sessions')
      .update({ preview_camera_id: preview, program_camera_id: program })
      .eq('id', active.id);
    if (err) toast.error(err.message);
    else await refresh();
    setBusy(false);
  };

  const cut = () => {
    if (!previewCam) return;
    void saveSwitcher(programCam?.id ?? null, previewCam.id);
  };
  const swap = () => void saveSwitcher(active.program_camera_id, active.preview_camera_id);

  return (
    <>
      <PageHeader
        title="Live production studio"
        description="Switcher selections are saved to the session. Video is not connected yet."
        actions={<SessionSelect sessions={sessions} activeId={active.id} onChange={select} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusIndicator tone={onlineCount > 0 ? 'ok' : 'idle'} label={`${onlineCount}/${cameras.length} cameras online`} />
        <StatusIndicator tone="idle" label="Not recording" />
        <StatusIndicator tone="idle" label="Not live" />
      </div>

      {error && <ErrorNotice message={error} />}

      {loading ? (
        <Spinner />
      ) : cameras.length === 0 ? (
        <EmptyState
          icon={CameraIcon}
          title="This session has no cameras"
          description="Add camera slots first, then come back to switch between them."
          action={
            <Link to={`/app/cameras?session=${active.id}`}>
              <Button variant="primary">Add cameras</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <VideoMonitor kind="preview" label={previewCam?.name ?? 'Select a camera below'} emptyMessage="No video transport yet" />
            <VideoMonitor kind="program" label={programCam?.name ?? 'Nothing on program'} emptyMessage="No video transport yet" />
          </div>

          <div className="mt-4">
            <ProductionControls canCut={Boolean(previewCam)} canSwap={Boolean(previewCam && programCam)} busy={busy} onCut={cut} onSwap={swap} />
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">Cameras · click to put on preview</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cameras.map((c) => (
              <CameraTile
                key={c.id}
                camera={c}
                now={now}
                isPreview={c.id === active.preview_camera_id}
                isProgram={c.id === active.program_camera_id}
                onSelect={() => void saveSwitcher(c.id, active.program_camera_id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
