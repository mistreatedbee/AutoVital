import React, { useEffect, useState } from 'react';
import {
  BellIcon,
  SettingsIcon,
  AlertTriangleIcon,
  CheckCircle2Icon } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import {
  fetchUserAlerts,
  updateAlertStatus,
  fetchAlertPreferences,
  upsertAlertPreference,
  type UserAlert,
  type AlertPreference,
} from '../../services/alerts';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { useAuth } from '../../auth/AuthProvider';

export function AlertsReminders() {
  const { accountId, loading: accountLoading } = useAccount();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<AlertPreference[] | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let isMounted = true;

    Promise.all([
      fetchUserAlerts(accountId),
      fetchAlertPreferences(user?.id ?? null, accountId),
    ])
      .then(([data, prefs]) => {
        if (!isMounted) return;
        setAlerts(data);
        setPreferences(prefs);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  const handleDismiss = (alertId: string | number) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, status: 'resolved' } : a,
      ),
    );
    void updateAlertStatus(alertId, 'dismissed');
  };

  const emailPrefEnabled =
    preferences?.find((p) => p.channel === 'email')?.enabled ?? true;
  const inAppPrefEnabled =
    preferences?.find((p) => p.channel === 'in_app')?.enabled ?? true;

  const handleToggleChannel = async (
    channel: 'email' | 'in_app',
    value: 'Off' | 'On',
  ) => {
    if (!accountId || !user) return;
    setSavingPrefs(true);
    try {
      await upsertAlertPreference({
        userId: user.id,
        accountId,
        channel,
        enabled: value === 'On',
      });
      const updated = await fetchAlertPreferences(user.id, accountId);
      setPreferences(updated);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Alerts & Reminders
          </h1>
          <p className="text-slate-500 mt-1">
            Stay on top of your vehicle's needs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Active Alerts
              </h2>
              <Badge variant="warning">
                {openAlerts.length}
                {' '}
                Action Required
              </Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {accountLoading || loading && (
                <div className="p-6">
                  <LoadingState label="Loading alerts..." />
                </div>
              )}
              {!accountLoading && !loading &&
                openAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-6 flex gap-4 hover:bg-slate-50 transition-colors">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        alert.severity === 'critical'
                          ? 'bg-primary-50 text-primary-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                      {alert.severity === 'critical' ? (
                        <AlertTriangleIcon className="w-6 h-6" />
                      ) : (
                        <SettingsIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900">
                          {alert.title}
                        </h3>
                        {alert.meta && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            {alert.meta}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1">
                        {alert.description}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button className="text-sm font-medium text-primary-600 hover:underline">
                          Log Service
                        </button>
                        <button
                          className="text-sm font-medium text-slate-500 hover:underline"
                          onClick={() => handleDismiss(alert.id)}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Recently Resolved
              </h2>
            </div>
            <div className="divide-y divide-slate-100 opacity-70">
              {resolvedAlerts.length === 0 && !loading && (
                <div className="p-6 text-slate-500">
                  No resolved alerts yet.
                </div>
              )}
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-through">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 font-heading mb-6 flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-slate-400" />
              Notification Settings
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900">
                    Email Alerts
                  </span>
                  <Toggle
                    options={['Off', 'On']}
                    value={emailPrefEnabled ? 'On' : 'Off'}
                    onChange={(val) => handleToggleChannel('email', val as 'Off' | 'On')}
                    disabled={savingPrefs}
                  />

                </div>
                <p className="text-sm text-slate-500">
                  Receive summaries and urgent alerts via email.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900">
                    In-App Notifications
                  </span>
                  <Toggle
                    options={['Off', 'On']}
                    value={inAppPrefEnabled ? 'On' : 'Off'}
                    onChange={(val) => handleToggleChannel('in_app', val as 'Off' | 'On')}
                    disabled={savingPrefs}
                  />

                </div>
                <p className="text-sm text-slate-500">
                  Show badges and alerts within the dashboard.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Advance Notice
                </label>
                <select className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
                  <option>14 days / 500 miles before</option>
                  <option>30 days / 1,000 miles before</option>
                  <option>7 days / 250 miles before</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}