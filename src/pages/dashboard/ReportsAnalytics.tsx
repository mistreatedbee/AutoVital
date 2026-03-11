import React from 'react';
import { BarChart3Icon, DownloadIcon } from 'lucide-react';
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
  Legend } from
'recharts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { chartColors, cssVarHsl } from '../../lib/tokens';
const monthlyCosts = [
{
  name: 'Jan',
  Maintenance: 120,
  Fuel: 180
},
{
  name: 'Feb',
  Maintenance: 0,
  Fuel: 165
},
{
  name: 'Mar',
  Maintenance: 450,
  Fuel: 190
},
{
  name: 'Apr',
  Maintenance: 0,
  Fuel: 175
},
{
  name: 'May',
  Maintenance: 60,
  Fuel: 185
},
{
  name: 'Jun',
  Maintenance: 0,
  Fuel: 195
}];

const categoryData = [
{
  name: 'Fuel',
  value: 1090
},
{
  name: 'Repairs',
  value: 450
},
{
  name: 'Routine Maint.',
  value: 180
},
{
  name: 'Insurance',
  value: 600
}];

export function ReportsAnalytics() {
  const COLORS = [
    chartColors.primary(),
    chartColors.accent(),
    chartColors.muted(),
    cssVarHsl('--chart-4', '215 28% 83%'),
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your vehicle costs.
          </p>
        </div>
        <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />}>
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground font-heading mb-6">
            Cost Breakdown (YTD)
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
                  dataKey="value">

                  {categoryData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }} />

                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground font-heading mb-6">
            Monthly Spend by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyCosts}
                margin={{
                  top: 20,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.border()} />

                <XAxis
                  dataKey="name"
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
                  tickFormatter={(val) => `$${val}`} />

                <Tooltip
                  cursor={{
                    fill: cssVarHsl('--muted', '210 40% 96%')
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }} />

                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: '20px'
                  }} />

                <Bar
                  dataKey="Fuel"
                  stackId="a"
                  fill={chartColors.accent()}
                  radius={[0, 0, 4, 4]} />

                <Bar
                  dataKey="Maintenance"
                  stackId="a"
                  fill={chartColors.primary()}
                  radius={[4, 4, 0, 0]} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

}