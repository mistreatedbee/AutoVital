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
  CheckCircle2Icon } from
'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
const expenseData = [
{
  month: 'Jan',
  amount: 120
},
{
  month: 'Feb',
  amount: 85
},
{
  month: 'Mar',
  amount: 450
},
{
  month: 'Apr',
  amount: 95
},
{
  month: 'May',
  amount: 110
},
{
  month: 'Jun',
  amount: 320
}];

export function DashboardHome() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const hour = new Date().getHours();
  const greeting =
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600 mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {greeting}, Alex
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
            value="3"
            accentColor="primary"
            icon={<CarIcon className="w-6 h-6" />}
            sparklineData={[1, 1, 2, 2, 3, 3]}
            trend="up" />

          <StatCard
            title="Next Service Due"
            value="14 Days"
            change="Oil Change"
            trend="down"
            accentColor="warning"
            icon={<AlertTriangleIcon className="w-6 h-6" />}
            sparklineData={[30, 25, 20, 18, 15, 14]} />

          <StatCard
            title="Monthly Spend"
            value="$320"
            change="+12% vs last month"
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
              <Badge variant="warning" className="animate-pulse">
                2 Alerts
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
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <WrenchIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Oil Change Due</h4>
                  <p className="text-sm text-amber-700/80 mt-1 font-medium">
                    2018 Honda Civic • In 250 miles
                  </p>
                  <Button
                    variant="white"
                    size="sm"
                    className="mt-3 text-amber-700 hover:bg-amber-100 shadow-sm border border-amber-200">

                    Schedule Now
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900">
                    Registration Expiring
                  </h4>
                  <p className="text-sm text-rose-700/80 mt-1 font-medium">
                    2022 Tesla Model 3 • In 14 days
                  </p>
                  <Button
                    variant="white"
                    size="sm"
                    className="mt-3 text-rose-700 hover:bg-rose-100 shadow-sm border border-rose-200">

                    Renew Online
                  </Button>
                </div>
              </div>
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
              {[
              {
                title: 'Refueled',
                desc: 'Honda Civic • 12.4 gal • $45.20',
                date: 'Yesterday',
                icon: <FuelIcon className="w-4 h-4" />,
                color: 'text-accent-600 bg-accent-100'
              },
              {
                title: 'Tire Rotation',
                desc: 'Tesla Model 3 • $60.00',
                date: 'Oct 12',
                icon: <WrenchIcon className="w-4 h-4" />,
                color: 'text-primary-600 bg-primary-100'
              },
              {
                title: 'Document Uploaded',
                desc: 'Insurance Policy 2024',
                date: 'Oct 05',
                icon: <FileTextIcon className="w-4 h-4" />,
                color: 'text-purple-600 bg-purple-100'
              },
              {
                title: 'Resolved Alert',
                desc: 'Brake Inspection Completed',
                date: 'Sep 28',
                icon: <CheckCircle2Icon className="w-4 h-4" />,
                color: 'text-slate-600 bg-slate-200'
              }].
              map((item, i) =>
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">

                  <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>

                    {item.icon}
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
                      {item.desc}
                    </p>
                  </div>
                </div>
              )}
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
                    $1,180
                  </span>
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">
                    -12% vs last period
                  </Badge>
                </div>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 shadow-sm">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-72 w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle 1 */}
              <Card
                hover
                className="overflow-hidden border border-slate-200 group">

                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1561580125-028ee3bd62eb?q=80&w=800&auto=format&fit=crop"
                    alt="Tesla Model 3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="success"
                      className="shadow-sm backdrop-blur-md bg-white/95 font-bold">

                      98% Health
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-xl font-bold text-white font-heading tracking-tight">
                      2022 Tesla Model 3
                    </h3>
                    <p className="text-sm text-slate-200 font-medium">
                      24,500 mi • Electric
                    </p>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Last Service</span>
                      <span className="font-medium text-slate-900">
                        Oct 12, 2023
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Next Due</span>
                      <span className="font-bold text-slate-900">
                        Tire Rotation
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Est. Cost</span>
                      <span className="font-medium text-slate-900">$60.00</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/dashboard/vehicles/1" className="flex-1">
                      <Button variant="secondary" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Vehicle 2 */}
              <Card
                hover
                className="overflow-hidden border border-slate-200 group">

                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop"
                    alt="Honda Civic"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="warning"
                      className="shadow-sm backdrop-blur-md bg-white/95 font-bold">

                      82% Health
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-xl font-bold text-white font-heading tracking-tight">
                      2018 Honda Civic
                    </h3>
                    <p className="text-sm text-slate-200 font-medium">
                      68,200 mi • Gasoline
                    </p>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Last Service</span>
                      <span className="font-medium text-slate-900">
                        Sep 28, 2023
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Next Due</span>
                      <span className="font-bold text-amber-600">
                        Oil Change (Due)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Est. Cost</span>
                      <span className="font-medium text-slate-900">$85.00</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/dashboard/vehicles/2" className="flex-1">
                      <Button variant="secondary" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>);

}