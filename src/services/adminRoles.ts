import { getInsforgeClient } from '../lib/insforgeClient';
import type { AccountRole } from '../domain/models';

export interface AdminRoleRow {
  id: string;
  accountId: string;
  accountName: string;
  userId: string;
  role: AccountRole;
  createdAt: string;
}

export async function fetchAdminRoles(filters?: {
  accountId?: string;
  userId?: string;
  role?: AccountRole | 'all';
}): Promise<AdminRoleRow[]> {
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('account_members')
      .select('id, account_id, user_id, role, created_at, accounts(name)')
      .order('created_at', { ascending: false });

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin roles.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      accountId: row.account_id,
      accountName: row.accounts?.name ?? 'Account',
      userId: row.user_id,
      role: row.role as AccountRole,
      createdAt: row.created_at,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin roles service failed.', err);
    return [];
  }
}
