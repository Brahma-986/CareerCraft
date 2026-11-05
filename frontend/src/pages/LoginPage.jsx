import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Field, Input } from '../components/ui';
import { getErrorMessage, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthShell, PasswordInput } from './RegisterPage';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back.');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Log in" subtitle="Continue to your dashboard and saved analyses.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} show={show} onToggle={() => setShow((value) => !value)} />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">Log in</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">New here? <Link className="font-semibold text-primary" to="/register">Create an account</Link></p>
    </AuthShell>
  );
}
