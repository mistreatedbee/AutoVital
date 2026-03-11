import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, MoreVerticalIcon, FileTextIcon, FilterIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  fetchAdminDocuments,
  type AdminDocumentRow,
} from '../../services/adminOperations';

export function DocumentsManagement() {
  const [rows, setRows] = useState<AdminDocumentRow[]>([]);
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
        const result = await fetchAdminDocuments({
          page,
          pageSize: 20,
          accountId: accountFilter !== 'all' ? accountFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
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
  }, [page, accountFilter, typeFilter]);

  const accounts = useMemo(
    () => Array.from(new Set(rows.map((r) => r.accountName))).sort(),
    [rows],
  );

  const types = useMemo(
    () => Array.from(new Set(rows.map((r) => r.type))).sort(),
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
      if (typeFilter !== 'all' && row.type !== typeFilter) {
        return false;
      }
      if (!term) return true;

      const haystack = `${row.accountName} ${row.name} ${row.vehicleName}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, accountFilter, typeFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Documents Management
          </h1>
          <p className="text-slate-500 mt-1">
            Review and locate documents across all accounts and vehicles.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents by name, vehicle, or account..."
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
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FilterIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Documents (filtered)
          </p>
          <p className="text-2xl font-bold text-slate-900">{filteredRows.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Accounts with Docs
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {new Set(filteredRows.map((r) => r.accountName)).size}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Vehicles with Docs
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {new Set(filteredRows.map((r) => r.vehicleName)).size}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-sm">
            Loading documents...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-sm">
            No documents match the current filters.
          </div>
        ) : (
          <>
          {filteredRows.map((doc) => (
            <Card
              key={doc.id}
              hover
              className="p-5 flex flex-col cursor-pointer"
              onClick={() => {
                if (doc.url) {
                  window.open(doc.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (doc.url) {
                      window.open(doc.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <MoreVerticalIcon className="w-5 h-5" />
                </button>
              </div>
              <h4
                className="font-semibold text-slate-900 mb-1 truncate"
                title={doc.name}
              >
                {doc.name}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
                  {doc.type}
                </Badge>
                <span className="text-xs text-slate-400">{doc.size}</span>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{doc.accountName}</span>
                <span>{doc.vehicleName}</span>
              </div>
            </Card>
          ))}
          {(page > 1 || hasMore) && (
            <div className="col-span-full px-6 py-4 border-t border-slate-100 flex justify-between text-sm text-slate-600">
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

