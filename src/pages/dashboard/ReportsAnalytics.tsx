import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DownloadIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import { formatCurrencyZAR } from '../../lib/formatters';
import {
  fetchMonthlyCostTrends,
  fetchVehicleCostBreakdown,
  exportMonthlyCostTrendsToCsv,
  exportVehicleBreakdownToCsv,
  type MonthlyCostPoint,
  type VehicleCostBreakdown,
} from '../../services/reports';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { queryKeys } from '../../lib/queryKeys';

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-ZA', { month: 'short' });
}

export function ReportsAnalytics() {
  const { accountId, loading: accountLoading } = useAccount();

  const { data: monthlyData = [], isLoading: monthlyLoading, isError: monthlyError, error: monthlyErr } = useQuery({
    queryKey: queryKeys.reports.monthly(accountId ?? ''),
    queryFn: () => fetchMonthlyCostTrends(accountId!),
    enabled: !!accountId,
  });

  const { data: vehicleBreakdown = [], isLoading: vehicleLoading } = useQuery({
    queryKey: queryKeys.reports.vehicles(accountId ?? ''),
    queryFn: () => fetchVehicleCostBreakdown(accountId!),
    enabled: !!accountId,
  });

  const monthlyChartData = useMemo(() => {
    return monthlyData.slice(-6).map((p: MonthlyCostPoint) => ({
      name: monthLabel(p.month),
      Maintenance: p.maintenanceCents / 100,
      Fuel: p.fuelCents / 100,
      totalCents: p.totalCents,
    }));
  }, [monthlyData]);

  const categoryData = useMemo(() => {
    const totalFuel = monthlyData.reduce((s: number, p: MonthlyCostPoint) => s + p.fuelCents, 0);
    const totalMaint = monthlyData.reduce((s: number, p: MonthlyCostPoint) => s + p.maintenanceCents, 0);
    const items: { name: string; value: number }[] = [];
    if (totalFuel > 0) items.push({ name: 'Fuel (ZAR)', value: totalFuel });
    if (totalMaint > 0) items.push({ name: 'Maintenance (ZAR)', value: totalMaint });
    return items.length ? items : [{ name: 'No data', value: 1 }];
  }, [monthlyData]);

  const COLORS = [
    chartColors.primary(),
    chartColors.accent(),
    chartColors.muted(),
    cssVarHsl('--chart-4', '215 28% 83%'),
  ];

  const handleExportMonthly = () => {
    const blob = exportMonthlyCostTrendsToCsv(monthlyData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-costs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportVehicles = () => {
    const blob = exportVehicleBreakdownToCsv(vehicleBreakdown);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-cost-breakdown-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = accountLoading || monthlyLoading || vehicleLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Deep insights into your vehicle costs. All amounts in ZAR, distances in km.</p>
        </div>
        <LoadingState label="Loading reports..." />
      </div>
    );
  }

  if (monthlyError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Reports & Analytics
          </h1>
        </div>
        <ErrorState
          title="Failed to load reports"
          description={monthlyErr instanceof Error ? monthlyErr.message : 'Unable to load report data.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your vehicle costs. All amounts in ZAR, distances in km.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />} onClick={handleExportMonthly}>
            Export Monthly CSV
          </Button>
          <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />} onClick={handleExportVehicles}>
            Export Vehicle CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground font-heading mb-6">
            Cost Breakdown (ZAR)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrencyZAR(value), 'Amount (ZAR)']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground font-heading mb-6">
            Monthly Spend by Category (ZAR)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.border()}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12 }}
                  tickFormatter={(val) => formatCurrencyZAR(Math.round(val * 100))}
                />
                <Tooltip
                  cursor={{ fill: cssVarHsl('--muted', '210 40% 96%') }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [formatCurrencyZAR(Math.round(value * 100)), '']}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="Fuel" stackId="a" fill={chartColors.accent()} radius={[0, 0, 4, 4]} />
                <Bar dataKey="Maintenance" stackId="a" fill={chartColors.primary()} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground font-heading mb-6">
          Cost per Vehicle (ZAR, km)
        </h2>
        {vehicleBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8">No vehicle cost data yet. Add maintenance and fuel logs to see breakdowns.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                  <th className="text-right py-3 px-4 font-medium">Maintenance (ZAR)</th>
                  <th className="text-right py-3 px-4 font-medium">Fuel (ZAR)</th>
                  <th className="text-right py-3 px-4 font-medium">Total (ZAR)</th>
                  <th className="text-right py-3 px-4 font-medium">Distance (km)</th>
                  <th className="text-right py-3 px-4 font-medium">Cost/km (ZAR)</th>
                </tr>
              </thead>
              <tbody>
                {vehicleBreakdown.map((r: VehicleCostBreakdown) => (
                  <tr key={r.vehicleId} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">{r.vehicleName}</td>
                    <td className="text-right py-3 px-4">{formatCurrencyZAR(r.maintenanceCents)}</td>
                    <td className="text-right py-3 px-4">{formatCurrencyZAR(r.fuelCents)}</td>
                    <td className="text-right py-3 px-4">{formatCurrencyZAR(r.totalCents)}</td>
                    <td className="text-right py-3 px-4">{r.distanceKm != null ? r.distanceKm.toLocaleString() : '—'}</td>
                    <td className="text-right py-3 px-4">{r.costPerKmCents != null ? formatCurrencyZAR(r.costPerKmCents) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
