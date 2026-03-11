import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon, MoreVerticalIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  fetchAdminVehicles,
  type AdminVehicleRow,
} from '../../services/adminOperations';

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<AdminVehicleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchAdminVehicles({
          page,
          pageSize: 20,
          accountId: accountFilter !== 'all' ? accountFilter : undefined,
        });
        if (!cancelled) {
          setVehicles(result.items);
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
  }, [page, accountFilter]);

  const accounts = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.accountName))).sort(),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vehicles.filter((v) => {
      if (
        accountFilter !== 'all' &&
        v.accountName.toLowerCase() !== accountFilter.toLowerCase()
      ) {
        return false;
      }

      if (healthFilter === 'healthy' && (v.healthScore ?? 0) < 90) {
        return false;
      }
      if (
        healthFilter === 'warning' &&
        ((v.healthScore ?? 100) < 80 || (v.healthScore ?? 100) >= 90)
      ) {
        return false;
      }
      if (healthFilter === 'at-risk' && (v.healthScore ?? 100) >= 80) {
        return false;
      }

      if (!term) return true;

      const haystack = `${v.accountName} ${v.make} ${v.model} ${v.year ?? ''} ${
        v.vin ?? ''
      }`.toLowerCase();
      return haystack.includes(term);
    });
  }, [vehicles, search, accountFilter, healthFilter]);

  const avgMileage = useMemo(() => {
    const numeric = filteredVehicles
      .map((v) => (v.mileage ? Number(v.mileage.replace(/,/g, '')) : null))
      .filter((v): v is number => v != null);
    if (!numeric.length) return '—';
    const avg = numeric.reduce((sum, n) => sum + n, 0) / numeric.length;
    return avg.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }, [filteredVehicles]);

  const avgHealth = useMemo(() => {
    const numeric = filteredVehicles
      .map((v) => (v.healthScore != null ? v.healthScore : null))
      .filter((v): v is number => v != null);
    if (!numeric.length) return '—';
    const avg = numeric.reduce((sum, n) => sum + n, 0) / numeric.length;
    return `${avg.toFixed(0)}%`;
  }, [filteredVehicles]);

  const totalCount = filteredVehicles.length;

  const showPagination = vehicles.length > 0 && (page > 1 || hasMore);

  const columns = useMemo(
    () => [
      {
        key: 'vehicle',
        header: 'Vehicle',
        render: (_: unknown, row: AdminVehicleRow) => (
          <div>
            <div className="font-medium text-slate-900">
              {row.year ?? '—'} {row.make} {row.model}
            </div>
            {row.vin && (
              <div className="text-xs text-slate-500 font-mono">{row.vin}</div>
            )}
          </div>
        ),
      },
      {
        key: 'accountName',
        header: 'Account',
        render: (value: string) => (
          <span className="text-sm text-slate-700">{value}</span>
        ),
      },
      {
        key: 'mileage',
        header: 'Mileage',
        render: (value: string | null) =>
          value ? `${value} mi` : <span className="text-xs text-slate-400">—</span>,
      },
      {
        key: 'healthScore',
        header: 'Health',
        render: (value: number | null) => {
          if (value == null) {
            return <span className="text-xs text-slate-400">N/A</span>;
          }
          const variant =
            value >= 90 ? 'accent' : value >= 80 ? 'primary' : 'warning';
          return <Badge variant={variant}>{value}%</Badge>;
        },
      },
      {
        key: 'createdAt',
        header: 'Added',
        render: (value: string) => {
          const date = value ? new Date(value) : null;
          return (
            <span className="text-sm text-slate-600">
              {date ? date.toLocaleDateString() : '—'}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        render: () => (
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Platform Vehicles
          </h1>
          <p className="text-slate-500 mt-1">
            Global view of all tracked vehicles across all customer accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900 text-white border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">
            Total Vehicles (filtered)
          </h3>
          <div className="text-3xl font-bold font-heading">{totalCount}</div>
          <p className="text-sm text-slate-500 mt-2">Across matching accounts</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Average Mileage
          </h3>
          <div className="text-3xl font-bold text-slate-900 font-heading">
            {avgMileage}
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
            {avgHealth}
          </div>
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            Platform average
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by VIN, Account, Make, or Model..."
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
            <option value="all">All accounts</option>
            {accounts.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
          >
            <option value="all">All health</option>
            <option value="healthy">90% and above</option>
            <option value="warning">80–89%</option>
            <option value="at-risk">Below 80%</option>
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading vehicles...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No vehicles match the current filters.
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredVehicles} />
            {showPagination && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                <span>
                  Page {page} • Showing {filteredVehicles.length} vehicles
                </span>
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

