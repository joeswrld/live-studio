import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Radio, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSessions } from '@/hooks/useSessions';
import { useToast } from '@/contexts/ToastContext';
import type { StreamDestination, StreamPlatform } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorNotice, PageHeader, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { NoSessionsState, SessionSelect, useActiveSession } from '@/components/layout/SessionPicker';

const PLATFORMS: { value: StreamPlatform; label: string }[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'custom_rtmp', label: 'Custom RTMP' },
];

interface FormValues {
  name: string;
  platform: StreamPlatform;
  rtmp_url: string;
}

function DestinationForm({ initial, loading, onSubmit, onClose }: { initial?: StreamDestination; loading: boolean; onSubmit: (v: FormValues) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [platform, setPlatform] = useState<StreamPlatform>(initial?.platform ?? 'youtube');
  const [url, setUrl] = useState(initial?.rtmp_url ?? '');
  const urlValid = url === '' || /^rtmps?:\/\//i.test(url.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && urlValid) onSubmit({ name: name.trim(), platform, rtmp_url: url.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="d-name">Name</label>
        <input id="d-name" className="input" autoFocus maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="d-platform">Platform</label>
        <select id="d-platform" className="input" value={platform} onChange={(e) => setPlatform(e.target.value as StreamPlatform)}>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="d-url">RTMP URL</label>
        <input id="d-url" className="input font-mono text-xs" placeholder="rtmp://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        {!urlValid && <p className="mt-1 text-xs text-live">URL must start with rtmp:// or rtmps://</p>}
        <p className="mt-1 text-xs text-slate-500">Stream keys are not stored in this version.</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading} disabled={!name.trim() || !urlValid}>Save</Button>
      </div>
    </form>
  );
}

export default function Streams() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { active, select } = useActiveSession(sessions, sessionsLoading);
  const toast = useToast();
  const [items, setItems] = useState<StreamDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<StreamDestination | 'new' | null>(null);
  const [deleting, setDeleting] = useState<StreamDestination | null>(null);
  const [busy, setBusy] = useState(false);

  const sessionId = active?.id;
  const load = useCallback(async () => {
    if (!sessionId) return;
    const { data, error: err } = await supabase.from('stream_destinations').select('*').eq('session_id', sessionId).order('created_at');
    if (err) setError(err.message);
    else {
      setError(null);
      setItems((data ?? []) as StreamDestination[]);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) => {
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

  if (sessionsLoading) return <Spinner />;
  if (!active) return <><PageHeader title="Livestream management" /><NoSessionsState /></>;

  return (
    <>
      <PageHeader
        title="Livestream management"
        description="Where this session will stream once live output is built."
        actions={
          <>
            <SessionSelect sessions={sessions} activeId={active.id} onChange={select} />
            <Button variant="primary" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" /> Add destination
            </Button>
          </>
        }
      />
      <p className="mb-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-amber-200">
        Destinations are saved, but streaming to them is not implemented yet. Nothing is sent to these URLs.
      </p>
      {error && <ErrorNotice message={error} />}
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={Radio} title="No destinations" description="Add a platform and RTMP URL for this session." action={<Button variant="primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> Add destination</Button>} />
      ) : (
        <div className="panel divide-y divide-studio-700">
          {items.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{d.name}</p>
                  <StatusIndicator tone="idle" label={PLATFORMS.find((p) => p.value === d.platform)?.label ?? d.platform} />
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{d.rtmp_url || 'No URL set'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" onClick={() => setEditing(d)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(d)} aria-label={`Delete ${d.name}`}><Trash2 className="h-3.5 w-3.5 text-live" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} title={editing === 'new' ? 'Add destination' : 'Edit destination'} onClose={() => setEditing(null)}>
        {editing !== null && (
          <DestinationForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            loading={busy}
            onClose={() => setEditing(null)}
            onSubmit={async (v) => {
              const ok = await run(
                () =>
                  editing === 'new'
                    ? supabase.from('stream_destinations').insert({ session_id: active.id, ...v })
                    : supabase.from('stream_destinations').update(v).eq('id', editing.id),
                editing === 'new' ? 'Destination added' : 'Destination updated',
              );
              if (ok) setEditing(null);
            }}
          />
        )}
      </Dialog>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete destination"
        message={`Delete "${deleting?.name}"?`}
        loading={busy}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting && (await run(() => supabase.from('stream_destinations').delete().eq('id', deleting.id), 'Destination deleted'))) setDeleting(null);
        }}
      />
    </>
  );
}
