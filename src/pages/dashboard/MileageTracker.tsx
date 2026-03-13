import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAccount } from '../../account/AccountProvider';
import { useAuth } from '../../auth/AuthProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchAccountVehicles, type VehicleSummary } from '../../services/vehicles';
import {
  fetchVehicleMileageHistory,
  createMileageLog,
  updateVehicleCurrentMileageIfHigher,
  type MileageHistoryPoint,
} from '../../services/mileage';
import { fetchCurrentProfile } from '../../services/profile';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import { validateOdometerKm } from '../../lib/validation';

export function MileageTracker() {
  const { accountId, loading: accountLoading, error: accountError, refresh } = useAccount();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [history, setHistory] = useState<MileageHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [measurementSystem, setMeasurementSystem] = useState<'imperial' | 'metric'>('imperial');
  const [logDate, setLogDate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountLoading) return;
    if (!accountId || !user) {
      setVehicles([]);
      setSelectedVehicleId('');
      setHistory([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([fetchAccountVehicles(accountId), fetchCurrentProfile(user.id)])
      .then(([vehsResult, profile]) => {
        if (!isMounted) return;
        const vehs = vehsResult.items;
        setVehicles(vehs);
        setSelectedVehicleId((current) => current || vehs[0]?.id || '');
        if (profile?.measurementSystem) {
          setMeasurementSystem(profile.measurementSystem);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load vehicles.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accountId, accountLoading, user]);

  useEffect(() => {
    if (!accountId || !selectedVehicleId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchVehicleMileageHistory(accountId, selectedVehicleId)
      .then((points) => {
        if (!isMounted) return;
        setHistory(points);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load mileage history.');
        setHistory([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accountId, selectedVehicleId]);

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.id,
        label: v.name,
      })),
    [vehicles],
  );

  const latestOdometer = history.length ? history[history.length - 1].odometer : null;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const latestKnownMileage =
    latestOdometer ??
    (selectedVehicle?.mileage != null
      ? Number(String(selectedVehicle.mileage).replace(/,/g, ''))
      : null);

  const distanceKmLast30d = useMemo(() => {
    if (!history.length) return null;
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 30);
    const recent = history.filter((p) => new Date(p.date) >= cutoff);
    if (recent.length < 2) return null;
    return recent[recent.length - 1].odometer - recent[0].odometer;
  }, [history]);

  const projectedAnnual = useMemo(() => {
    if (distanceKmLast30d == null) return null;
    return (distanceKmLast30d / 30) * 365;
  }, [distanceKmLast30d]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
    },
    {
      key: 'odometer',
      header: measurementSystem === 'imperial' ? 'Odometer (mi)' : 'Odometer (km)',
      render: (val: number) => val.toLocaleString(),
    },
    {
      key: 'source',
      header: 'Source',
    },
    {
      key: 'note',
      header: 'Note',
    },
  ];

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!accountId || !user || !selectedVehicleId) return;

    if (!logDate || !odometer) {
      setError('Date and odometer are required.');
      return;
    }

    const odoError = validateOdometerKm(odometer);
    if (odoError) {
      setError(odoError);
      return;
    }
    const odometerNumber = Number(odometer.replace(/,/g, ''));

    setSaving(true);
    setError(null);

    try {
      const mileageLog = await createMileageLog({
        accountId,
        vehicleId: selectedVehicleId,
        userId: user.id,
        logDate,
        odometer: odometerNumber,
        source: 'manual',
        note: note || null,
      });

      if (mileageLog) {
        await updateVehicleCurrentMileageIfHigher(
          accountId,
          selectedVehicleId,
          odometerNumber,
        );
      }

      const refreshed = await fetchVehicleMileageHistory(accountId, selectedVehicleId);
      setHistory(refreshed);
      setLogDate('');
      setOdometer('');
      setNote('');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to save mileage log', err);
      setError(err?.message ?? 'Unable to save mileage log.');
    } finally {
      setSaving(false);
    }
  };

  if (!accountId || !user) {
    return (
      <ErrorState
        title="Account not ready"
        description={accountError ?? 'We could not resolve your account for mileage tracking yet.'}
        onRetry={() => refresh()}
      />
    );
  }

  if (accountLoading || loading) {
    return <LoadingState label="Loading mileage data..." />;
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={<ActivityIcon className="w-16 h-16" />}
        title="No vehicles available"
        description="Add a vehicle first, then you can log and chart mileage readings here."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Mileage Tracker
          </h1>
          <p className="text-slate-500 mt-1">
            Track odometer history and daily driving for each vehicle.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vehicle
          </label>
          <select
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            {vehicleOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Current Odometer"
          value={
            latestKnownMileage != null
              ? `${latestKnownMileage.toLocaleString()} ${
                  measurementSystem === 'imperial' ? 'mi' : 'km'
                }`
              : '—'
          }
          icon={<ActivityIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Kilometers Driven (30d)"
          value={
            distanceKmLast30d != null
              ? distanceKmLast30d.toFixed(0)
              : '—'
          }
          icon={<ActivityIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Projected Annual Mileage"
          value={
            projectedAnnual != null
              ? projectedAnnual.toFixed(0)
              : '—'
          }
          icon={<ActivityIcon className="w-6 h-6" />}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Odometer History
          </h2>
        </div>
        <div className="h-72 w-full">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <EmptyState
                icon={<ActivityIcon className="w-16 h-16" />}
                title="No mileage history yet"
                description={
                  latestKnownMileage != null
                    ? `Current vehicle mileage is ${latestKnownMileage.toLocaleString()} ${measurementSystem === 'imperial' ? 'mi' : 'km'}. Add your first log below to start history tracking.`
                    : 'Add your first odometer reading below to start tracking.'
                }
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.border()}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} ${
                      measurementSystem === 'imperial' ? 'mi' : 'km'
                    }`,
                    'Odometer',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="odometer"
                  stroke={chartColors.accent()}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: chartColors.accent(),
                    strokeWidth: 2,
                    stroke: cssVarHsl('--card', '0 0% 100%'),
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Mileage History
              </h2>
            </div>
            <DataTable columns={columns} data={history} />
          </Card>
        </div>
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">
              Quick Add Reading
            </h2>
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                required
              />
              <Input
                label={measurementSystem === 'imperial' ? 'Odometer (mi)' : 'Odometer (km)'}
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                required
              />
              <Input
                label="Note"
                placeholder="Optional note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button type="submit" variant="primary" loading={saving} className="w-full">
                Save Reading
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

