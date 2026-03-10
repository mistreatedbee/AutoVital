import React, { useEffect, useState } from 'react';
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
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatCard } from '../../components/ui/StatCard';
import {
  fetchFuelEfficiency,
  fetchFuelLogs,
  type EfficiencyPoint,
  type FuelLogEntry,
} from '../../services/fuel';

export function FuelTracker() {
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyPoint[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchFuelEfficiency(), fetchFuelLogs()])
      .then(([eff, logs]) => {
        if (isMounted) {
          setEfficiencyData(eff);
          setFuelLogs(logs);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const columns = [
  {
    key: 'date',
    header: 'Date'
  },
  {
    key: 'vehicle',
    header: 'Vehicle'
  },
  {
    key: 'gallons',
    header: 'Gallons (US)'
  },
  {
    key: 'cost',
    header: 'Total Cost'
  },
  {
    key: 'ppg',
    header: 'Price/Gal'
  },
  {
    key: 'mileage',
    header: 'Odometer'
  }];

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
        <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />}>
          Add Fuel Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Avg Fuel Efficiency"
          value="29.0 MPG"
          change="+1.2 MPG"
          trend="up"
          icon={<DropletIcon className="w-6 h-6" />} />

        <StatCard
          title="Total Spent (30d)"
          value="$136.97"
          change="-$12.40"
          trend="down"
          icon={<DropletIcon className="w-6 h-6" />} />

        <StatCard
          title="Avg Price/Gal"
          value="$4.35"
          trend="neutral"
          icon={<DropletIcon className="w-6 h-6" />} />

      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Efficiency Trend (Honda Civic)
          </h2>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
            <option>Last 6 Fill-ups</option>
            <option>Last 3 Months</option>
          </select>
        </div>
        <div className="h-72 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              Loading fuel data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={efficiencyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0" />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                  domain={['dataMin - 2', 'dataMax + 2']} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value} MPG`, 'Efficiency']} />

                <Line
                  type="monotone"
                  dataKey="mpg"
                  stroke="#39D353"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#39D353',
                    strokeWidth: 2,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 6,
                  }} />

              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Recent Fill-ups
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-slate-500">Loading fuel history...</div>
        ) : (
          <DataTable
            columns={columns}
            data={fuelLogs}
            className="border-none rounded-none" />
        )}

      </Card>
    </div>);

}