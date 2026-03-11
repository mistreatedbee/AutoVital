import React from 'react';
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
  BarChart3Icon,
  CheckCircle2Icon,
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
import { useAuth } from '../../auth/AuthProvider';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { useDashboardOverview } from '../../hooks/queries';

export function DashboardHome() {
  const { user } = useAuth();
  const { accountId, loading: accountLoading, error: accountError } = useAccount();
  const { data: overview, isLoading, error } = useDashboardOverview(accountId);

  const today = new Date().toLocaleDateString('en-US', {
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
  const monthlySpend = overview?.stats.monthlyCostTotal ?? 0;
  const expenseData = overview?.expenseSeries ?? [];

  const hasVehicles = (overview?.vehicles?.length ?? 0) > 0;
  const hasActivity = (overview?.activity?.length ?? 0) > 0;

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
        <Link
          to="/dashboard/reports"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group">

          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <BarChart3Icon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700 group-hover:text-slate-900">
            View Reports
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
            value={loadingState ? '—' : String(activeVehicles)}
            accentColor="primary"
            icon={<CarIcon className="w-6 h-6" />}
            sparklineData={[1, 1, 2, 2, 3, 3]}
            trend="up" />

          <StatCard
            title="Next Service Due"
            value={openAlerts > 0 ? `${openAlerts} alerts` : 'All clear'}
            change={openAlerts > 0 ? 'Action needed' : 'Nothing urgent'}
            trend="down"
            accentColor="warning"
            icon={<AlertTriangleIcon className="w-6 h-6" />}
            sparklineData={[30, 25, 20, 18, 15, 14]} />

          <StatCard
            title="Monthly Spend"
            value={loadingState ? '—' : `$${monthlySpend.toFixed(0)}`}
            change="Last 30 days • fuel, maintenance, billing"
            trend="up"
            accentColor="rose"
            icon={<DollarSignIcon className="w-6 h-6" />}
            sparklineData={[120, 85, 450, 95, 110, 320]} />

          <StatCard
            title="Avg Health Score"
            value="92%"
            change="Optimal"
            trend="up"
            accentColor="accent"
            icon={<ActivityIcon className="w-6 h-6" />}
            sparklineData={[85, 88, 87, 90, 91, 92]} />

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

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">
                  Resolved this month
                </span>
                <span className="text-slate-900 font-bold">3 of 5</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: '60%'
                  }}>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loadingState && (
                <LoadingState label="Loading alerts..." className="py-6" />
              )}

              {!loadingState && overview?.alerts.length === 0 && (
                <p className="text-sm text-slate-500">
                  No urgent alerts. You’re all caught up.
                </p>
              )}

              {!loadingState &&
                overview?.alerts.slice(0, 3).map((alert) => (
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
              {loadingState && (
                <LoadingState label="Loading recent activity..." className="py-6" />
              )}

              {!loadingState && !hasActivity && (
                <p className="text-sm text-slate-500">
                  No recent activity yet. Start by logging a service or fuel fill-up.
                </p>
              )}

              {!loadingState &&
                overview?.activity.map((item) => {
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
                    {loadingState ? '—' : `$${monthlySpend.toFixed(0)}`}
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
              {loadingState ? (
                <LoadingState label="Loading expense trend..." className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={expenseData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0
                  }}>

                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">

                        <stop offset="5%" stopColor="hsl(var(--primary) / 0.3)" stopOpacity={1} />
                        <stop offset="95%" stopColor="hsl(var(--primary) / 0)" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))" />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                      dy={10} />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                      tickFormatter={(value) => `$${value}`} />

                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontWeight: 600
                      }}
                      formatter={(value: number) => [
                      `$${value}`,
                      'Total Expense']
                      } />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      activeDot={{
                        r: 6,
                        strokeWidth: 0
                      }} />

                  </AreaChart>
                </ResponsiveContainer>
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
            {loadingState && (
              <LoadingState label="Loading vehicles..." />
            )}
            {!loadingState && !hasVehicles && (
              <p className="text-sm text-slate-500">
                No vehicles yet. Add your first vehicle to see it here.
              </p>
            )}
            {!loadingState && hasVehicles && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {overview?.vehicles.slice(0, 2).map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    hover
                    className="overflow-hidden border border-slate-200 group">
                    <div className="h-40 bg-slate-200 relative overflow-hidden">
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
                          <span className="text-slate-500">Status</span>
                          <span className="font-medium text-slate-900">
                            Tracked
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
      {error && !loadingState && (
        <div className="max-w-xl">
          <ErrorState
            title="Dashboard data failed to load"
            description={error instanceof Error ? error.message : 'Unknown error'}
          />
        </div>
      )}
      {accountError && (
        <div className="max-w-xl">
          <ErrorState title="Account not found" description={accountError} />
        </div>
      )}
    </div>
  );
}
