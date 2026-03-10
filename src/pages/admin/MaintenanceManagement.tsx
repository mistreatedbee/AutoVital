import React from 'react';
import { SearchIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
const logs = [
{
  id: 1,
  date: 'Oct 12, 2023',
  user: 'Alex Thompson',
  vehicle: 'Tesla Model 3',
  type: 'Tire Rotation',
  cost: '$60.00',
  workshop: 'Tesla Service Center'
},
{
  id: 2,
  date: 'Oct 10, 2023',
  user: 'Sarah Jenkins',
  vehicle: 'Honda Civic',
  type: 'Oil Change',
  cost: '$85.00',
  workshop: 'Jiffy Lube'
},
{
  id: 3,
  date: 'Oct 08, 2023',
  user: 'Michael Chen',
  vehicle: 'Ford F-150',
  type: 'Brake Pad Replacement',
  cost: '$320.00',
  workshop: 'Ford Dealership'
},
{
  id: 4,
  date: 'Oct 05, 2023',
  user: 'Jessica Davis',
  vehicle: 'Toyota Camry',
  type: 'Battery Replacement',
  cost: '$150.00',
  workshop: 'AutoZone'
},
{
  id: 5,
  date: 'Oct 01, 2023',
  user: 'David Wilson',
  vehicle: 'BMW 3 Series',
  type: 'Scheduled Maintenance',
  cost: '$450.00',
  workshop: 'BMW Service'
}];

export function MaintenanceManagement() {
  const columns = [
  {
    key: 'date',
    header: 'Date'
  },
  {
    key: 'user',
    header: 'User'
  },
  {
    key: 'vehicle',
    header: 'Vehicle'
  },
  {
    key: 'type',
    header: 'Service Type',
    render: (value: string) =>
    <Badge variant="neutral" className="bg-slate-100 text-slate-700">
          {value}
        </Badge>

  },
  {
    key: 'cost',
    header: 'Cost',
    render: (val: string) => <span className="font-medium">{val}</span>
  },
  {
    key: 'workshop',
    header: 'Workshop'
  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Global Maintenance Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Audit and review all service records across the platform.
          </p>
        </div>
        <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />}>
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search logs by user, vehicle, or service type..."
            icon={<SearchIcon className="w-4 h-4" />} />

        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm">
            <option>All Service Types</option>
            <option>Oil Change</option>
            <option>Tire Rotation</option>
            <option>Brake Service</option>
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={logs} />
    </div>);

}