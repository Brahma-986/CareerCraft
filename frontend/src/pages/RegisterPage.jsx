import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Card, Field, Input } from '../components/ui';
import { getErrorMessage, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created.');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start analyzing resumes and preparing for interviews.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Full name" error={errors.name}>
          <Input name="name" value={form.name} onChange={update} placeholder="Ava Shah" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input name="email" type="email" value={form.email} onChange={update} placeholder="you@email.com" />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput name="password" value={form.password} onChange={update} show={show} onToggle={() => setShow((value) => !value)} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <Input name="confirmPassword" type={show ? 'text' : 'password'} value={form.confirmPassword} onChange={update} />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">Create account</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">Already registered? <Link className="font-semibold text-primary" to="/login">Log in</Link></p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Card className="w-full max-w-md">
        <Link to="/" className="text-sm font-bold text-primary">CareerCraft</Link>
        <h1 className="mt-4 text-2xl font-bold text-heading">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
        {children}
      </Card>
    </div>
  );
}

export function PasswordInput({ show, onToggle, ...props }) {
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} {...props} />
      <button type="button" className="absolute right-3 top-2.5 text-muted" onClick={onToggle} aria-label="Toggle password visibility">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
