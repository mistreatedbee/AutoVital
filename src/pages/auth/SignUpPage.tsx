import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, ArrowRightIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
export function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding');
    }, 1500);
  };
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your vehicle's health today. No credit card required.">

      <form onSubmit={handleSignUp} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<UserIcon className="w-5 h-5" />}
          required />


        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<MailIcon className="w-5 h-5" />}
          required />


        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          icon={<LockIcon className="w-5 h-5" />}
          required />


        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
          icon={!loading && <ArrowRightIcon className="w-4 h-4" />}>

          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 mb-6">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-slate-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-slate-700">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500">

            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>);

}