import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Clapperboard, Film, Plus, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions } from '@/hooks/useSessions';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/Feedback';

interface Counts {
  cameras: number;
  destinations: number;
  recordings: number;
}

async function count(table: 'cameras' | 'stream_destinations' | 'recordings'): Promise<number> {
  const { count: c } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return c ?? 0;
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { sessions, loading } = useSessions();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([count('cameras'), count('stream_destinations'), count('recordings')]).then(([cameras, destinations, recordings]) => {
      if (active) setCounts({ cameras, destinations, recordings });
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: 'Sessions', value: sessions.length, icon: Clapperboard },
    { label: 'Camera slots', value: counts?.cameras, icon: Camera },
    { label: 'Stream destinations', value: counts?.destinations, icon: Radio },
    { label: 'Recordings', value: counts?.recordings, icon: Film },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome${profile?.display_name ? `, ${profile.display_name}` : user?.email ? `, ${user.email}` : ''}`}
        description="Your production overview."
        actions={
          <Link to="/app/sessions">
            <Button variant="primary">
              <Plus className="h-4 w-4" /> New session
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel p-4">
            <Icon className="h-4 w-4 text-slate-500" />
            <p className="mt-2 font-mono text-2xl font-semibold text-white">{value ?? '—'}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-slate-400">Recent sessions</h2>
      {loading ? (
        <Spinner />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="No sessions yet"
          description="Create a production session to start adding cameras."
          action={
            <Link to="/app/sessions">
              <Button variant="primary">Create a session</Button>
            </Link>
          }
        />
      ) : (
        <div className="panel divide-y divide-studio-700">
          {sessions.slice(0, 5).map((s) => (
            <Link key={s.id} to={`/app/studio?session=${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-studio-800">
              <span className="truncate font-medium text-white">{s.name}</span>
              <span className="shrink-0 pl-3 text-xs text-slate-500">{formatDate(s.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
