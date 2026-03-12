import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CarIcon,
  TrendingUpIcon,
  ActivityIcon,
  ServerIcon,
  WifiIcon,
  DatabaseIcon,
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
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { chartColors, cssVarHsl } from '../../lib/tokens';
import { formatCurrencyZAR } from '../../lib/formatters';
import {
  fetchAdminDashboardData,
  fetchAdminDashboardMetrics,
  fetchAdminRevenueByMonth,
  fetchAdminSignupsByDay,
  type AdminDashboardMetrics,
  type RevenueByMonthPoint,
  type SignupsByDayPoint,
} from '../../services/adminMetrics';
import {
  fetchPlatformHealth,
  runHealthProbe,
  getUptimeFromProbes,
  getAvgLatencyFromProbes,
  type PlatformHealthMetrics,
} from '../../services/platformHealth';
import { fetchAuditLogs, type AuditLogEntry } from '../../services/auditLog';
import { generateAdminReport } from '../../services/adminReports';
import { useAuth } from '../../auth/AuthProvider';
import { auditReportGenerated } from '../../lib/auditEvents';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';

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

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    'user.signup': 'New user registered',
    'user.email_verified': 'Email verified',
    'user.login': 'User logged in',
    'user.login_failed': 'Failed login attempt',
    'user.status_updated': 'User status updated',
    'user.flagged': 'User flagged',
    'plan.created': 'Plan created',
    'plan.updated': 'Plan updated',
    'template.updated': 'Template updated',
    'report.generated': 'Report generated',
    'organization.created': 'Organization created',
  };
  return labels[action] ?? action;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>(emptyMetrics);
  const [reportLoading, setReportLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByMonthPoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [signupData, setSignupData] = useState<SignupsByDayPoint[]>([]);
  const [signupLoading, setSignupLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState<AuditLogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealthMetrics | null>(null);
  const [healthProbeTick, setHealthProbeTick] = useState(0);

  const loadDashboard = useCallback(async () => {
    setMetricsLoading(true);
    setRevenueLoading(true);
    setSignupLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboardData();
      if (data) {
        if (data.metrics) setMetrics(data.metrics);
        else setMetrics(emptyMetrics);
        setRevenueData(data.revenue ?? []);
        setSignupData(data.signups ?? []);
        setPlatformHealth(data.platformHealth ?? null);
      } else {
        const [m, revenue, signups] = await Promise.all([
          fetchAdminDashboardMetrics(),
          fetchAdminRevenueByMonth(6),
          fetchAdminSignupsByDay(7),
        ]);
        setMetrics(m);
        setRevenueData(revenue);
        setSignupData(signups);
        const ph = await fetchPlatformHealth();
        setPlatformHealth(ph);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load admin dashboard', err);
      setError('We could not load admin metrics right now. Please try again.');
    } finally {
      setMetricsLoading(false);
      setRevenueLoading(false);
      setSignupLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const result = await fetchAuditLogs({ limit: 20, pageSize: 20 });
      setActivityFeed(result.items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load activity feed', err);
      setActivityFeed([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    const interval = setInterval(() => void loadDashboard(), 60_000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  useEffect(() => {
    const runProbe = async () => {
      await runHealthProbe();
      setHealthProbeTick((t) => t + 1);
    };
    void runProbe();
    const interval = setInterval(runProbe, 30_000);
    return () => clearInterval(interval);
  }, []);

  const revenueChartData = revenueData.map((r) => ({
    month: r.monthLabel,
    revenue: r.revenueCents,
  }));
  const lastMonthRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1]?.revenueCents ?? 0 : 0;
  const prevMonthRevenue = revenueData.length > 1 ? revenueData[revenueData.length - 2]?.revenueCents ?? 0 : 0;
  const revenueGrowthPct = prevMonthRevenue > 0 ? Math.round(((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  const signupChartData = signupData.map((s) => ({
    day: s.dayLabel,
    users: s.signupCount,
  }));
  const avgSignupsPerDay = signupData.length > 0
    ? Math.round(
        signupData.reduce((sum, s) => sum + s.signupCount, 0) / signupData.length,
      )
    : 0;

  const uptimePct = getUptimeFromProbes();
  const avgLatencyMs = getAvgLatencyFromProbes();

  const handleGenerateReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const blob = await generateAdminReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autovital-admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await auditReportGenerated(
        { userId: user?.id ?? null, email: user?.email ?? null },
        { reportType: 'admin_csv' }
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Report generation failed', err);
    } finally {
      setReportLoading(false);
    }
  }, [user?.id, user?.email]);

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
          <Link to="/admin/audit-logs">
            <Button
              variant="secondary"
              icon={<ActivityIcon className="w-4 h-4" />}>System Logs
            </Button>
          </Link>
          <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30 border-none"
            loading={reportLoading}
            onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>
      </div>

      {metricsLoading && (
        <LoadingState label="Loading admin metrics..." className="py-6" />
      )}

      {error && !metricsLoading && (
        <ErrorState
          title="Admin metrics are unavailable"
          description={error}
          onRetry={() => void loadDashboard()}
          className="max-w-3xl"
        />
      )}

      {/* Platform Metrics */}
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

      {/* Reminders & Alerts */}
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
        <p className="text-xs text-muted-foreground mb-3">
          Live API uptime and response times from health probes; error rates from audit logs (24h).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <ServerIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">API Uptime</p>
              <p className="text-lg font-bold text-slate-900">
                {uptimePct != null ? `${uptimePct}%` : healthProbeTick > 0 ? 'Measuring…' : '—'}
              </p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <WifiIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Response</p>
              <p className="text-lg font-bold text-slate-900">
                {avgLatencyMs != null ? `${avgLatencyMs}ms` : healthProbeTick > 0 ? 'Measuring…' : '—'}
              </p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <DatabaseIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logins (24h)</p>
              <p className="text-lg font-bold text-slate-900">
                {platformHealth != null ? platformHealth.successfulLogins24h.toLocaleString() : '—'}
              </p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Login Error Rate</p>
              <p className="text-lg font-bold text-slate-900">
                {platformHealth != null ? `${platformHealth.loginErrorRatePct}%` : '—'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Revenue Growth</h2>
              <p className="text-sm text-slate-500">
                Monthly recurring revenue (ZAR) from active subscriptions.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-rose-600 font-heading tracking-tight">
                {revenueLoading ? '...' : formatCurrencyZAR(lastMonthRevenue)}
              </p>
              {!revenueLoading && revenueData.length > 1 && (
                <p className={`text-sm font-medium flex items-center justify-end gap-1 ${revenueGrowthPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <TrendingUpIcon className={`w-4 h-4 ${revenueGrowthPct < 0 ? 'rotate-180' : ''}`} />
                  {revenueGrowthPct >= 0 ? '+' : ''}{revenueGrowthPct}% vs prev
                </p>
              )}
            </div>
          </div>
          <div className="h-64 w-full">
            {revenueLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading...</div>
            ) : revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No revenue data yet"
                  description="Revenue will appear once you have active subscriptions."
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary()} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartColors.primary()} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cssVarHsl('--border', '214 32% 91%')} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => formatCurrencyZAR(value)}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: `1px solid ${cssVarHsl('--border', '214 32% 91%')}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 600 }}
                    formatter={(value: number) => [formatCurrencyZAR(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={chartColors.primary()} strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">User Signups</h2>
              <p className="text-sm text-slate-500">New registrations by day (last 7 days).</p>
            </div>
            {!signupLoading && signupData.length > 0 && (
              <Badge variant="primary" className="bg-blue-50 text-blue-700 border-blue-200">
                Avg: {avgSignupsPerDay}/day
              </Badge>
            )}
          </div>
          <div className="h-64 w-full">
            {signupLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading...</div>
            ) : signupChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No signup data yet"
                  description="Signups will appear as users register."
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cssVarHsl('--border', '214 32% 91%')} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: cssVarHsl('--muted-foreground', '215 16% 47%'), fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: `1px solid ${cssVarHsl('--border', '214 32% 91%')}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 600 }}
                    cursor={{ fill: cssVarHsl('--muted', '210 40% 96%') }}
                  />
                  <Bar dataKey="users" fill={chartColors.accent()} radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-slate-900 font-heading">Admin Activity Feed</h2>
          <Link to="/admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              View All
            </Button>
          </Link>
        </div>
        {activityLoading ? (
          <div className="p-10 bg-slate-50/40 flex items-center justify-center">
            <LoadingState label="Loading activity..." />
          </div>
        ) : activityFeed.length === 0 ? (
          <div className="p-10 bg-slate-50/40 flex items-center justify-center">
            <EmptyState
              title="No activity yet"
              description="Signups, logins, and admin actions will appear here once they occur."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activityFeed.slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{actionLabel(entry.action)}</p>
                  <p className="text-sm text-slate-500">
                    {entry.actorEmail ?? 'System'} • {new Date(entry.createdAt).toLocaleString('en-ZA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
