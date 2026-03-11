import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import {
  listMfaFactors,
  challengeMfaFactor,
  verifyMfaFactor,
  setAdminMfaVerified,
} from '../../services/adminMfa';

export function AdminMfaVerify() {
  const navigate = useNavigate();
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const factors = await listMfaFactors();
        if (isMounted && factors.length > 0) {
          setFactorId(factors[0].id);
          const cid = await challengeMfaFactor(factors[0].id);
          if (cid) setChallengeId(cid);
        }
      } catch {
        // ignore
      }
    })();
    return () => { isMounted = false; };
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const fid = factorId;
    if (!fid) {
      setError('Verification not ready. Please refresh.');
      return;
    }
    const cid = challengeId || await challengeMfaFactor(fid);
    if (!cid) {
      setError('Could not create challenge. Please try again.');
      return;
    }
    if (!challengeId) setChallengeId(cid);
    setError(null);
    setLoading(true);
    try {
      const ok = await verifyMfaFactor(fid, cid, code.trim());
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Verify MFA</h1>
            <p className="text-sm text-slate-500">
              Enter the code from your authenticator app
            </p>
          </div>
        </div>
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
            {loading ? 'Verifying…' : 'Verify'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
