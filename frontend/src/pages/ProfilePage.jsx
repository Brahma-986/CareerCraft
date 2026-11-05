import { useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { Button, Card, Field, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from './RegisterPage';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [show, setShow] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/profile', profile);
      setUser(response.data.data.user);
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      const response = await api.put('/profile', passwords);
      setUser(response.data.data.user);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold text-heading">Profile</h2>
        <form className="mt-4 space-y-4" onSubmit={saveProfile}>
          <Field label="Full name">
            <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
          </Field>
          <Button type="submit" loading={savingProfile}>Save profile</Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-heading">Change password</h2>
        <form className="mt-4 space-y-4" onSubmit={savePassword}>
          <Field label="Current password">
            <PasswordInput value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} show={show} onToggle={() => setShow((value) => !value)} />
          </Field>
          <Field label="New password">
            <Input type={show ? 'text' : 'password'} value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
          </Field>
          <Button type="submit" loading={savingPassword}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
