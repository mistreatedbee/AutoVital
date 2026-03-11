import React, { useEffect, useState } from 'react';
import { PlusIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import {
  fetchAccountMaintenanceLogs,
  type MaintenanceEntry,
} from '../../services/maintenance';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';

export function MaintenanceLog() {
  const { accountId, loading: accountLoading } = useAccount();
  const [logs, setLogs] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let isMounted = true;

    fetchAccountMaintenanceLogs(accountId)
      .then((data) => {
        if (isMounted) {
          setLogs(data);
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
  }, [accountId]);

  const columns = [
  {
    key: 'date',
    header: 'Date'
  },
  {
    key: 'vehicle',
    header: 'Vehicle',
    render: (val: string) =>
    <span className="font-medium text-slate-900">{val}</span>

  },
  {
    key: 'service',
    header: 'Service Type'
  },
  {
    key: 'mileage',
    header: 'Mileage'
  },
  {
    key: 'cost',
    header: 'Cost'
  },
  {
    key: 'shop',
    header: 'Workshop'
  },
  {
    key: 'status',
    header: 'Status',
    render: (val: string) => <Badge variant="neutral">{val}</Badge>
  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Maintenance Log
          </h1>
          <p className="text-slate-500 mt-1">
            Complete history of all services across your vehicles.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<DownloadIcon className="w-4 h-4" />}>

            Export
          </Button>
          <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />}>
            Log Service
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
              <option>All Vehicles</option>
              <option>Tesla Model 3</option>
              <option>Honda Civic</option>
              <option>Ford F-150</option>
            </select>
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
              <option>All Time</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<FilterIcon className="w-4 h-4" />}>

            More Filters
          </Button>
        </div>
        {accountLoading || loading ? (
          <LoadingState label="Loading maintenance history..." className="py-10" />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            className="border-none rounded-none" />
        )}

      </Card>
    </div>);

}