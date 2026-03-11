import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MailIcon, LockIcon, ArrowRightIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setFormError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    signInWithPassword(trimmedEmail, trimmedPassword)
      .then(() => {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
      })
      .catch((err: any) => {
        const message: string = err?.message ?? 'Unable to sign in. Please try again.';
        setFormError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account.">

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon className="w-5 h-5" />}
          required />


        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500">

              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon className="w-5 h-5" />}
            required />

        </div>

        {formError && (
          <p className="text-sm text-rose-600">{formError}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
          icon={!loading && <ArrowRightIcon className="w-4 h-4" />}>

          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary-600 hover:text-primary-500">

            Sign up for free
          </Link>
        </p>
      </div>
    </AuthLayout>);

}