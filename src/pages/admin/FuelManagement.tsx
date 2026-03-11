import React, { useEffect, useMemo, useState } from 'react';
import { DropletIcon, FilterIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import {
  fetchAdminFuelLogs,
  type AdminFuelRow,
} from '../../services/adminOperations';

export function FuelManagement() {
  const [rows, setRows] = useState<AdminFuelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchAdminFuelLogs({
          page,
          pageSize: 20,
          accountId: accountFilter !== 'all' ? accountFilter : undefined,
        });
        if (!cancelled) {
          setRows(result.items);
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
    () => Array.from(new Set(rows.map((r) => r.accountName))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (
        accountFilter !== 'all' &&
        row.accountName.toLowerCase() !== accountFilter.toLowerCase()
      ) {
        return false;
      }

      if (!term) return true;

      const haystack = `${row.accountName} ${row.vehicleName}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, accountFilter]);

  const totalSpentLabel = useMemo(() => {
    const amounts = filteredRows
      .map((r) =>
        r.totalCost ? Number(r.totalCost.replace(/[^0-9.]/g, '')) : null,
      )
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (!amounts.length) return '$0.00';
    const total = amounts.reduce((sum, n) => sum + n, 0);
    return `$${total.toFixed(2)}`;
  }, [filteredRows]);

  const avgPriceLabel = useMemo(() => {
    const prices = filteredRows
      .map((r) =>
        r.pricePerUnit
          ? Number(r.pricePerUnit.replace(/[^0-9.]/g, ''))
          : null,
      )
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (!prices.length) return '$0.00';
    const avg = prices.reduce((sum, n) => sum + n, 0) / prices.length;
    return `$${avg.toFixed(2)}`;
  }, [filteredRows]);

  const columns = useMemo(
    () => [
      {
        key: 'fillDate',
        header: 'Date',
      },
      {
        key: 'accountName',
        header: 'Account',
      },
      {
        key: 'vehicleName',
        header: 'Vehicle',
      },
      {
        key: 'volume',
        header: 'Volume',
      },
      {
        key: 'totalCost',
        header: 'Total Cost',
      },
      {
        key: 'pricePerUnit',
        header: 'Price / Unit',
      },
      {
        key: 'odometer',
        header: 'Odometer',
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Fuel Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Cross-account view of fuel spend and usage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
            <DropletIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Fill-ups (filtered)
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {filteredRows.length}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Total Spend (approx.)
          </p>
          <p className="text-2xl font-bold text-slate-900">{totalSpentLabel}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Avg Price / Unit
          </p>
          <p className="text-2xl font-bold text-slate-900">{avgPriceLabel}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by account or vehicle..."
            icon={<FilterIcon className="w-4 h-4" />}
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
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading fuel data...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No fuel records match the current filters.
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredRows} />
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

