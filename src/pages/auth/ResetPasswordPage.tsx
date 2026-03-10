import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1500);
  };
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords.">

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={<LockIcon className="w-5 h-5" />}
          required />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          icon={<LockIcon className="w-5 h-5" />}
          required />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}>

          Reset Password
        </Button>
      </form>
    </AuthLayout>);

}