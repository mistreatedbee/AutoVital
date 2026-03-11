import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthProvider';
import { bootstrapAccountAndProfile } from '../../lib/authBootstrap';
import {
  getPasswordStrength,
  getStrengthColor,
  getStrengthWidth,
  type PasswordStrength,
} from '../../lib/passwordStrength';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const {
    signUp,
    verifyEmail,
    resendVerificationEmail,
    error: authError,
  } = useAuth();

  const [phase, setPhase] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const strength: PasswordStrength = getPasswordStrength(password);

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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFormError(emailErr);
      return;
    }
    if (!name.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setFormError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
        marketingConsent,
      });

      if (result.requireEmailVerification) {
        setPhase('otp');
        setFormError(null);
      } else if (result.user) {
        await bootstrapAccountAndProfile(
          result.user.id,
          result.user.name || name.trim(),
          phone.trim() || undefined
        );
        navigate('/onboarding', { replace: true });
      }
    } catch {
      setFormError(authError ?? 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setFormError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      const verifiedUser = await verifyEmail({ email: email.trim(), otp: otp.trim() });
      await bootstrapAccountAndProfile(
        verifiedUser.id,
        verifiedUser.name || name.trim(),
        phone.trim() || undefined
      );
      navigate('/onboarding', { replace: true });
    } catch {
      setFormError(authError ?? 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setFormError(null);
    try {
      await resendVerificationEmail({ email: email.trim() });
      runResendCooldown();
    } catch {
      setFormError(authError ?? 'Failed to resend. Please try again.');
    }
  };

  if (phase === 'otp') {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}. Enter it below.`}
      >
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <Input
            label="Verification code"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            error={touched.otp && !otp ? 'Code is required' : undefined}
            onBlur={() => setTouched((t) => ({ ...t, otp: true }))}
          />
          {(formError || authError) && (
            <p className="text-sm text-rose-600">{formError || authError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            icon={!loading && <ShieldCheckIcon className="w-4 h-4" />}
          >
            Verify Email
          </Button>
          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="text-primary-600 hover:text-primary-500 disabled:text-slate-400"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend verification code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase('form');
                setOtp('');
              }}
              className="text-slate-600 hover:text-slate-800 text-left"
            >
              Change email address
            </button>
          </div>
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
      title="Create your account"
      subtitle="Start tracking your vehicle's health today. No credit card required."
    >
      <form onSubmit={handleSignUpSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          icon={<UserIcon className="w-5 h-5" />}
          error={touched.name && !name.trim() ? 'Full name is required' : undefined}
          required
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          icon={<MailIcon className="w-5 h-5" />}
          error={
            touched.email
              ? validateEmail(email) ?? undefined
              : undefined
          }
          required
        />
        <Input
          label="Mobile number (optional)"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<PhoneIcon className="w-5 h-5" />}
        />
        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            icon={<LockIcon className="w-5 h-5" />}
            error={
              touched.password && password && password.length < 8
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
              <p className="text-xs text-slate-500 mt-1 capitalize">{strength}</p>
            </div>
          )}
        </div>
        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
          icon={<LockIcon className="w-5 h-5" />}
          error={
            touched.confirmPassword && confirmPassword && password !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
          required
        />

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-600">
              I agree to the{' '}
              <Link to="/terms" className="underline hover:text-slate-800">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-slate-800">
                Privacy Policy
              </Link>{' '}
              (required)
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-600">
              Send me tips, updates, and promotional emails (optional)
            </span>
          </label>
        </div>

        {(formError || authError) && (
          <p className="text-sm text-rose-600">{formError || authError}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
          icon={!loading && <ArrowRightIcon className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
