import { getInsforgeClient } from '../lib/insforgeClient';

export type PlatformAdminRole = 'system_admin' | 'company_admin';

export interface PlatformAdminStatus {
  isSystemAdmin: boolean;
  isCompanyAdmin: boolean;
  companyAccountIds: string[];
}

/**
 * Fetches the current user's platform admin status from platform_admins.
 * Used by AdminRoute to grant /admin/* access to System Admins and Company Admins.
 */
export async function fetchCurrentUserPlatformAdminStatus(
  userId: string,
): Promise<PlatformAdminStatus> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('platform_admins')
      .select('role, account_id')
      .eq('user_id', userId);

    if (error || !data) {
      return { isSystemAdmin: false, isCompanyAdmin: false, companyAccountIds: [] };
    }

    let isSystemAdmin = false;
    const companyAccountIds: string[] = [];

    for (const row of data as { role: string; account_id: string | null }[]) {
      if (row.role === 'system_admin') {
        isSystemAdmin = true;
      }
      if (row.role === 'company_admin' && row.account_id) {
        companyAccountIds.push(row.account_id);
      }
    }

    return {
      isSystemAdmin,
      isCompanyAdmin: companyAccountIds.length > 0,
      companyAccountIds,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load platform admin status.', err);
    return { isSystemAdmin: false, isCompanyAdmin: false, companyAccountIds: [] };
  }
}
