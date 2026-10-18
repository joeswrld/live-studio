import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Camera, Clapperboard, Film, LayoutDashboard, LogOut, Menu, Radio, Settings, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/sessions', label: 'Sessions', icon: Clapperboard },
  { to: '/app/cameras', label: 'Cameras', icon: Camera },
  { to: '/app/studio', label: 'Studio', icon: SlidersHorizontal },
  { to: '/app/streams', label: 'Livestreams', icon: Radio },
  { to: '/app/recordings', label: 'Recordings', icon: Film },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function AppLayout() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const name = profile?.display_name || user?.email || 'Account';

  const sidebar = (
    <nav className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo />
        <button className="text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 space-y-0.5 px-2 py-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent/15 text-white' : 'text-slate-400 hover:bg-studio-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
      <div className="border-t border-studio-700 p-3">
        <p className="truncate px-1 text-sm font-medium text-white">{name}</p>
        <p className="truncate px-1 text-xs text-slate-500">{user?.email}</p>
        <button
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-studio-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-full">
      <aside className="hidden w-56 shrink-0 border-r border-studio-700 bg-studio-900 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 border-r border-studio-700 bg-studio-900">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-studio-700 bg-studio-900 px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-slate-300" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
