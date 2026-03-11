import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  XIcon,
  CarIcon,
  FileTextIcon,
  BellIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  fetchAdminVehicles,
  fetchAdminVehicleDetail,
  type AdminVehicleRow,
  type AdminVehicleDetail,
} from '../../services/adminOperations';
import { Link } from 'react-router-dom';

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<AdminVehicleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [detailVehicle, setDetailVehicle] = useState<AdminVehicleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    () =>
      Array.from(
        new Map(vehicles.map((v) => [v.accountId, { id: v.accountId, name: v.accountName }])).values(),
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vehicles.filter((v) => {
      if (
        accountFilter !== 'all' &&
        v.accountId !== accountFilter
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

      const haystack = `${v.accountName} ${v.make} ${v.model} ${v.year ?? ''} ${v.vin ?? ''} ${v.licensePlate ?? ''} ${v.ownerEmail ?? ''}`.toLowerCase();
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

  const openDetail = useCallback(async (row: AdminVehicleRow) => {
    setDetailLoading(true);
    setDetailVehicle(null);
    try {
      const detail = await fetchAdminVehicleDetail(row.id);
      setDetailVehicle(detail ?? null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'vehicle',
        header: 'Vehicle',
        render: (_: unknown, row: AdminVehicleRow) => (
          <button
            type="button"
            className="text-left hover:underline focus:outline-none focus:underline"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(row);
            }}
          >
            <div className="font-medium text-slate-900">
              {row.year ?? '—'} {row.make} {row.model}
            </div>
            {row.vin && (
              <div className="text-xs text-slate-500 font-mono">{row.vin}</div>
            )}
          </button>
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
        key: 'ownerEmail',
        header: 'Owner',
        render: (value: string | null) => (
          <span className="text-sm text-slate-600">{value ?? '—'}</span>
        ),
      },
      {
        key: 'licensePlate',
        header: 'Registration',
        render: (value: string | null) => (
          <span className="text-sm text-slate-700 font-mono">{value ?? '—'}</span>
        ),
      },
      {
        key: 'mileage',
        header: 'Mileage',
        render: (value: string | null) =>
          value ? `${value}` : <span className="text-xs text-slate-400">—</span>,
      },
      {
        key: 'lastServiceDate',
        header: 'Last Service',
        render: (value: string | null) => {
          const date = value ? new Date(value) : null;
          return (
            <span className="text-sm text-slate-600">
              {date ? date.toLocaleDateString() : '—'}
            </span>
          );
        },
      },
      {
        key: 'nextServiceDue',
        header: 'Next Service',
        render: (value: string | null) => {
          const date = value ? new Date(value) : null;
          const isOverdue = date && date < new Date();
          return (
            <span
              className={`text-sm ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}
            >
              {date ? date.toLocaleDateString() : '—'}
            </span>
          );
        },
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
        key: 'documentCount',
        header: 'Docs',
        render: (value: number) => (
          <span className="text-sm text-slate-600">{value}</span>
        ),
      },
      {
        key: 'pendingAlertCount',
        header: 'Alerts',
        render: (value: number) => (
          <Badge variant={value > 0 ? 'warning' : 'neutral'} className="text-xs">
            {value}
          </Badge>
        ),
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
        render: (_: unknown, row: AdminVehicleRow) => (
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(row);
            }}
            aria-label="View details"
          >
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
        ),
      },
    ],
    [openDetail],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Platform Vehicles
          </h1>
          <p className="text-slate-500 mt-1">
            Global view of all tracked vehicles with user linkage, service, and alerts.
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
            placeholder="Search by VIN, Account, Make, Model, Registration, Owner..."
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
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
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

      {/* Vehicle Detail Modal */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-xl">Loading...</div>
        </div>
      )}
      {detailVehicle && !detailLoading && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setDetailVehicle(null)}
          aria-hidden
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="vehicle-detail-title"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2
                id="vehicle-detail-title"
                className="text-xl font-bold text-slate-900"
              >
                {detailVehicle.year} {detailVehicle.make} {detailVehicle.model}
              </h2>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                onClick={() => setDetailVehicle(null)}
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">VIN</p>
                  <p className="font-mono text-sm">{detailVehicle.vin ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Registration</p>
                  <p className="font-mono text-sm">{detailVehicle.licensePlate ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Mileage</p>
                  <p className="text-sm">{detailVehicle.mileage ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Health Score</p>
                  <Badge
                    variant={
                      (detailVehicle.healthScore ?? 0) >= 90
                        ? 'accent'
                        : (detailVehicle.healthScore ?? 0) >= 80
                          ? 'primary'
                          : 'warning'
                    }
                  >
                    {detailVehicle.healthScore ?? 'N/A'}%
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Last Service</p>
                  <p className="text-sm">
                    {detailVehicle.lastServiceDate
                      ? new Date(detailVehicle.lastServiceDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Next Service Due</p>
                  <p className="text-sm">
                    {detailVehicle.nextServiceDue
                      ? new Date(detailVehicle.nextServiceDue).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Account & Owner</p>
                <p className="text-sm">{detailVehicle.accountName}</p>
                <p className="text-sm text-slate-600">{detailVehicle.ownerEmail ?? '—'}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{detailVehicle.documentCount} documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <BellIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{detailVehicle.pendingAlertCount} pending alerts</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Link to={`/dashboard/vehicles/${detailVehicle.id}`}>
                  <Button variant="primary" icon={<CarIcon className="w-4 h-4" />}>
                    View in Dashboard
                  </Button>
                </Link>
                <Link to={`/admin/maintenance?vehicleId=${detailVehicle.id}`}>
                  <Button variant="secondary" icon={<FileTextIcon className="w-4 h-4" />}>
                    Maintenance
                  </Button>
                </Link>
                <Link to={`/admin/documents?vehicleId=${detailVehicle.id}`}>
                  <Button variant="secondary" icon={<FileTextIcon className="w-4 h-4" />}>
                    Documents
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
