import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, ArrowLeftIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthProvider';

export function ForgotPasswordPage() {
  const { sendResetPasswordEmail, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const runResendCooldown = useCallback(() => {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendResetPasswordEmail({ email: trimmedEmail });
      setSubmitted(true);
      runResendCooldown();
    } catch {
      setFormError(authError ?? 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setFormError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setLoading(true);
    try {
      await sendResetPasswordEmail({ email: trimmedEmail });
      runResendCooldown();
    } catch {
      setFormError(authError ?? 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        submitted
          ? 'Check your email for reset instructions.'
          : "Enter your email address and we'll send you a link to reset your password."
      }
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon className="w-5 h-5" />}
            required
          />
          {(formError || authError) && (
            <p className="text-sm text-rose-600">{formError || authError}</p>
          )}
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      ) : (
        <>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-primary-800 text-sm mb-6">
            We&apos;ve sent an email to your address with instructions to reset your
            password. Please check your spam folder if you don&apos;t see it.
          </div>
          {(formError || authError) && (
            <p className="text-sm text-rose-600 mb-4">{formError || authError}</p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            loading={loading}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
          </Button>
        </>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to log in
        </Link>
      </div>
    </AuthLayout>
  );
}
