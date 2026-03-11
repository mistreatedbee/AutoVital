import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheckIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthProvider';
import { bootstrapAccountAndProfile } from '../../lib/authBootstrap';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? searchParams.get('otp') ?? '';

  const { verifyEmail, resendVerificationEmail, error: authError } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!tokenFromUrl);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!tokenFromUrl) return;

    let isMounted = true;
    setVerifying(true);
    setFormError(null);

    verifyEmail({ otp: tokenFromUrl })
      .then((verifiedUser) => {
        if (!isMounted) return;
        return bootstrapAccountAndProfile(
          verifiedUser.id,
          verifiedUser.name || 'User',
          undefined,
          { userAgent: navigator.userAgent, marketingConsent: false }
        );
      })
      .then(() => {
        if (isMounted) navigate('/onboarding', { replace: true });
      })
      .catch((err) => {
        if (!isMounted) return;
        setFormError(err?.message ?? authError ?? 'Invalid or expired verification link.');
        setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tokenFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const runResendCooldown = () => {
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
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Please enter your email address to resend');
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      await resendVerificationEmail({ email: trimmedEmail });
      runResendCooldown();
    } catch {
      setFormError(authError ?? 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthLayout
        title="Verifying your email"
        subtitle="Please wait while we verify your email address."
      >
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <MailCheckIcon className="w-8 h-8" />
          </div>
          <p className="text-center text-slate-600">Verifying...</p>
          {formError && <p className="text-sm text-rose-600 mt-4">{formError}</p>}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle="We sent a verification link to your email address."
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
          <MailCheckIcon className="w-8 h-8" />
        </div>
        <p className="text-center text-slate-600 mb-8">
          Click the link in the email to verify your account. If you don&apos;t see it,
          check your spam folder.
        </p>
        <div className="space-y-4 w-full">
          <Input
            label="Email address (to resend)"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon className="w-5 h-5" />}
          />
          {(formError || authError) && (
            <p className="text-sm text-rose-600">{formError || authError}</p>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            loading={loading}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </Button>
          <Link to="/signup" className="block w-full">
            <Button variant="ghost" className="w-full">
              Change email address
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to log in
        </Link>
      </div>
    </AuthLayout>
  );
}
