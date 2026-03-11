import React, { useEffect, useState } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  TrendingUpIcon,
  CarIcon,
  ArrowUpRightIcon,
  ActivityIcon,
  ServerIcon,
  DatabaseIcon,
  WifiIcon,
  AlertCircleIcon,
  BellIcon,
  MailCheckIcon,
  ClipboardCheckIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine } from
'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import { fetchAdminDashboardMetrics, type AdminDashboardMetrics } from '../../services/adminMetrics';
const revenueData = [
{
  month: 'Jan',
  revenue: 85000
},
{
  month: 'Feb',
  revenue: 92000
},
{
  month: 'Mar',
  revenue: 105000
},
{
  month: 'Apr',
  revenue: 112000
},
{
  month: 'May',
  revenue: 125000
},
{
  month: 'Jun',
  revenue: 142500
}];

const signupData = [
{
  day: 'Mon',
  users: 120
},
{
  day: 'Tue',
  users: 150
},
{
  day: 'Wed',
  users: 180
},
{
  day: 'Thu',
  users: 140
},
{
  day: 'Fri',
  users: 210
},
{
  day: 'Sat',
  users: 250
},
{
  day: 'Sun',
  users: 220
}];

const emptyMetrics: AdminDashboardMetrics = {
  newRegistrationsThisWeek: 0,
  verifiedCount: 0,
  unverifiedCount: 0,
  totalUsers: 0,
  onboardingCompletedCount: 0,
  onboardingCompletionRate: 0,
  vehiclesPerUser: 0,
  upcomingReminderCount: 0,
  overdueReminderCount: 0,
  totalVehicles: 0,
};

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>(emptyMetrics);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAdminDashboardMetrics()
      .then((m) => {
        if (!cancelled) setMetrics(m);
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time platform metrics and system health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<ActivityIcon className="w-4 h-4" />}>
            System Logs
          </Button>
          <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30 border-none">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Phase E: Admin Dashboard Metrics */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Platform Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <StatCard
            title="New Registrations"
            value={metricsLoading ? '...' : metrics.newRegistrationsThisWeek.toLocaleString()}
            change="This week"
            trend="neutral"
            accentColor="primary"
            icon={<UsersIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Verified"
            value={metricsLoading ? '...' : metrics.verifiedCount.toLocaleString()}
            change={`/ ${metrics.totalUsers}`}
            trend="neutral"
            accentColor="accent"
            icon={<MailCheckIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Unverified"
            value={metricsLoading ? '...' : metrics.unverifiedCount.toLocaleString()}
            trend="neutral"
            accentColor="warning"
            icon={<UsersIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Onboarding Rate"
            value={metricsLoading ? '...' : `${metrics.onboardingCompletionRate}%`}
            change="Complete"
            trend="neutral"
            accentColor="purple"
            icon={<ClipboardCheckIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Vehicles per User"
            value={metricsLoading ? '...' : metrics.vehiclesPerUser.toFixed(1)}
            trend="neutral"
            accentColor="primary"
            icon={<CarIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Total Vehicles"
            value={metricsLoading ? '...' : metrics.totalVehicles.toLocaleString()}
            trend="neutral"
            accentColor="accent"
            icon={<CarIcon className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Upcoming / Overdue Reminders */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Reminders & Alerts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            title="Upcoming Reminders"
            value={metricsLoading ? '...' : metrics.upcomingReminderCount.toLocaleString()}
            trend="neutral"
            accentColor="primary"
            icon={<BellIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Overdue Reminders"
            value={metricsLoading ? '...' : metrics.overdueReminderCount.toLocaleString()}
            trend={metrics.overdueReminderCount > 0 ? 'down' : 'neutral'}
            accentColor="warning"
            icon={<AlertCircleIcon className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Platform Health */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Platform Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <ServerIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                API Uptime
              </p>
              <p className="text-lg font-bold text-slate-900">99.99%</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <WifiIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Avg Response
              </p>
              <p className="text-lg font-bold text-slate-900">45ms</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <DatabaseIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Active Sessions
              </p>
              <p className="text-lg font-bold text-slate-900">1,240</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Error Rate
              </p>
              <p className="text-lg font-bold text-slate-900">0.02%</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Revenue Growth
              </h2>
              <p className="text-sm text-slate-500">Last 6 months MRR</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-rose-600 font-heading tracking-tight">
                $142.5k
              </p>
              <p className="text-sm font-medium text-emerald-500 flex items-center justify-end gap-1">
                <TrendingUpIcon className="w-4 h-4" /> +67% YTD
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{
                  top: 10,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>

                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary()} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColors.primary()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={cssVarHsl('--border', '214 32% 91%')} />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                    fontWeight: 500
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                    fontWeight: 500
                  }}
                  tickFormatter={(value) => `$${value / 1000}k`} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${cssVarHsl('--border', '214 32% 91%')}`,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontWeight: 600
                  }}
                  formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  'Revenue']
                  } />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartColors.primary()}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{
                    r: 6,
                    strokeWidth: 0
                  }} />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                User Signups
              </h2>
              <p className="text-sm text-slate-500">Last 7 days</p>
            </div>
            <Badge
              variant="primary"
              className="bg-blue-50 text-blue-700 border-blue-200">

              Avg: 181/day
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={signupData}
                margin={{
                  top: 10,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={cssVarHsl('--border', '214 32% 91%')} />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                    fontWeight: 500
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12,
                    fontWeight: 500
                  }} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${cssVarHsl('--border', '214 32% 91%')}`,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontWeight: 600
                  }}
                  cursor={{
                    fill: cssVarHsl('--muted', '210 40% 96%')
                  }} />

                <ReferenceLine y={181} stroke={cssVarHsl('--muted-foreground', '215 16% 47%')} strokeDasharray="3 3" />
                <Bar
                  dataKey="users"
                  fill={chartColors.accent()}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Live Activity Feed
            </h2>
            <Badge variant="warning" className="animate-pulse shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
              Live
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">

            View All
          </Button>
        </div>
        <div className="divide-y divide-slate-50 bg-slate-50/30">
          {[
          {
            user: 'Sarah Jenkins',
            action: 'upgraded to Pro Plan',
            time: 'Just now',
            icon: <ArrowUpRightIcon className="w-4 h-4 text-emerald-600" />,
            bg: 'bg-emerald-100 border-emerald-200'
          },
          {
            user: 'Michael Chen',
            action: 'created a new account',
            time: '2 mins ago',
            icon: <UsersIcon className="w-4 h-4 text-blue-600" />,
            bg: 'bg-blue-100 border-blue-200'
          },
          {
            user: 'FleetWorks Inc.',
            action: 'added 5 new vehicles',
            time: '15 mins ago',
            icon: <CarIcon className="w-4 h-4 text-indigo-600" />,
            bg: 'bg-indigo-100 border-indigo-200'
          },
          {
            user: 'System',
            action: 'processed 1,240 service reminders',
            time: '1 hour ago',
            icon: <BellIcon className="w-4 h-4 text-amber-600" />,
            bg: 'bg-amber-100 border-amber-200'
          }].
          map((item, i) =>
          <div
            key={i}
            className="flex items-center justify-between p-5 hover:bg-white transition-colors group cursor-pointer">

              <div className="flex items-center gap-4">
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${item.bg}`}>

                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-bold">{item.user}</span>{' '}
                    <span className="text-slate-600">{item.action}</span>
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
              <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity">

                Details
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>);

}