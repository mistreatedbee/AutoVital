import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon, ShieldIcon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  fetchAdminRoles,
  type AdminRoleRow,
} from '../../services/adminRoles';
import type { AccountRole } from '../../domain/models';

export function RolesManagement() {
  const [rows, setRows] = useState<AdminRoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AccountRole | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchAdminRoles({
          role: roleFilter === 'all' ? undefined : roleFilter,
        });
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
  }, [roleFilter]);

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

      const haystack = `${row.accountName} ${row.userId}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, accountFilter]);

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
        key: 'userId',
        header: 'User ID',
        render: (value: string) => (
          <span className="font-mono text-xs text-slate-500 truncate max-w-[180px] block">
            {value}
          </span>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: (value: AccountRole) => {
          const variant =
            value === 'owner'
              ? 'primary'
              : value === 'admin'
                ? 'accent'
                : 'neutral';
          return <Badge variant={variant}>{value}</Badge>;
        },
      },
      {
        key: 'createdAt',
        header: 'Added',
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString() : '—',
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 mt-1">
            Overview of who has which role on which account.
          </p>
        </div>
        <Button variant="secondary" icon={<ShieldIcon className="w-4 h-4" />}>
          Role docs
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by account or user ID..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as AccountRole | 'all')}
          >
            <option value="all">All roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <p className="text-sm text-slate-600">
          This view shows account membership roles. Admin access to /admin/* is
          controlled by VITE_ADMIN_EMAILS (platform-level). Per-account role
          edits can be added in a future phase when backend policies support it.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading roles...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No membership records match the current filters.
          </div>
        ) : (
          <DataTable columns={columns} data={filteredRows} />
        )}
      </div>
    </div>
  );
}
