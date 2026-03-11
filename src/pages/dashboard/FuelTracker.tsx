import React, { useMemo, useState } from 'react';
import { PlusIcon, DropletIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatCard } from '../../components/ui/StatCard';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import {
  useFuelLogs,
  useFuelEfficiency,
  useCreateFuelLog,
} from '../../hooks/queries';
import { useVehicles } from '../../hooks/queries';
import type { EfficiencyPoint } from '../../services/fuel';
import {
  calculateFuelEfficiencyWithUnits,
  type CreateFuelLogInput,
} from '../../services/fuel';
import { fetchCurrentProfile } from '../../services/profile';
import { useAccount } from '../../account/AccountProvider';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { FuelTrackerSkeleton } from '../../components/states/pageSkeletons';
import { useAuth } from '../../auth/AuthProvider';
import { Input } from '../../components/ui/Input';

export function FuelTracker() {
  const { accountId, loading: accountLoading } = useAccount();
  const { user } = useAuth();
  const { data: efficiencyData = [], isLoading: efficiencyLoading } =
    useFuelEfficiency(accountId);
  const { data: fuelLogs = [], isLoading: fuelLogsLoading, isError: fuelLogsError, error: fuelLogsErr, refetch: refetchFuelLogs } =
    useFuelLogs(accountId);
  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useVehicles(accountId);
  const createMutation = useCreateFuelLog(accountId);
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchCurrentProfile(user!.id),
    enabled: !!user?.id,
  });
  const measurementSystem = profile?.measurementSystem ?? 'imperial';
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicleId, setVehicleId] = useState('');
  const [fillDate, setFillDate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [volume, setVolume] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  const columns = [
    {
      key: 'date',
      header: 'Date',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
    },
    {
      key: 'gallons',
      header: measurementSystem === 'imperial' ? 'Gallons (US)' : 'Liters',
    },
    {
      key: 'cost',
      header: 'Total Cost',
    },
    {
      key: 'ppg',
      header: measurementSystem === 'imperial' ? 'Price/Gal' : 'Price/L',
    },
    {
      key: 'mileage',
      header: 'Odometer',
    },
  ];

  const efficiencyWithUnits = useMemo(
    () => calculateFuelEfficiencyWithUnits(efficiencyData, measurementSystem),
    [efficiencyData, measurementSystem],
  );

  const avgEfficiencyLabel = useMemo(() => {
    if (!efficiencyWithUnits.length) return '—';
    const avgMpg =
      efficiencyWithUnits.reduce((sum, p) => sum + p.mpg, 0) / efficiencyWithUnits.length;
    if (measurementSystem === 'imperial') {
      return `${avgMpg.toFixed(1)} MPG`;
    }
    const avgLPer100 =
      efficiencyWithUnits.reduce((sum, p) => sum + (p.lPer100km ?? 0), 0) /
      efficiencyWithUnits.length;
    const avgKmPerL =
      efficiencyWithUnits.reduce((sum, p) => sum + (p.kmPerL ?? 0), 0) /
      efficiencyWithUnits.length;
    return `${avgLPer100.toFixed(1)} L/100km (${avgKmPerL.toFixed(2)} km/L)`;
  }, [efficiencyWithUnits, measurementSystem]);

  const totalSpent30dLabel = useMemo(() => {
    if (!fuelLogs.length) return '—';
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 30);
    const totalCents = fuelLogs.reduce((sum, log) => {
      const d = new Date(log.date);
      if (d >= cutoff) {
        const numeric = Number(log.cost.replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(numeric)) {
          return sum + Math.round(numeric * 100);
        }
      }
      return sum;
    }, 0);
    if (totalCents === 0) return '$0.00';
    return `$${(totalCents / 100).toFixed(2)}`;
  }, [fuelLogs]);

  const avgPricePerUnitLabel = useMemo(() => {
    if (!fuelLogs.length) return '—';
    let totalCost = 0;
    let totalVolume = 0;
    fuelLogs.forEach((log) => {
      const cost = Number(log.cost.replace(/[^0-9.]/g, ''));
      const vol = Number(log.gallons);
      if (!Number.isNaN(cost) && !Number.isNaN(vol) && vol > 0) {
        totalCost += cost;
        totalVolume += vol;
      }
    });
    if (totalVolume === 0) return '$0.00';
    const price = totalCost / totalVolume;
    return `$${price.toFixed(2)}`;
  }, [fuelLogs]);

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.id,
        label: v.name,
      })),
    [vehicles],
  );

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!accountId || !user) return;

    if (!vehicleId || !fillDate || !volume || !totalCost) {
      setError('Vehicle, date, volume, and total cost are required.');
      return;
    }

    const volumeNumber = Number(volume);
    const costNumber = Math.round(Number(totalCost) * 100);
    if (Number.isNaN(volumeNumber) || volumeNumber <= 0) {
      setError('Volume must be a positive number.');
      return;
    }
    if (Number.isNaN(costNumber) || costNumber <= 0) {
      setError('Total cost must be a positive number.');
      return;
    }

    const odometerNumber =
      odometer.trim() !== '' ? Number(odometer.replace(/,/g, '')) : null;
    if (odometerNumber != null && (Number.isNaN(odometerNumber) || odometerNumber < 0)) {
      setError('Odometer must be a non-negative number.');
      return;
    }

    setError(null);

    try {
      const payload: CreateFuelLogInput = {
        accountId,
        vehicleId,
        userId: user.id,
        fillDate,
        odometer: odometerNumber,
        volume: volumeNumber,
        totalCostCents: costNumber,
        currency,
        notes: notes || null,
      };

      await createMutation.mutateAsync(payload);

      setFormOpen(false);
      setVehicleId('');
      setFillDate('');
      setOdometer('');
      setVolume('');
      setTotalCost('');
      setCurrency('USD');
      setNotes('');
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to save fuel log', err);
      setError(
        err instanceof Error ? err.message : 'Unable to save fuel record.',
      );
    }
  };

  const isLoading =
    accountLoading || efficiencyLoading || fuelLogsLoading || vehiclesLoading;

  if (isLoading) {
    return <FuelTrackerSkeleton />;
  }

  if (fuelLogsError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Fuel Tracker
          </h1>
          <p className="text-slate-500 mt-1">Monitor fuel efficiency and spending.</p>
        </div>
        <ErrorState
          title="Failed to load fuel data"
          description={fuelLogsErr instanceof Error ? fuelLogsErr.message : 'Unable to load fuel logs.'}
          onRetry={() => refetchFuelLogs()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Fuel Tracker
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor fuel efficiency and spending.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => {
            setFormOpen(true);
            setError(null);
          }}
        >
          Add Fuel Record
        </Button>
      </div>

      {formOpen && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">
            Add Fuel Record
          </h2>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle
                </label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicleOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Fill Date"
                type="date"
                value={fillDate}
                onChange={(e) => setFillDate(e.target.value)}
                required
              />
              <Input
                label={measurementSystem === 'imperial' ? 'Volume (gallons)' : 'Volume (liters)'}
                type="number"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                required
              />
              <Input
                label="Total Cost"
                type="number"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                required
              />
              <Input
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <Input
                label="Odometer"
                type="number"
                placeholder="68200"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </div>
            <Input
              label="Notes"
              placeholder="Short notes about this fill-up"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={createMutation.isPending}>
                Save Fuel Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Avg Fuel Efficiency"
          value={avgEfficiencyLabel}
          change=""
          trend="neutral"
          icon={<DropletIcon className="w-6 h-6" />} />

        <StatCard
          title="Total Spent (30d)"
          value={totalSpent30dLabel}
          change=""
          trend="neutral"
          icon={<DropletIcon className="w-6 h-6" />} />

        <StatCard
          title={measurementSystem === 'imperial' ? 'Avg Price/Gal' : 'Avg Price/L'}
          value={avgPricePerUnitLabel}
          trend="neutral"
          icon={<DropletIcon className="w-6 h-6" />} />

      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Efficiency Trend
          </h2>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
            <option>Last 6 Fill-ups</option>
            <option>Last 3 Months</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={efficiencyWithUnits}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.border()} />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                  }}
                  domain={['dataMin - 2', 'dataMax + 2']} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, _name, payload: any) => {
                    if (measurementSystem === 'imperial') {
                      return [`${value} MPG`, 'Efficiency'];
                    }
                    const point = payload?.payload as any;
                    if (point?.lPer100km != null && point?.kmPerL != null) {
                      return [
                        `${point.lPer100km.toFixed(1)} L/100km (${point.kmPerL.toFixed(
                          2,
                        )} km/L)`,
                        'Efficiency',
                      ];
                    }
                    return [`${value} MPG`, 'Efficiency'];
                  }} />

                <Line
                  type="monotone"
                  dataKey="mpg"
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
                  }} />

              </LineChart>
            </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Recent Fill-ups
          </h2>
        </div>
        {fuelLogs.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<DropletIcon className="w-16 h-16" />}
              title="No fuel logs yet"
              description="Track your first fill-up to see efficiency trends and costs over time."
              action={
                <Button
                  variant="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setFormOpen(true)}>
                  Add first fill-up
                </Button>
              }
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={fuelLogs}
            className="border-none rounded-none" />
        )}

      </Card>
    </div>);

}