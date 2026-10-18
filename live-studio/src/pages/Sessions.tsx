import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/contexts/ToastContext';
import type { ProductionSession } from '@/types';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, NameDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorNotice, PageHeader, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function Sessions() {
  const { sessions, loading, error, create, rename, remove } = useSessions();
  const toast = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<ProductionSession | null>(null);
  const [deleting, setDeleting] = useState<ProductionSession | null>(null);
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

  return (
    <>
      <PageHeader
        title="Production sessions"
        description="Each session has its own cameras, studio and stream destinations."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New session
          </Button>
        }
      />
      {error && <ErrorNotice message={error} />}
      {loading ? (
        <Spinner />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="No sessions yet"
          description="Create your first production session to add cameras and open the studio."
          action={
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New session
            </Button>
          }
        />
      ) : (
        <div className="panel divide-y divide-studio-700">
          {sessions.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{s.name}</p>
                  <StatusIndicator tone={s.status === 'ready' ? 'ok' : 'idle'} label={s.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Created {formatDate(s.created_at)} · <span className="font-mono">{s.id.slice(0, 8)}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="primary" onClick={() => navigate(`/app/studio?session=${s.id}`)}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Open
                </Button>
                <Button size="sm" onClick={() => setRenaming(s)} aria-label={`Rename ${s.name}`}>
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                  <Trash2 className="h-3.5 w-3.5 text-live" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NameDialog
        open={creating}
        title="New production session"
        label="Session name"
        submitLabel="Create"
        loading={busy}
        onClose={() => setCreating(false)}
        onSubmit={(name) =>
          void run(async () => {
            const created = await create(name);
            setCreating(false);
            navigate(`/app/cameras?session=${created.id}`);
          }, 'Session created')
        }
      />
      <NameDialog
        open={renaming !== null}
        title="Rename session"
        label="Session name"
        initialValue={renaming?.name}
        submitLabel="Save"
        loading={busy}
        onClose={() => setRenaming(null)}
        onSubmit={(name) =>
          void run(async () => {
            if (renaming) await rename(renaming.id, name);
            setRenaming(null);
          }, 'Session renamed')
        }
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete session"
        message={`Delete "${deleting?.name}"? Its cameras and stream destinations are removed too. Recordings are kept but unlinked from the session. This cannot be undone.`}
        loading={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          void run(async () => {
            if (deleting) await remove(deleting.id);
            setDeleting(null);
          }, 'Session deleted')
        }
      />
    </>
  );
}
