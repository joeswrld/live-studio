import { Link } from 'react-router-dom';
import { Camera, CheckCircle2, Clapperboard, Clock, Film, Radio, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

const AVAILABLE = [
  { icon: Clapperboard, title: 'Production sessions', text: 'Create, rename, open and delete sessions, each with a unique ID and an owner.' },
  { icon: Camera, title: 'Camera slots & join links', text: 'Add camera slots and share a private join link. See live presence as devices open the link.' },
  { icon: SlidersHorizontal, title: 'Studio switcher state', text: 'Choose preview and program cameras. The selection is saved to your session.' },
  { icon: Radio, title: 'Stream destinations', text: 'Store destination metadata (platform and RTMP URL) per session.' },
  { icon: Film, title: 'Recording library', text: 'Browse, rename and delete recording records stored in your account.' },
];

const PLANNED = ['Real-time camera video transport', 'Video composition and switching', 'Recording to storage', 'Live streaming output'];

export default function Landing() {
  const { session } = useAuth();
  return (
    <div className="min-h-full bg-studio-950">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {session ? (
            <Link to="/app">
              <Button variant="primary">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <StatusIndicator tone="warn" label="Early build · Phase 1" />
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Multi-camera live production, <span className="text-accent">from your browser.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-400">
          Live Studio is a broadcast studio for the web. This first release lays the foundation: accounts, production sessions, camera slots and the studio workspace.
          Video transport, recording and streaming come in later phases.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={session ? '/app' : '/signup'}>
            <Button variant="primary" size="md" className="px-5 py-2.5">
              {session ? 'Open dashboard' : 'Create a free account'}
            </Button>
          </Link>
        </div>

        <div className="panel mt-12 overflow-hidden p-2">
          <div className="grid grid-cols-3 gap-2">
            {['Camera 1', 'Camera 2', 'Camera 3'].map((c, i) => (
              <div key={c} className={`relative aspect-video rounded border-2 bg-black ${i === 0 ? 'border-live' : i === 1 ? 'border-ok' : 'border-studio-600'}`}>
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-slate-300">{c}</span>
              </div>
            ))}
          </div>
          <p className="px-2 pb-1 pt-2 text-xs text-slate-500">Illustration of the studio layout. No video is shown in this release.</p>
        </div>
      </section>

      <section className="border-t border-studio-800 bg-studio-900/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ok">
            <CheckCircle2 className="h-4 w-4" /> Available now
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE.map(({ icon: Icon, title, text }) => (
              <div key={title} className="panel p-5">
                <Icon className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warn">
            <Clock className="h-4 w-4" /> Coming in later phases
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
            {PLANNED.map((p) => (
              <li key={p} className="panel px-4 py-3">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-studio-800 py-6 text-center text-xs text-slate-600">Live Studio</footer>
    </div>
  );
}
