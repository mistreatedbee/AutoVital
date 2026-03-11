import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LockIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthProvider';
import {
  getPasswordStrength,
  getStrengthColor,
  getStrengthWidth,
} from '../../lib/passwordStrength';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? searchParams.get('access_token') ?? '';

  const { resetPassword, exchangeResetPasswordToken, error: authError } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [step, setStep] = useState<'code' | 'password'>(tokenFromUrl ? 'password' : 'code');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Email is required');
      return;
    }
    if (!code.trim()) {
      setFormError('Please enter the 6-digit code from your email');
      return;
    }

    setLoading(true);
    try {
      const { token } = await exchangeResetPasswordToken({
        email: trimmedEmail,
        code: code.trim(),
      });
      setResetToken(token);
      setStep('password');
    } catch {
      setFormError(authError ?? 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (!resetToken) {
      setFormError('Reset token is missing. Please request a new reset link.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ newPassword: password, otp: resetToken });
      navigate('/login', { replace: true });
    } catch {
      setFormError(authError ?? 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  if (step === 'code') {
    return (
      <AuthLayout
        title="Enter verification code"
        subtitle="We sent a 6-digit code to your email. Enter it below."
      >
        <form onSubmit={handleCodeSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon className="w-5 h-5" />}
            required
          />
          <Input
            label="Verification code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
          {(formError || authError) && (
            <p className="text-sm text-rose-600">{formError || authError}</p>
          )}
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Continue
          </Button>
        </form>
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to log in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <form onSubmit={handlePasswordSubmit} className="space-y-5">
        <div className="space-y-1">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon className="w-5 h-5" />}
            error={
              password && password.length < 8
                ? 'Password must be at least 8 characters'
                : undefined
            }
            required
          />
          {password && (
            <div className="mt-1">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getStrengthColor(strength)} ${getStrengthWidth(strength)}`}
                />
              </div>
            </div>
          )}
        </div>
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<LockIcon className="w-5 h-5" />}
          error={
            confirmPassword && password !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
          required
        />
        {(formError || authError) && (
          <p className="text-sm text-rose-600">{formError || authError}</p>
        )}
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Reset Password
        </Button>
      </form>
      <div className="mt-8 text-center">
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to log in
        </Link>
      </div>
    </AuthLayout>
  );
}
