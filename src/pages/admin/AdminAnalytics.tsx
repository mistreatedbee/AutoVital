import React, { useState, useMemo } from 'react';
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
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import { fetchOnboardingFunnel } from '../../services/onboardingAnalytics';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';

const featureData = [
  { name: 'Maintenance Log', value: 45 },
  { name: 'Fuel Tracker', value: 25 },
  { name: 'Document Storage', value: 20 },
  { name: 'Reports', value: 10 },
];

const RANGE_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

export function AdminAnalytics() {
  const [rangeDays, setRangeDays] = useState(30);
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - rangeDays);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [rangeDays]);

  const {
    data: funnel = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['onboarding-funnel', startDate, endDate],
    queryFn: () => fetchOnboardingFunnel(startDate, endDate),
  });

  const funnelChartData = useMemo(() => {
    if (!funnel) return [];
    return [
      { stage: 'Started', count: funnel.started, fill: chartColors.primary() },
      { stage: 'Step 1', count: funnel.step1Done, fill: chartColors.accent() },
      { stage: 'Step 2', count: funnel.step2Done, fill: cssVarHsl('--chart-3', '215 20% 65%') },
      { stage: 'Step 3', count: funnel.step3Done, fill: cssVarHsl('--chart-4', '215 28% 83%') },
      { stage: 'Step 4', count: funnel.step4Done, fill: chartColors.muted() },
      { stage: 'Completed', count: funnel.completed, fill: 'hsl(142, 76%, 36%)' },
    ];
  }, [funnel]);
  const COLORS = [
    chartColors.primary(),
    chartColors.accent(),
    cssVarHsl('--chart-3', '215 20% 65%'),
    cssVarHsl('--chart-4', '215 28% 83%'),
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Deep Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform usage, retention, and engagement metrics.
          </p>
        </div>
        <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />}>
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground font-heading">
                Onboarding Funnel
              </h2>
              <p className="text-sm text-muted-foreground">
                Signup to completion drop-off
              </p>
            </div>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {RANGE_OPTIONS.map((r) => (
                <option key={r.days} value={r.days}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-72 w-full">
            {isLoading ? (
              <LoadingState label="Loading onboarding funnel..." className="h-full" />
            ) : isError ? (
              <ErrorState
                title="Onboarding analytics failed to load"
                description={
                  error instanceof Error ? error.message : 'Please try again in a moment.'
                }
                onRetry={() => refetch()}
                className="h-full flex items-center justify-center"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={chartColors.border()}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    label={{ position: 'right', fill: cssVarHsl('--foreground', '215 25% 27%') }}
                  >
                    {funnelChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground font-heading">
                Feature Usage Breakdown
              </h2>
              <p className="text-sm text-muted-foreground">
                Most utilized platform features
              </p>
            </div>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={featureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">

                  {featureData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }} />

              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {featureData.map((entry, index) =>
            <div key={index} className="flex items-center gap-2 text-sm">
                <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index % COLORS.length]
                }}>
              </span>
                <span className="text-slate-600">{entry.name}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

}