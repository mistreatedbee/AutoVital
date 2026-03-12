import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getUserConsents, updateMarketingConsent } from '../../services/consents';
import { changePassword, changeEmail } from '../../services/authSettings';
import { fetchCurrentProfile, updateProfile } from '../../services/profile';
import { queryKeys } from '../../lib/queryKeys';
import { useAuth } from '../../auth/AuthProvider';
import { useAccount } from '../../account/AccountProvider';
import { ReauthModal } from '../../components/auth/ReauthModal';
import {
  getPasswordStrength,
  getStrengthColor,
  getStrengthWidth,
} from '../../lib/passwordStrength';
import { validatePhoneWithSaHint } from '../../lib/validation';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

const CURRENCIES = [{ value: 'ZAR', label: 'ZAR (South African Rand)' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }];
const TIMEZONES = ['Africa/Johannesburg', 'Africa/Cairo', 'Europe/London', 'America/New_York', 'Asia/Dubai'];

export function ProfileSettings() {
  const { user, reauthWithPassword } = useAuth();
  const { accountId } = useAccount();
  const queryClient = useQueryClient();
  const [marketingLoading, setMarketingLoading] = useState(false);

  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<'password' | 'email' | null>(null);
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('ZA');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [timezone, setTimezone] = useState('Africa/Johannesburg');
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile.current(user?.id ?? ''),
    queryFn: () => fetchCurrentProfile(user!),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setPhone(profile.phoneNumber ?? '');
      setCountry(profile.country ?? 'ZA');
      setCity(profile.city ?? '');
      setProvince(profile.province ?? '');
      setPostalCode(profile.postalCode ?? '');
      setCurrency(profile.currency ?? 'ZAR');
      setTimezone(profile.timezone ?? 'Africa/Johannesburg');
      setMeasurementSystem(profile.measurementSystem ?? 'metric');
    }
  }, [profile]);

  const { data: consents, isLoading: consentsLoading } = useQuery({
    queryKey: queryKeys.consents.user(),
    queryFn: getUserConsents,
    enabled: !!user?.id,
  });

  const marketingMutation = useMutation({
    mutationFn: (granted: boolean) =>
      updateMarketingConsent(granted, typeof navigator !== 'undefined' ? navigator.userAgent : null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consents.user() });
      setMarketingLoading(false);
    },
    onError: () => setMarketingLoading(false),
  });

  const marketingConsent = consents?.find((c) => c.consent_type === 'marketing');
  const termsConsent = consents?.find((c) => c.consent_type === 'terms');
  const privacyConsent = consents?.find((c) => c.consent_type === 'privacy');

  const handleMarketingToggle = (checked: boolean) => {
    setMarketingLoading(true);
    marketingMutation.mutate(checked);
  };

  const handleReauthSuccess = (password: string) => {
    setVerifiedPassword(password);
  };

  const handlePasswordReauth = () => {
    setReauthMode('password');
    setReauthModalOpen(true);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleEmailReauth = () => {
    setReauthMode('email');
    setReauthModalOpen(true);
    setNewEmail('');
    setEmailError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPassword) return;
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(verifiedPassword, newPassword);
      setVerifiedPassword(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPassword || !user?.email) return;
    setEmailError(null);
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailError('Please enter a new email address');
      return;
    }
    if (trimmed === user.email) {
      setEmailError('New email must be different from current');
      return;
    }
    setEmailLoading(true);
    try {
      await changeEmail(verifiedPassword, trimmed);
      setVerifiedPassword(null);
      setNewEmail('');
    } catch (err: unknown) {
      setEmailError(
        err instanceof Error ? err.message : 'Failed to change email'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setProfileError(null);
    setProfileSaving(true);
    try {
      const ok = await updateProfile(user.id, {
        displayName: displayName.trim() || null,
        phoneNumber: phone.trim() || null,
        country: country || 'ZA',
        city: city.trim() || null,
        province: province.trim() || null,
        postalCode: postalCode.trim() || null,
        currency: currency || 'ZAR',
        timezone: timezone || 'Africa/Johannesburg',
        measurementSystem,
      });
      if (ok) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.current(user.id) });
        if (accountId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.fuel.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
        }
      } else {
        setProfileError('Failed to save profile.');
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and security.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Personal Information
        </h2>
        <div className="flex items-start gap-8 mb-8">
          <div className="flex flex-col items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />

            <Button variant="ghost" size="sm">
              Change Photo
            </Button>
          </div>
          <div className="flex-1 space-y-4">
            <Input
              label="Display Name"
              placeholder="e.g. Sipho"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div>
              <Input
                label="Email Address"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="bg-slate-50"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handleEmailReauth}
              >
                Change Email
              </Button>
              {reauthMode === 'email' && verifiedPassword && (
                <form
                  onSubmit={handleEmailSubmit}
                  className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3"
                >
                  <Input
                    label="New email address"
                    type="email"
                    placeholder="sipho@example.co.za"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    error={emailError ?? undefined}
                  />
                  {emailError && (
                    <p className="text-sm text-rose-600">{emailError}</p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={emailLoading}
                  >
                    Update Email
                  </Button>
                </form>
              )}
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+27 82 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(validatePhoneWithSaHint(e.target.value));
                }}
                error={phoneError ?? undefined}
              />
              <p className="text-xs text-slate-500 mt-1">Use full international format, e.g. +27 82 123 4567.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <Input
                label="City"
                placeholder="e.g. Johannesburg"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option value="">Select province</option>
                  <option value="EC">Eastern Cape</option>
                  <option value="FS">Free State</option>
                  <option value="GP">Gauteng</option>
                  <option value="KZN">KwaZulu-Natal</option>
                  <option value="LP">Limpopo</option>
                  <option value="MP">Mpumalanga</option>
                  <option value="NC">Northern Cape</option>
                  <option value="NW">North West</option>
                  <option value="WC">Western Cape</option>
                </select>
              </div>
              <Input
                label="Postal code"
                placeholder="e.g. 2000"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="ZA">South Africa</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Units</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={measurementSystem}
                  onChange={(e) => setMeasurementSystem(e.target.value as 'metric' | 'imperial')}
                >
                  <option value="metric">Metric (km, litres)</option>
                  <option value="imperial">Imperial (miles, gallons)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Default: Metric for South Africa.</p>
              </div>
            </div>
          </div>
        </div>
        {profileError && <p className="text-sm text-rose-600 mb-4">{profileError}</p>}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="primary" onClick={handleSaveProfile} loading={profileSaving}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Privacy & Consent
        </h2>
        {consentsLoading ? (
          <p className="text-sm text-slate-500">Loading consent history…</p>
        ) : consents && consents.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {termsConsent && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">
                    <Link to="/terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>
                    {' — '}
                    {termsConsent.granted ? 'Accepted' : 'Declined'} on{' '}
                    {formatDate(termsConsent.created_at)}
                  </span>
                </div>
              )}
              {privacyConsent && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">
                    <Link to="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                    {' — '}
                    {privacyConsent.granted ? 'Accepted' : 'Declined'} on{' '}
                    {formatDate(privacyConsent.created_at)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-700">
                  Marketing emails — {marketingConsent?.granted ? 'Opted in' : 'Opted out'}
                  {marketingConsent?.created_at && ` (${formatDate(marketingConsent.created_at)})`}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent?.granted ?? false}
                    onChange={(e) => handleMarketingToggle(e.target.checked)}
                    disabled={marketingLoading}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600">
                    {marketingLoading ? 'Updating…' : 'Send me tips and updates'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No consent records yet. Consent is recorded when you sign up.
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Change Password
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          You must confirm your current password before changing it.
        </p>
        {!verifiedPassword ? (
          <Button variant="secondary" onClick={handlePasswordReauth}>
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={
                  newPassword && newPassword.length < 8
                    ? 'Password must be at least 8 characters'
                    : undefined
                }
              />
              {newPassword && (
                <div className="mt-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getStrengthColor(strength)} ${getStrengthWidth(strength)}`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    {strength}
                  </p>
                </div>
              )}
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword && newPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
            />
            {passwordError && (
              <p className="text-sm text-rose-600">{passwordError}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                loading={passwordLoading}
              >
                Update Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setVerifiedPassword(null);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      <ReauthModal
        open={reauthModalOpen}
        onOpenChange={(open) => {
          setReauthModalOpen(open);
          if (!open) setReauthMode(null);
        }}
        onSuccess={handleReauthSuccess}
        title={
          reauthMode === 'password'
            ? 'Confirm your password'
            : reauthMode === 'email'
              ? 'Confirm your password'
              : 'Re-authenticate'
        }
        description="Enter your current password to continue with this action."
        verify={(password) =>
          reauthWithPassword(user?.email ?? '', password)
        }
      />

      <Card className="p-6 border-rose-200 bg-rose-50/30">
        <h2 className="text-lg font-bold text-rose-900 font-heading mb-2">
          Danger Zone
        </h2>
        <p className="text-rose-700 text-sm mb-6">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button
          variant="white"
          className="text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-none">

          Delete Account
        </Button>
      </Card>
    </div>);

}