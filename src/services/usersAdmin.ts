import { getInsforgeClient } from '../lib/insforgeClient';
import type { AccountRole, UUID } from '../domain/models';

export interface AdminUserAccountMembership {
  accountId: UUID;
  accountName: string;
  role: AccountRole;
}

export interface AdminUserListItem {
  id: UUID;
  email: string;
  fullName: string | null;
  createdAt: string;
  defaultAccountName: string | null;
  memberships: AdminUserAccountMembership[];
}

export interface AdminUserListFilters {
  search?: string;
  role?: AccountRole | 'all';
  planCode?: string | 'all';
}

export interface AdminUserListResult {
  users: AdminUserListItem[];
}

export async function fetchAdminUsers(
  filters: AdminUserListFilters = {},
): Promise<AdminUserListResult> {
  const client = getInsforgeClient();

  try {
    const search = (filters.search ?? '').trim();

    // Load users + profiles
    const { data: usersData, error: usersError } = await client.database
      .from('auth_users_view')
      .select('id, email, full_name, created_at, default_account_name');

    if (usersError || !usersData) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin users; backend view auth_users_view unavailable.', usersError);
      return { users: [] };
    }

    const rawUsers = usersData as any[];

    // Apply simple in-memory search filter for MVP
    const filteredUsers =
      search.length > 0
        ? rawUsers.filter((u) => {
            const haystack = `${u.email ?? ''} ${u.full_name ?? ''}`.toLowerCase();
            return haystack.includes(search.toLowerCase());
          })
        : rawUsers;

    // Load memberships joined with accounts for all users we have
    const userIds = filteredUsers.map((u) => u.id);
    let membershipsByUserId = new Map<string, AdminUserAccountMembership[]>();

    if (userIds.length > 0) {
      const { data: membershipsData, error: membershipsError } = await client.database
        .from('admin_account_memberships_view')
        .select('user_id, account_id, account_name, role')
        .in('user_id', userIds);

      if (!membershipsError && membershipsData) {
        for (const row of membershipsData as any[]) {
          const existing = membershipsByUserId.get(row.user_id) ?? [];
          existing.push({
            accountId: row.account_id,
            accountName: row.account_name,
            role: row.role,
          } as AdminUserAccountMembership);
          membershipsByUserId.set(row.user_id, existing);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'Failed to load account memberships from admin_account_memberships_view.',
          membershipsError,
        );
      }
    }

    const users: AdminUserListItem[] = filteredUsers.map((u) => {
      const memberships = membershipsByUserId.get(u.id) ?? [];

      return {
        id: u.id,
        email: u.email,
        fullName: u.full_name ?? null,
        createdAt: u.created_at,
        defaultAccountName: u.default_account_name ?? null,
        memberships,
      };
    });

    return { users };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin users service failed.', err);
    return { users: [] };
  }
}

