import { useState } from 'react';
import { Camera as CameraIcon, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';
import { useCameras } from '@/hooks/useCameras';
import { useNow } from '@/hooks/useNow';
import { useToast } from '@/contexts/ToastContext';
import type { Camera } from '@/types';
import { isCameraLive, timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, NameDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorNotice, PageHeader, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { NoSessionsState, SessionSelect, useActiveSession } from '@/components/layout/SessionPicker';

export default function Cameras() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { active, select } = useActiveSession(sessions, sessionsLoading);
  const { cameras, loading, error, add, rename, remove } = useCameras(active?.id);
  const toast = useToast();
  const now = useNow();
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<Camera | null>(null);
  const [deleting, setDeleting] = useState<Camera | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const joinUrl = (c: Camera) => `${window.location.origin}/join/${c.join_token}`;
  const copy = async (c: Camera) => {
    try {
      await navigator.clipboard.writeText(joinUrl(c));
      toast.success('Join link copied');
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  if (sessionsLoading) return <Spinner />;
  if (!active) return <><PageHeader title="Camera connection" /><NoSessionsState /></>;

  return (
    <>
      <PageHeader
        title="Camera connection"
        description="Add a camera slot, then open its join link on a phone, tablet or laptop."
        actions={
          <>
            <SessionSelect sessions={sessions} activeId={active.id} onChange={select} />
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add camera
            </Button>
          </>
        }
      />
      <p className="mb-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-amber-200">
        Phase 1: a camera joining reports its presence (online/offline). Video is not transmitted to the studio yet.
      </p>
      {error && <ErrorNotice message={error} />}
      {loading ? (
        <Spinner />
      ) : cameras.length === 0 ? (
        <EmptyState
          icon={CameraIcon}
          title="No cameras in this session"
          description="Add a camera slot to generate a private join link."
          action={
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add camera
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {cameras.map((c) => {
            const online = isCameraLive(c.status, c.last_seen_at, now);
            return (
              <div key={c.id} className="panel p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-white">{c.name}</p>
                      <StatusIndicator tone={online ? 'ok' : 'idle'} label={online ? 'Online' : 'Offline'} pulse={online} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {c.device_label || 'No device connected'} · last seen {timeAgo(c.last_seen_at)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => setRenaming(c)}>
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-3.5 w-3.5 text-live" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input readOnly className="input font-mono text-xs" value={joinUrl(c)} onFocus={(e) => e.currentTarget.select()} aria-label={`Join link for ${c.name}`} />
                  <Button size="sm" onClick={() => void copy(c)}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Anyone with a join link can mark that camera online. Treat links as private.</p>

      <NameDialog
        open={adding}
        title="Add camera"
        label="Camera name"
        maxLength={80}
        submitLabel="Add"
        loading={busy}
        onClose={() => setAdding(false)}
        onSubmit={(name) =>
          void run(async () => {
            await add(name);
            setAdding(false);
          }, 'Camera added')
        }
      />
      <NameDialog
        open={renaming !== null}
        title="Rename camera"
        label="Camera name"
        maxLength={80}
        initialValue={renaming?.name}
        submitLabel="Save"
        loading={busy}
        onClose={() => setRenaming(null)}
        onSubmit={(name) =>
          void run(async () => {
            if (renaming) await rename(renaming.id, name);
            setRenaming(null);
          }, 'Camera renamed')
        }
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete camera"
        message={`Delete "${deleting?.name}"? Its join link will stop working.`}
        loading={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          void run(async () => {
            if (deleting) await remove(deleting.id);
            setDeleting(null);
          }, 'Camera deleted')
        }
      />
    </>
  );
}
