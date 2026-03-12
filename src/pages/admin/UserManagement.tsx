import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  UserIcon,
  ShieldIcon,
  DownloadIcon,
  MailIcon,
  BanIcon,
  FlagIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import type { AccountRole } from '../../domain/models';
import {
  fetchAdminUsers,
  adminResendVerification,
  adminSetAccountStatus,
  adminSetFlagged,
  adminUpdateProfile,
  fetchProfileForUser,
  type AdminUserListItem,
  type AccountStatus,
} from '../../services/usersAdmin';
import { useAuth } from '../../auth/AuthProvider';
import { auditUserStatusUpdated, auditUserFlagged, auditUserProfileUpdated } from '../../lib/auditEvents';
import { fetchAdminPlans } from '../../services/adminPlans';

type RoleFilterValue = AccountRole | 'all';

function exportUsersToCsv(users: AdminUserListItem[]): void {
  const headers = [
    'Email',
    'Full Name',
    'Created',
    'Verified',
    'Marketing',
    'Onboarding',
    'Vehicles',
    'Plan',
    'Status',
  ];
  const rows = users.map((u) => [
    u.email,
    u.fullName ?? '',
    u.createdAt,
    u.emailVerified ? 'Yes' : 'No',
    u.marketingConsent ? 'Yes' : 'No',
    u.onboardingCompleted ? 'Yes' : 'No',
    String(u.vehicleCount),
    u.planCode ?? '',
    u.accountStatus,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function UserManagement() {
  const { user } = useAuth();
  const actor = { userId: user?.id ?? null, email: user?.email ?? null };
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | boolean>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<'all' | boolean>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [noVehicleFilter, setNoVehicleFilter] = useState(false);
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [plans, setPlans] = useState<{ code: string }[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [flagModalUser, setFlagModalUser] = useState<AdminUserListItem | null>(null);
  const [editModalUser, setEditModalUser] = useState<AdminUserListItem | null>(null);

  useEffect(() => {
    fetchAdminPlans().then((p) => setPlans(p));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchAdminUsers({
          search,
          role: roleFilter === 'all' ? undefined : roleFilter,
          planCode: planFilter === 'all' ? undefined : planFilter,
          verified: verifiedFilter === 'all' ? undefined : verifiedFilter,
          onboardingComplete: onboardingFilter === 'all' ? undefined : onboardingFilter,
          accountStatus: statusFilter === 'all' ? undefined : statusFilter,
          noVehicle: noVehicleFilter || undefined,
          flagged: flaggedFilter || undefined,
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
  }, [search, roleFilter, planFilter, verifiedFilter, onboardingFilter, statusFilter, noVehicleFilter, flaggedFilter]);

  const handleResendVerification = useCallback(
    async (user: AdminUserListItem) => {
      setActionLoading(user.id);
      setActionMenuOpen(null);
      try {
        await adminResendVerification(user.email);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Resend verification failed', err);
        alert((err as Error).message ?? 'Failed to resend');
      } finally {
        setActionLoading(null);
      }
    },
    [],
  );

  const handleSuspend = useCallback(
    async (user: AdminUserListItem) => {
      setActionLoading(user.id);
      setActionMenuOpen(null);
      const newStatus: AccountStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended';
      try {
        await adminSetAccountStatus(user.id, newStatus);
        await auditUserStatusUpdated(actor, user.id, { status: newStatus });
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, accountStatus: newStatus } : u)),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Set status failed', err);
        alert((err as Error).message ?? 'Failed to update status');
      } finally {
        setActionLoading(null);
      }
    },
    [],
  );

  const handleExport = useCallback(() => {
    exportUsersToCsv(users);
  }, [users]);

  const handleFlagClick = useCallback((user: AdminUserListItem) => {
    setActionMenuOpen(null);
    setFlagModalUser(user);
  }, []);

  const handleFlagSubmit = useCallback(
    async (flagged: boolean, reason?: string) => {
      if (!flagModalUser) return;
      setActionLoading(flagModalUser.id);
      try {
        await adminSetFlagged(flagModalUser.id, flagged, reason ?? null);
        await auditUserFlagged(actor, flagModalUser.id, { flagged, reason: reason ?? undefined });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === flagModalUser.id
              ? { ...u, flaggedAt: flagged ? new Date().toISOString() : null, flaggedReason: flagged ? reason ?? null : null }
              : u,
          ),
        );
        setFlagModalUser(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Flag update failed', err);
        alert((err as Error).message ?? 'Failed to update flag');
      } finally {
        setActionLoading(null);
      }
    },
    [flagModalUser],
  );

  const columns = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        render: (_: unknown, row: AdminUserListItem) => {
          const initials = row.fullName?.trim() || row.email?.trim() || '?';
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                {initials.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-900">{row.fullName || '—'}</div>
                <div className="text-xs text-slate-500">{row.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'verified',
        header: 'Verified',
        render: (_: unknown, row: AdminUserListItem) => (
          <Badge variant={row.emailVerified ? 'accent' : 'warning'}>
            {row.emailVerified ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      {
        key: 'marketing',
        header: 'Marketing',
        render: (_: unknown, row: AdminUserListItem) => (
          <span className="text-sm text-slate-600">{row.marketingConsent ? 'Yes' : 'No'}</span>
        ),
      },
      {
        key: 'onboarding',
        header: 'Onboarding',
        render: (_: unknown, row: AdminUserListItem) => (
          <Badge variant={row.onboardingCompleted ? 'accent' : 'neutral'}>
            {row.onboardingCompleted ? 'Done' : 'Pending'}
          </Badge>
        ),
      },
      {
        key: 'vehicles',
        header: 'Vehicles',
        render: (_: unknown, row: AdminUserListItem) => (
          <span className="text-sm text-slate-700">{row.vehicleCount}</span>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        render: (_: unknown, row: AdminUserListItem) => (
          <span className="text-sm text-slate-700">{row.planCode ?? '—'}</span>
        ),
      },
      {
        key: 'flagged',
        header: 'Flagged',
        render: (_: unknown, row: AdminUserListItem) =>
          row.flaggedAt ? (
            <Badge variant="warning" title={row.flaggedReason ?? undefined}>
              Yes
            </Badge>
          ) : (
            <span className="text-xs text-slate-400">No</span>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (_: unknown, row: AdminUserListItem) => (
          <Badge
            variant={
              row.accountStatus === 'active'
                ? 'accent'
                : row.accountStatus === 'suspended'
                  ? 'warning'
                  : 'neutral'
            }
          >
            {row.accountStatus}
          </Badge>
        ),
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
        render: (_: unknown, row: AdminUserListItem) => {
          const isOpen = actionMenuOpen === row.id;
          const isLoading = actionLoading === row.id;
          return (
            <div className="relative">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuOpen(isOpen ? null : row.id);
                }}
                disabled={isLoading}
                aria-haspopup="true"
                aria-expanded={isOpen}
              >
                <MoreVerticalIcon className="w-5 h-5" />
              </button>
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setActionMenuOpen(null)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 py-1 bg-white rounded-lg shadow-lg border border-slate-200 min-w-[180px]">
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => {
                        setActionMenuOpen(null);
                        setEditModalUser(row);
                      }}>
                      <UserIcon className="w-4 h-4" />
                      Edit user
                    </button>
                    {!row.emailVerified && (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        onClick={() => handleResendVerification(row)}
                      >
                        <MailIcon className="w-4 h-4" />
                        Resend verification
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => handleSuspend(row)}
                    >
                      <BanIcon className="w-4 h-4" />
                      {row.accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                    {row.flaggedAt ? (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        onClick={() => handleFlagSubmit(false)}
                      >
                        <FlagIcon className="w-4 h-4" />
                        Remove flag
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        onClick={() => handleFlagClick(row)}
                      >
                        <FlagIcon className="w-4 h-4" />
                        Flag
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [actionMenuOpen, actionLoading, handleResendVerification, handleSuspend, handleFlagClick, handleFlagSubmit],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 mt-1">
            Inspect platform users, verification, onboarding, and account status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<DownloadIcon className="w-4 h-4" />}
            onClick={handleExport}
            disabled={users.length === 0}
          >
            Export CSV
          </Button>
          <Button variant="secondary" icon={<UserIcon className="w-4 h-4" />}>
            View as user
          </Button>
          <Button variant="secondary" icon={<ShieldIcon className="w-4 h-4" />}>
            Role overview
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search users by name or email..."
              icon={<SearchIcon className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={String(verifiedFilter)}
            onChange={(e) =>
              setVerifiedFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')
            }
          >
            <option value="all">All verified</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={String(onboardingFilter)}
            onChange={(e) =>
              setOnboardingFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')
            }
          >
            <option value="all">All onboarding</option>
            <option value="true">Complete</option>
            <option value="false">Incomplete</option>
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All plans</option>
            {plans.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={noVehicleFilter}
              onChange={(e) => setNoVehicleFilter(e.target.checked)}
              className="rounded border-slate-300"
            />
            No vehicle
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={flaggedFilter}
              onChange={(e) => setFlaggedFilter(e.target.checked)}
              className="rounded border-slate-300"
            />
            Flagged
          </label>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
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

      {/* Flag modal */}
      {flagModalUser && (
        <FlagModal
          user={flagModalUser}
          onClose={() => setFlagModalUser(null)}
          onSubmit={handleFlagSubmit}
          loading={actionLoading === flagModalUser.id}
        />
      )}

      {/* Edit user modal */}
      {editModalUser && (
        <EditUserModal
          user={editModalUser}
          onClose={() => setEditModalUser(null)}
          onSaved={(updated) => {
            setUsers((prev) =>
              prev.map((u) => (u.id === editModalUser.id ? { ...u, fullName: updated.fullName } : u))
            );
            setEditModalUser(null);
          }}
          actor={actor}
        />
      )}
    </div>
  );
}

function FlagModal({
  user,
  onClose,
  onSubmit,
  loading,
}: {
  user: AdminUserListItem;
  onClose: () => void;
  onSubmit: (flagged: boolean, reason?: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-hidden
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="flag-modal-title"
      >
        <h2 id="flag-modal-title" className="text-lg font-bold text-slate-900 mb-2">
          Flag user: {user.email}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Add a reason for flagging (optional but recommended).
        </p>
        <textarea
          className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none h-24"
          placeholder="e.g. Suspicious signup pattern"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(true, reason.trim() || undefined)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Flag user'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
  actor,
}: {
  user: AdminUserListItem;
  onClose: () => void;
  onSaved: (updated: { fullName: string | null }) => void;
  actor: { userId: string | null; email: string | null };
}) {
  const [displayName, setDisplayName] = useState(user.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    fetchProfileForUser(user.id)
      .then((profile) => {
        if (!cancelled) {
          setDisplayName(profile.displayName ?? user.fullName ?? '');
          setPhoneNumber(profile.phoneNumber ?? '');
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, [user.id, user.fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminUpdateProfile(user.id, {
        displayName: displayName.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
      });
      await auditUserProfileUpdated(actor, user.id, { displayName: displayName.trim() || undefined });
      onSaved({ fullName: displayName.trim() || null });
    } catch (err) {
      setError((err as Error).message ?? 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="edit-user-modal-title">
        <h2 id="edit-user-modal-title" className="text-lg font-bold text-slate-900 mb-2">
          Edit user: {user.email}
        </h2>
        {profileLoading ? (
          <p className="text-sm text-slate-500 py-4">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sipho Mokoena"
            />
            <Input
              label="Phone number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+27 73 153 1188"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex gap-2 mt-4 justify-end">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading} loading={loading}>
                Save
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
