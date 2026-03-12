import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CarIcon,
  WrenchIcon,
  DollarSignIcon,
  ActivityIcon,
  PlusIcon,
  FuelIcon,
  AlertTriangleIcon,
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../auth/AuthProvider';
import { useAccount } from '../../account/AccountProvider';
import { ErrorState } from '../../components/states/ErrorState';
import { DashboardHomeSkeleton } from '../../components/states/pageSkeletons';
import { useDashboardOverview } from '../../hooks/queries';
import { formatCurrencyZAR } from '../../lib/formatters';

export function DashboardHome() {
  const { user } = useAuth();
  const { accountId, loading: accountLoading, error: accountError, refresh } = useAccount();
  const { data: overview, isLoading, error, refetch } = useDashboardOverview(accountId);

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const hour = new Date().getHours();
  const greeting =
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const loadingState = accountLoading || isLoading;

  const activeVehicles = overview?.stats.vehicleCount ?? 0;
  const openAlerts = overview?.stats.openAlertCount ?? 0;
  const monthlySpendCents = overview?.stats.monthlyCostTotal ?? 0;
  const expenseData = overview?.expenseSeries ?? [];
  const hasExpenseData = expenseData.some((point) => point.amount > 0);
  const expenseSparkline = expenseData.map((point) => point.amount);
  const hasExpenseTrend = expenseSparkline.length > 1;
  const monthlySpendTrend =
    hasExpenseTrend && expenseSparkline[expenseSparkline.length - 1] > expenseSparkline[expenseSparkline.length - 2]
      ? 'up'
      : hasExpenseTrend && expenseSparkline[expenseSparkline.length - 1] < expenseSparkline[expenseSparkline.length - 2]
        ? 'down'
        : 'neutral';

  const hasVehicles = (overview?.vehicles?.length ?? 0) > 0;
  const hasActivity = (overview?.activity?.length ?? 0) > 0;
  const [docPromptDismissed, setDocPromptDismissed] = useState(false);
  const showDocPrompt =
    hasVehicles &&
    !(overview?.documentProfileComplete ?? true) &&
    !docPromptDismissed;

  if (loadingState) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600 mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {greeting}
            {user?.email ? `, ${user.email}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your garage today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/vehicles">
            <Button variant="secondary" icon={<PlusIcon className="w-4 h-4" />}>
              Add Vehicle
            </Button>
          </Link>
          <Link to="/dashboard/maintenance">
            <Button variant="primary" icon={<WrenchIcon className="w-4 h-4" />}>
              Log Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Complete Vehicle Profile Prompt */}
      {showDocPrompt && (
        <Card className="p-5 border-l-4 border-l-primary-500 bg-primary-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 font-heading">Complete your vehicle profile</h3>
            <p className="text-sm text-slate-600 mt-1">
              Add insurance, registration, service invoices, and warranty docs to keep everything in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/dashboard/documents">
              <Button variant="primary" size="sm">
                Upload documents
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setDocPromptDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Dismiss"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/dashboard/maintenance"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all group">

          <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <WrenchIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700 group-hover:text-slate-900">
            Log Service
          </span>
        </Link>
        <Link
          to="/dashboard/mileage"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">

          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700 group-hover:text-slate-900">
            Update Mileage
          </span>
        </Link>
        <Link
          to="/dashboard/fuel"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-accent-300 hover:shadow-md transition-all group">

          <div className="w-10 h-10 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
            <FuelIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700 group-hover:text-slate-900">
            Add Fuel
          </span>
        </Link>
        <Link
          to="/dashboard/documents"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group">

          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <UploadCloudIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700 group-hover:text-slate-900">
            Upload Doc
          </span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Vehicles"
            value={String(activeVehicles)}
            accentColor="primary"
            icon={<CarIcon className="w-6 h-6" />} />

          <StatCard
            title="Next Service Due"
            value={openAlerts > 0 ? `${openAlerts} alerts` : 'All clear'}
            change={openAlerts > 0 ? 'Action needed' : 'Nothing urgent'}
            accentColor="warning"
            icon={<AlertTriangleIcon className="w-6 h-6" />}
          />

          <StatCard
            title="Monthly Spend"
            value={formatCurrencyZAR(monthlySpendCents)}
            change="Last 30 days • fuel, maintenance, billing"
            trend={monthlySpendTrend}
            accentColor="rose"
            icon={<DollarSignIcon className="w-6 h-6" />}
            sparklineData={expenseSparkline} />

          <StatCard
            title="Avg Health Score"
            value={overview?.stats.avgHealthScore != null ? `${Math.round(overview.stats.avgHealthScore)}%` : '—'}
            change={overview?.stats.avgHealthScore != null ? (overview.stats.avgHealthScore >= 80 ? 'Optimal' : 'Needs attention') : 'Add vehicles'}
            trend={
              overview?.stats.avgHealthScore != null
                ? overview.stats.avgHealthScore >= 80
                  ? 'up'
                  : 'down'
                : 'neutral'
            }
            accentColor="accent"
            icon={<ActivityIcon className="w-6 h-6" />} />

        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming & Alerts */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-6 border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Action Needed
              </h2>
              <Badge variant={openAlerts > 0 ? 'warning' : 'neutral'}>
                {openAlerts}
                {' '}
                Alerts
              </Badge>
            </div>

            <div className="space-y-4">
              {overview?.alerts.length === 0 && (
                <EmptyState
                  title="No urgent alerts"
                  description="Once alerts are configured, we’ll flag upcoming services, expiring documents, and critical issues here."
                  action={(
                    <Link to="/dashboard/alerts">
                      <Button variant="secondary">
                        Configure alerts
                      </Button>
                    </Link>
                  )}
                />
              )}

              {overview?.alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      {alert.severity === 'critical' ? (
                        <AlertTriangleIcon className="w-5 h-5" />
                      ) : (
                        <WrenchIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900">{alert.title}</h4>
                      <p className="text-sm text-amber-700/80 mt-1 font-medium">
                        {alert.description}
                      </p>
                      <Button
                        variant="white"
                        size="sm"
                        className="mt-3 text-amber-700 hover:bg-amber-100 shadow-sm border border-amber-200">
                        View details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Recent Activity
              </h2>
              <Link
                to="/dashboard/maintenance"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium">

                View All
              </Link>
            </div>
            <div className="space-y-4">
              {!hasActivity && (
                <EmptyState
                  title="No recent activity yet"
                  description="Log a service, add a fuel fill-up, or upload a document to see your latest garage activity here."
                  action={(
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link to="/dashboard/maintenance">
                        <Button variant="primary" size="sm">
                          Log a service
                        </Button>
                      </Link>
                      <Link to="/dashboard/fuel">
                        <Button variant="secondary" size="sm">
                          Add fuel entry
                        </Button>
                      </Link>
                    </div>
                  )}
                />
              )}

              {overview?.activity.map((item) => {
                  const icon =
                    item.kind === 'fuel'
                      ? <FuelIcon className="w-4 h-4" />
                      : item.kind === 'document'
                        ? <FileTextIcon className="w-4 h-4" />
                        : item.kind === 'alert'
                          ? <AlertTriangleIcon className="w-4 h-4" />
                          : <WrenchIcon className="w-4 h-4" />;

                  const color =
                    item.kind === 'fuel'
                      ? 'text-accent-600 bg-accent-100'
                      : item.kind === 'document'
                        ? 'text-purple-600 bg-purple-100'
                        : item.kind === 'alert'
                          ? 'text-rose-600 bg-rose-100'
                          : 'text-primary-600 bg-primary-100';

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {item.title}
                          </h4>
                          <span className="text-xs font-medium text-slate-400 shrink-0 ml-2">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Right Column - Charts & Vehicles */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Expense Trend
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {formatCurrencyZAR(monthlySpendCents)}
                  </span>
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">
                    Last 6 months
                  </Badge>
                </div>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 shadow-sm">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-72 w-full">
              {hasExpenseData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={expenseData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="hsl(var(--primary) / 0.3)" stopOpacity={1} />
                        <stop offset="95%" stopColor="hsl(var(--primary) / 0)" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      tickFormatter={(value) => formatCurrencyZAR(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontWeight: 600,
                      }}
                      formatter={(value: number) => [
                        formatCurrencyZAR(value),
                        'Total Expense',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      activeDot={{
                        r: 6,
                        strokeWidth: 0,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState
                    title="No spend history yet"
                    description="Log a service and add fuel entries to see your monthly spend trend over time."
                    action={(
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Link to="/dashboard/maintenance">
                          <Button variant="primary" size="sm">
                            Log a service
                          </Button>
                        </Link>
                        <Link to="/dashboard/fuel">
                          <Button variant="secondary" size="sm">
                            Add fuel entry
                          </Button>
                        </Link>
                      </div>
                    )}
                  />
                </div>
              )}
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Your Garage
              </h2>
              <Link
                to="/dashboard/vehicles"
                className="text-sm font-medium text-primary-600 hover:text-primary-700">

                Manage Vehicles
              </Link>
            </div>
            {!hasVehicles && (
              <EmptyState
                title="No vehicles yet"
                description="Add your first vehicle to start tracking health, services, alerts, and spend in one place."
                action={(
                  <Link to="/dashboard/vehicles/new">
                    <Button variant="primary">
                      Add your first vehicle
                    </Button>
                  </Link>
                )}
                className="py-10"
              />
            )}
            {hasVehicles && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {overview?.vehicles.slice(0, 2).map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    hover
                    className="overflow-hidden border border-slate-200 group">
                    <div
                      className="h-40 bg-slate-200 relative overflow-hidden"
                      style={
                        vehicle.heroImageUrl
                          ? { backgroundImage: `url(${vehicle.heroImageUrl})`, backgroundSize: 'cover' }
                          : undefined
                      }>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-bold text-white font-heading tracking-tight">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-slate-200 font-medium">
                          Vehicle
                        </p>
                      </div>
                    </div>
                    <div className="p-5 bg-white">
                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Health Score</span>
                          <span className="font-medium text-slate-900">
                            {vehicle.healthScore != null ? `${Math.round(vehicle.healthScore)}%` : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Next Service</span>
                          <span className="font-medium text-slate-900">
                            {vehicle.nextServiceDue || 'All clear'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/dashboard/vehicles/${vehicle.id}`} className="flex-1">
                          <Button variant="secondary" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="max-w-xl">
          <ErrorState
            title="Dashboard data failed to load"
            description={error instanceof Error ? error.message : 'Unknown error'}
            onRetry={() => refetch()}
          />
        </div>
      )}
      {accountError && (
        <div className="max-w-xl">
          <ErrorState title="Account not found" description={accountError} onRetry={() => refresh()} />
        </div>
      )}
    </div>
  );
}
