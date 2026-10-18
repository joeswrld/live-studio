import { Link, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import Landing from '@/pages/Landing';
import { Login, Signup } from '@/pages/AuthPages';
import Dashboard from '@/pages/Dashboard';
import Sessions from '@/pages/Sessions';
import Cameras from '@/pages/Cameras';
import Studio from '@/pages/Studio';
import Streams from '@/pages/Streams';
import Recordings from '@/pages/Recordings';
import SettingsPage from '@/pages/Settings';
import CameraJoin from '@/pages/CameraJoin';

function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-mono text-5xl text-slate-600">404</p>
      <p className="text-slate-400">That page doesn't exist.</p>
      <Link to="/">
        <Button variant="primary">Back home</Button>
      </Link>
    </div>
  );
}

function ConfigMissing() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="panel max-w-lg p-6">
        <h1 className="text-lg font-semibold text-white">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-slate-400">
          Copy <code className="font-mono text-slate-200">.env.example</code> to <code className="font-mono text-slate-200">.env</code> and set{' '}
          <code className="font-mono text-slate-200">VITE_SUPABASE_URL</code> and <code className="font-mono text-slate-200">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
          Apply the SQL in <code className="font-mono text-slate-200">supabase/migrations</code> to your project first.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigMissing />;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/join/:token" element={<CameraJoin />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="studio" element={<Studio />} />
          <Route path="streams" element={<Streams />} />
          <Route path="recordings" element={<Recordings />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
