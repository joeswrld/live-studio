import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Feedback';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.display_name);
  }, [profile]);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', user.id);
    setSavingName(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Profile updated');
      await refreshProfile();
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPw(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Password changed');
      setPassword('');
    }
  };

  return (
    <>
      <PageHeader title="Account settings" />
      <div className="max-w-lg space-y-6">
        <form onSubmit={saveName} className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold text-white">Profile</h2>
          <div>
            <label className="label" htmlFor="s-email">Email</label>
            <input id="s-email" className="input opacity-70" value={user?.email ?? ''} readOnly />
          </div>
          <div>
            <label className="label" htmlFor="s-name">Display name</label>
            <input id="s-name" className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" loading={savingName} disabled={!profile || name.trim() === profile.display_name}>
            Save profile
          </Button>
        </form>

        <form onSubmit={savePassword} className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold text-white">Change password</h2>
          <div>
            <label className="label" htmlFor="s-pw">New password</label>
            <input id="s-pw" type="password" className="input" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" loading={savingPw} disabled={password.length === 0}>
            Update password
          </Button>
        </form>
      </div>
    </>
  );
}
