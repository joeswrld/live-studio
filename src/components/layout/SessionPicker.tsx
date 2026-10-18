import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';
import type { ProductionSession } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';

const LAST_KEY = 'live-studio:last-session';

/**
 * Resolves the active session from `?session=<id>` (falling back to the last one used).
 * Pages that are scoped to a session use this and render <SessionSelect> in their header.
 */
export function useActiveSession(sessions: ProductionSession[], loading: boolean) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('session');
  const fromUrl = sessions.find((s) => s.id === requested);

  let remembered: string | null = null;
  try {
    remembered = localStorage.getItem(LAST_KEY);
  } catch {
    /* storage unavailable */
  }
  const active = fromUrl ?? sessions.find((s) => s.id === remembered) ?? sessions[0];

  useEffect(() => {
    if (!active) return;
    try {
      localStorage.setItem(LAST_KEY, active.id);
    } catch {
      /* ignore */
    }
  }, [active]);

  const select = (id: string) => setParams({ session: id }, { replace: true });
  return { active: loading ? undefined : active, select };
}

export function SessionSelect({ sessions, activeId, onChange }: { sessions: ProductionSession[]; activeId?: string; onChange: (id: string) => void }) {
  return (
    <select
      className="input w-auto min-w-48"
      value={activeId ?? ''}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Production session"
    >
      {sessions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

export function NoSessionsState() {
  return (
    <EmptyState
      icon={Clapperboard}
      title="Create a production session first"
      description="Cameras, studio and stream destinations all belong to a production session."
      action={
        <Link to="/app/sessions">
          <Button variant="primary">Go to sessions</Button>
        </Link>
      }
    />
  );
}
