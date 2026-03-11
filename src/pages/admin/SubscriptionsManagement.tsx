import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  fetchAdminSubscriptions,
  type AdminSubscriptionRow,
} from '../../services/adminPlans';

export function SubscriptionsManagement() {
  const [rows, setRows] = useState<AdminSubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchAdminSubscriptions();
        if (!cancelled) {
          setRows(data);
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
  }, []);

  const plans = useMemo(
    () => Array.from(new Set(rows.map((r) => r.planCode))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) {
        return false;
      }
      if (planFilter !== 'all' && row.planCode !== planFilter) {
        return false;
      }
      if (!term) return true;

      const haystack = `${row.accountName} ${row.planName} ${row.planCode}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, statusFilter, planFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filteredRows) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  }, [filteredRows]);

  const columns = useMemo(
    () => [
      {
        key: 'accountName',
        header: 'Account',
        render: (value: string) => (
          <span className="font-medium text-slate-900">{value}</span>
        ),
      },
      {
        key: 'planName',
        header: 'Plan',
      },
      {
        key: 'status',
        header: 'Status',
        render: (value: string) => {
          const variant =
            value === 'active'
              ? 'accent'
              : value === 'trialing'
                ? 'primary'
                : value === 'past_due'
                  ? 'warning'
                  : 'neutral';
          return <Badge variant={variant}>{value}</Badge>;
        },
      },
      {
        key: 'currentPeriodEnd',
        header: 'Renews',
        render: (value: string | null, row: AdminSubscriptionRow) => {
          if (row.cancelAtPeriodEnd) {
            return (
              <span className="text-amber-600 text-sm">
                Ends {value ? new Date(value).toLocaleDateString() : '—'}
              </span>
            );
          }
          return value ? new Date(value).toLocaleDateString() : '—';
        },
      },
      {
        key: 'externalSubscriptionId',
        header: 'External ID',
        render: (value: string | null) =>
          value ? (
            <span className="font-mono text-xs text-slate-500 truncate max-w-[120px] block">
              {value}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
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
            Subscriptions
          </h1>
          <p className="text-slate-500 mt-1">
            View and manage all customer subscriptions across plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Total
          </p>
          <p className="text-2xl font-bold">{filteredRows.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Active
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {statusCounts['active'] ?? 0}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Trialing
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {statusCounts['trialing'] ?? 0}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Past Due
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {statusCounts['past_due'] ?? 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by account or plan..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All plans</option>
            {plans.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading subscriptions...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No subscriptions match the current filters.
          </div>
        ) : (
          <DataTable columns={columns} data={filteredRows} />
        )}
      </div>
    </div>
  );
}
