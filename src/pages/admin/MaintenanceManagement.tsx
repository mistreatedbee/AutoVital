import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import {
  fetchAdminMaintenanceLogs,
  type AdminMaintenanceRow,
} from '../../services/adminOperations';

export function MaintenanceManagement() {
  const [logs, setLogs] = useState<AdminMaintenanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchAdminMaintenanceLogs({
          page,
          pageSize: 20,
          accountId: accountFilter !== 'all' ? accountFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
        });
        if (!cancelled) {
          setLogs(result.items);
          setHasMore(result.hasMore);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, accountFilter, typeFilter]);

  const accounts = useMemo(
    () => Array.from(new Set(logs.map((l) => l.accountName))).sort(),
    [logs],
  );

  const serviceTypes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.serviceType))).sort(),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return logs.filter((log) => {
      if (
        accountFilter !== 'all' &&
        log.accountName.toLowerCase() !== accountFilter.toLowerCase()
      ) {
        return false;
      }
      if (typeFilter !== 'all' && log.serviceType !== typeFilter) {
        return false;
      }
      if (!term) return true;

      const haystack = `${log.accountName} ${log.vehicleName} ${
        log.serviceType
      } ${log.vendorName ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [logs, search, accountFilter, typeFilter]);

  const totalSpendLabel = useMemo(() => {
    const amounts = filteredLogs
      .map((l) =>
        l.cost ? Number(l.cost.replace(/[^0-9.]/g, '')) : null,
      )
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (!amounts.length) return '$0.00';
    const total = amounts.reduce((sum, n) => sum + n, 0);
    return `$${total.toFixed(2)}`;
  }, [filteredLogs]);

  const avgTicketLabel = useMemo(() => {
    const amounts = filteredLogs
      .map((l) =>
        l.cost ? Number(l.cost.replace(/[^0-9.]/g, '')) : null,
      )
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (!amounts.length) return '$0.00';
    const avg = amounts.reduce((sum, n) => sum + n, 0) / amounts.length;
    return `$${avg.toFixed(2)}`;
  }, [filteredLogs]);

  const columns = useMemo(
    () => [
      {
        key: 'serviceDate',
        header: 'Date',
      },
      {
        key: 'accountName',
        header: 'Account',
      },
      {
        key: 'vehicleName',
        header: 'Vehicle',
        render: (val: string) => (
          <span className="font-medium text-slate-900">{val}</span>
        ),
      },
      {
        key: 'serviceType',
        header: 'Service Type',
        render: (value: string) => (
          <Badge variant="neutral" className="bg-slate-100 text-slate-700">
            {value}
          </Badge>
        ),
      },
      {
        key: 'mileage',
        header: 'Mileage',
      },
      {
        key: 'cost',
        header: 'Cost',
        render: (val: string | null) =>
          val ? <span className="font-medium">{val}</span> : '—',
      },
      {
        key: 'vendorName',
        header: 'Workshop',
      },
    ],
    [],
  );

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
            placeholder="Search logs by account, vehicle, workshop, or type..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Accounts</option>
            {accounts.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Service Types</option>
            {serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900 text-white">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Total Jobs (filtered)
          </h3>
          <p className="text-3xl font-bold font-heading">{filteredLogs.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Total Spend (approx.)
          </h3>
          <p className="text-2xl font-bold text-slate-900">{totalSpendLabel}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Avg Ticket Value
          </h3>
          <p className="text-2xl font-bold text-slate-900">{avgTicketLabel}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading maintenance logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No maintenance records match the current filters.
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredLogs} />
            {(page > 1 || hasMore) && (
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between text-sm text-slate-600">
                <span>Page {page}</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

