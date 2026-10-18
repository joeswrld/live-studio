import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ProductionSession } from '@/types';

export function useSessions() {
  const [sessions, setSessions] = useState<ProductionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('production_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      setError(null);
      setSessions((data ?? []) as ProductionSession[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Returns the created session, or throws with a readable message. */
  const create = useCallback(
    async (name: string, description = '') => {
      const { data, error: err } = await supabase
        .from('production_sessions')
        .insert({ name, description })
        .select('*')
        .single();
      if (err) throw new Error(err.message);
      await refresh();
      return data as ProductionSession;
    },
    [refresh],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const { error: err } = await supabase.from('production_sessions').update({ name }).eq('id', id);
      if (err) throw new Error(err.message);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('production_sessions').delete().eq('id', id);
      if (err) throw new Error(err.message);
      await refresh();
    },
    [refresh],
  );

  return { sessions, loading, error, refresh, create, rename, remove };
}
