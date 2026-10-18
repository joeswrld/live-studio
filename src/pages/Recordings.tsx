import { useCallback, useEffect, useState } from 'react';
import { Film, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import type { Recording } from '@/types';
import { formatBytes, formatDate, formatDuration } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, NameDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorNotice, PageHeader, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator, type StatusTone } from '@/components/ui/StatusIndicator';

const TONES: Record<Recording['status'], StatusTone> = { processing: 'warn', ready: 'ok', failed: 'live' };

export default function Recordings() {
  const toast = useToast();
  const [items, setItems] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Recording | null>(null);
  const [deleting, setDeleting] = useState<Recording | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('recordings').select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      setError(null);
      setItems((data ?? []) as Recording[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    setBusy(true);
    const { error: err } = await fn();
    setBusy(false);
    if (err) {
      toast.error(err.message);
      return false;
    }
    toast.success(ok);
    await load();
    return true;
  };

  return (
    <>
      <PageHeader title="Recordings library" description="Recording records saved to your account." />
      {error && <ErrorNotice message={error} />}
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={Film} title="No recordings yet" description="Recording is not implemented in this version. Recordings will appear here once it is." />
      ) : (
        <div className="panel divide-y divide-studio-700">
          {items.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{r.title}</p>
                  <StatusIndicator tone={TONES[r.status]} label={r.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDate(r.created_at)} · {formatDuration(r.duration_seconds)} · {formatBytes(r.size_bytes)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" onClick={() => setRenaming(r)}><Pencil className="h-3.5 w-3.5" /> Rename</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(r)} aria-label={`Delete ${r.title}`}><Trash2 className="h-3.5 w-3.5 text-live" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NameDialog
        open={renaming !== null}
        title="Rename recording"
        label="Title"
        maxLength={160}
        initialValue={renaming?.title}
        submitLabel="Save"
        loading={busy}
        onClose={() => setRenaming(null)}
        onSubmit={async (title) => {
          if (renaming && (await mutate(() => supabase.from('recordings').update({ title }).eq('id', renaming.id), 'Recording renamed'))) setRenaming(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete recording"
        message={`Delete the record "${deleting?.title}"? This cannot be undone.`}
        loading={busy}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting && (await mutate(() => supabase.from('recordings').delete().eq('id', deleting.id), 'Recording deleted'))) setDeleting(null);
        }}
      />
    </>
  );
}
