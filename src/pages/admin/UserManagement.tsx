import React, { useEffect, useMemo, useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  UserIcon,
  ShieldIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import type { AccountRole } from '../../domain/models';
import {
  fetchAdminUsers,
  type AdminUserListItem,
} from '../../services/usersAdmin';

type RoleFilterValue = AccountRole | 'all';

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>('all');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchAdminUsers({
          search,
          role: roleFilter === 'all' ? undefined : roleFilter,
        });
        if (!cancelled) {
          setUsers(result.users);
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
  }, [search, roleFilter]);

  const columns = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        render: (_: unknown, row: AdminUserListItem) => {
          const initials =
            row.fullName?.trim() ||
            row.email?.trim() ||
            '?';

          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                {initials.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {row.fullName || '—'}
                </div>
                <div className="text-xs text-slate-500">{row.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'accounts',
        header: 'Accounts & Roles',
        render: (_: unknown, row: AdminUserListItem) => {
          if (!row.memberships.length) {
            return <span className="text-xs text-slate-400">No accounts</span>;
          }

          const primary = row.memberships[0];
          const extraCount = row.memberships.length - 1;

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" className="text-xs">
                  {primary.accountName}
                </Badge>
                <Badge
                  variant={
                    primary.role === 'owner'
                      ? 'primary'
                      : primary.role === 'admin'
                        ? 'accent'
                        : 'neutral'
                  }
                  className="text-[11px] uppercase tracking-wide"
                >
                  {primary.role}
                </Badge>
              </div>
              {extraCount > 0 && (
                <div className="text-[11px] text-slate-500">
                  +{extraCount} more account{extraCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'defaultAccountName',
        header: 'Default Account',
        render: (value: string | null) =>
          value ? (
            <span className="text-sm text-slate-700">{value}</span>
          ) : (
            <span className="text-xs text-slate-400">Not set</span>
          ),
      },
      {
        key: 'createdAt',
        header: 'Joined',
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
            User Management
          </h1>
          <p className="text-slate-500 mt-1">
            Inspect platform users, their accounts, and roles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<UserIcon className="w-4 h-4" />}
          >
            View as user
          </Button>
          <Button
            variant="secondary"
            icon={<ShieldIcon className="w-4 h-4" />}
          >
            Role overview
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users by name or email..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilterValue)}
          >
            <option value="all">All roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="member">Members</option>
            <option value="viewer">Viewers</option>
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No users found for the current filters.
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </div>
    </div>
  );
}

