import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Camera } from '@/types';

/** Cameras of one session, kept live through Supabase Realtime. */
export function useCameras(sessionId: string | undefined) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    const { data, error: err } = await supabase
      .from('cameras')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (err) setError(err.message);
    else {
      setError(null);
      setCameras((data ?? []) as Camera[]);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setCameras([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void refresh();
    const channel = supabase
      .channel(`cameras:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras', filter: `session_id=eq.${sessionId}` }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, refresh]);

  const add = useCallback(
    async (name: string) => {
      if (!sessionId) throw new Error('No session selected');
      const { error: err } = await supabase.from('cameras').insert({ session_id: sessionId, name });
      if (err) throw new Error(err.message);
      await refresh();
    },
    [sessionId, refresh],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const { error: err } = await supabase.from('cameras').update({ name }).eq('id', id);
      if (err) throw new Error(err.message);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('cameras').delete().eq('id', id);
      if (err) throw new Error(err.message);
      await refresh();
    },
    [refresh],
  );

  return { cameras, loading, error, refresh, add, rename, remove };
}
