import React from 'react';
import { SearchIcon, FilterIcon, MoreVerticalIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
const vehicles = [
{
  id: 1,
  owner: 'Alex Thompson',
  make: 'Tesla',
  model: 'Model 3',
  year: 2022,
  vin: '5YJ3E1EA0NFXXXXXX',
  mileage: '24,500',
  health: 98
},
{
  id: 2,
  owner: 'Sarah Jenkins',
  make: 'Honda',
  model: 'Civic',
  year: 2018,
  vin: '2HGFC2F89JHXXXXXX',
  mileage: '68,200',
  health: 82
},
{
  id: 3,
  owner: 'Michael Chen',
  make: 'Ford',
  model: 'F-150',
  year: 2020,
  vin: '1FTEW1EP4LFDXXXXX',
  mileage: '45,100',
  health: 95
},
{
  id: 4,
  owner: 'Jessica Davis',
  make: 'Toyota',
  model: 'Camry',
  year: 2015,
  vin: '4T1BF1FK3FUXXXXXX',
  mileage: '112,000',
  health: 75
},
{
  id: 5,
  owner: 'David Wilson',
  make: 'BMW',
  model: '3 Series',
  year: 2021,
  vin: 'WBA5R1C52MCXXXXXX',
  mileage: '32,400',
  health: 91
}];

export function VehicleManagement() {
  const columns = [
  {
    key: 'vehicle',
    header: 'Vehicle',
    render: (_: any, row: any) =>
    <div>
          <div className="font-medium text-slate-900">
            {row.year} {row.make} {row.model}
          </div>
          <div className="text-xs text-slate-500 font-mono">{row.vin}</div>
        </div>

  },
  {
    key: 'owner',
    header: 'Owner'
  },
  {
    key: 'mileage',
    header: 'Mileage',
    render: (val: string) => `${val} mi`
  },
  {
    key: 'health',
    header: 'Health Score',
    render: (value: number) =>
    <Badge
      variant={value >= 90 ? 'accent' : value >= 80 ? 'primary' : 'warning'}>

          {value}%
        </Badge>

  },
  {
    key: 'actions',
    header: '',
    render: () =>
    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <MoreVerticalIcon className="w-5 h-5" />
        </button>

  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Platform Vehicles
          </h1>
          <p className="text-slate-500 mt-1">
            Global view of all tracked vehicles across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900 text-white border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">
            Most Popular Make
          </h3>
          <div className="text-3xl font-bold font-heading">Toyota</div>
          <p className="text-sm text-slate-500 mt-2">15% of all vehicles</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Average Mileage
          </h3>
          <div className="text-3xl font-bold text-slate-900 font-heading">
            64,200
          </div>
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            Across all vehicles
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Avg Health Score
          </h3>
          <div className="text-3xl font-bold text-slate-900 font-heading">
            88%
          </div>
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            Platform average
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by VIN, Make, Model, or Owner..."
            icon={<SearchIcon className="w-4 h-4" />} />

        </div>
        <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
          Filters
        </Button>
      </div>

      <DataTable columns={columns} data={vehicles} />
    </div>);

}