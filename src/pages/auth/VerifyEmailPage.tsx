import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheckIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
export function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="We sent a verification link to your email address.">

      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
          <MailCheckIcon className="w-8 h-8" />
        </div>
        <p className="text-center text-slate-600 mb-8">
          Click the link in the email to verify your account. If you don't see
          it, check your spam folder.
        </p>
        <div className="space-y-4 w-full">
          <Button variant="primary" className="w-full">
            Open Email App
          </Button>
          <Button variant="ghost" className="w-full">
            Resend Email
          </Button>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900">

          Back to log in
        </Link>
      </div>
    </AuthLayout>);

}