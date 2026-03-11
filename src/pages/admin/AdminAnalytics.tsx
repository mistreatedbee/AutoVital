import React from 'react';
import { DownloadIcon, BarChart3Icon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { chartColors, cssVarHsl } from '../../lib/tokens';
const retentionData = [
{
  month: 'Jan',
  rate: 95
},
{
  month: 'Feb',
  rate: 94
},
{
  month: 'Mar',
  rate: 96
},
{
  month: 'Apr',
  rate: 92
},
{
  month: 'May',
  rate: 95
},
{
  month: 'Jun',
  rate: 97
}];

const featureData = [
{
  name: 'Maintenance Log',
  value: 45
},
{
  name: 'Fuel Tracker',
  value: 25
},
{
  name: 'Document Storage',
  value: 20
},
{
  name: 'Reports',
  value: 10
}];

export function AdminAnalytics() {
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
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                User Retention Rate
              </h2>
              <p className="text-sm text-slate-500">
                Percentage of active users over time
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={retentionData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.border()} />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: cssVarHsl('--muted-foreground', '215 16% 47%'),
                    fontSize: 12
                  }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[80, 100]} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }} />

                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={chartColors.primary()}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: chartColors.primary()
                  }}
                  activeDot={{
                    r: 6
                  }} />

              </LineChart>
            </ResponsiveContainer>
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