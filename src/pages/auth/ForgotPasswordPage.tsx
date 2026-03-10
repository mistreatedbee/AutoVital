import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, ArrowLeftIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };
  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
      submitted ?
      'Check your email for reset instructions.' :
      "Enter your email address and we'll send you a link to reset your password."
      }>

      {!submitted ?
      <form onSubmit={handleSubmit} className="space-y-5">
          <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<MailIcon className="w-5 h-5" />}
          required />

          <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}>

            Send Reset Link
          </Button>
        </form> :

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-primary-800 text-sm mb-6">
          We've sent an email to your address with instructions to reset your
          password. Please check your spam folder if you don't see it.
        </div>
      }

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">

          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to log in
        </Link>
      </div>
    </AuthLayout>);

}