import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ErrorNotice } from '@/components/ui/Feedback';
import { Logo } from '@/components/layout/Logo';

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
      <Logo />
      <div className="panel mt-6 w-full max-w-sm p-6">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        <div className="mt-5">{children}</div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{footer}</p>
    </div>
  );
}

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
    else navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to your studio."
      footer={
        <>
          No account?{' '}
          <Link to="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNotice message={error} />}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" loading={busy} className="w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await signUp(email.trim(), password, name.trim());
    setBusy(false);
    if (res.error) setError(res.error);
    else if (res.needsConfirmation) setConfirmSent(true);
    else navigate('/app', { replace: true });
  };

  if (confirmSent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`We sent a confirmation link to ${email}. Open it, then log in.`}
        footer={
          <Link to="/login" className="text-accent hover:underline">
            Go to log in
          </Link>
        }
      >
        <p className="text-sm text-slate-400">Email confirmation is enabled on this Supabase project.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building production sessions."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNotice message={error} />}
        <div>
          <label className="label" htmlFor="name">Display name</label>
          <input id="name" className="input" required maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <Button type="submit" variant="primary" loading={busy} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
