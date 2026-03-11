import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import {
  enrollMfaFactor,
  verifyMfaFactor,
  setAdminMfaVerified,
} from '../../services/adminMfa';

export function AdminMfaSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setError(null);
    setLoading(true);
    try {
      const result = await enrollMfaFactor('Authenticator app');
      if (result) {
        setQrCode(result.totp?.qr_code ?? '');
        setSecret(result.totp?.secret ?? '');
        setFactorId(result.id);
        const { challengeMfaFactor } = await import('../../services/adminMfa');
        const cid = await challengeMfaFactor(result.id);
        if (cid) {
          setChallengeId(cid);
          setStep('verify');
        } else {
          setError('Could not create verification challenge.');
        }
      } else {
        setError('Enrollment failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA setup failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !factorId || !challengeId) return;
    setError(null);
    setLoading(true);
    try {
      const ok = await verifyMfaFactor(factorId, challengeId, code.trim());
      if (ok) {
        setAdminMfaVerified();
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'enroll') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Set up MFA</h1>
              <p className="text-sm text-slate-500">
                Required for admin access
              </p>
            </div>
          </div>
          <p className="text-slate-600 mb-6">
            Use an authenticator app (Google Authenticator, Authy, etc.) to add an extra layer of security.
          </p>
          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleEnroll}
            disabled={loading}
          >
            {loading ? 'Setting up…' : 'Start setup'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Verify your code</h1>
            <p className="text-sm text-slate-500">
              Enter the 6-digit code from your app
            </p>
          </div>
        </div>
        {qrCode && (
          <div className="mb-6 flex justify-center">
            <img src={qrCode} alt="QR code" className="w-48 h-48" />
          </div>
        )}
        {secret && !qrCode && (
          <p className="text-xs text-slate-500 mb-4 break-all font-mono">{secret}</p>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Input
            label="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="one-time-code"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying…' : 'Verify and continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
