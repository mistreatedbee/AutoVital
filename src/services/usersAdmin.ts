import { getInsforgeClient } from '../lib/insforgeClient';
import type { AccountRole, UUID } from '../domain/models';

export interface AdminUserAccountMembership {
  accountId: UUID;
  accountName: string;
  role: AccountRole;
}

export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface AdminUserListItem {
  id: UUID;
  email: string;
  fullName: string | null;
  createdAt: string;
  defaultAccountName: string | null;
  memberships: AdminUserAccountMembership[];
  emailVerified: boolean;
  marketingConsent: boolean;
  onboardingCompleted: boolean;
  vehicleCount: number;
  planCode: string | null;
  accountStatus: AccountStatus;
  flaggedAt: string | null;
  flaggedReason: string | null;
}

export interface AdminUserListFilters {
  search?: string;
  role?: AccountRole | 'all';
  planCode?: string | 'all';
  verified?: boolean;
  onboardingComplete?: boolean;
  accountStatus?: AccountStatus | 'all';
  noVehicle?: boolean;
  flagged?: boolean;
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

    // Load users + profiles with Phase E columns
    const { data: usersData, error: usersError } = await client.database
      .from('auth_users_view')
      .select(
        'id, email, full_name, created_at, default_account_name, email_confirmed_at, marketing_consent, onboarding_completed, vehicle_count, plan_code, account_status, flagged_at, flagged_reason',
      );

    if (usersError || !usersData) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin users; backend view auth_users_view unavailable.', usersError);
      return { users: [] };
    }

    let rawUsers = usersData as any[];

    // Apply search filter
    if (search.length > 0) {
      rawUsers = rawUsers.filter((u) => {
        const haystack = `${u.email ?? ''} ${u.full_name ?? ''}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      });
    }

    // Apply Phase E filters
    if (filters.verified === true) {
      rawUsers = rawUsers.filter((u) => u.email_confirmed_at != null);
    } else if (filters.verified === false) {
      rawUsers = rawUsers.filter((u) => u.email_confirmed_at == null);
    }
    if (filters.onboardingComplete === true) {
      rawUsers = rawUsers.filter((u) => u.onboarding_completed === true);
    } else if (filters.onboardingComplete === false) {
      rawUsers = rawUsers.filter((u) => u.onboarding_completed !== true);
    }
    if (filters.accountStatus && filters.accountStatus !== 'all') {
      rawUsers = rawUsers.filter((u) => (u.account_status ?? 'active') === filters.accountStatus);
    }
    if (filters.noVehicle === true) {
      rawUsers = rawUsers.filter((u) => (u.vehicle_count ?? 0) === 0);
    }
    if (filters.flagged === true) {
      rawUsers = rawUsers.filter((u) => u.flagged_at != null);
    }
    if (filters.planCode && filters.planCode !== 'all') {
      rawUsers = rawUsers.filter((u) => (u.plan_code ?? null) === filters.planCode);
    }

    const filteredUsers = rawUsers;

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
      const accountStatus = (u.account_status ?? 'active') as AccountStatus;

      return {
        id: u.id,
        email: u.email,
        fullName: u.full_name ?? null,
        createdAt: u.created_at,
        defaultAccountName: u.default_account_name ?? null,
        memberships,
        emailVerified: u.email_confirmed_at != null,
        marketingConsent: Boolean(u.marketing_consent),
        onboardingCompleted: Boolean(u.onboarding_completed),
        vehicleCount: Number(u.vehicle_count ?? 0),
        planCode: u.plan_code ?? null,
        accountStatus:
          accountStatus === 'active' || accountStatus === 'suspended' || accountStatus === 'pending'
            ? accountStatus
            : 'active',
        flaggedAt: u.flagged_at ?? null,
        flaggedReason: u.flagged_reason ?? null,
      };
    });

    return { users };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin users service failed.', err);
    return { users: [] };
  }
}

/**
 * Resend verification email for a user (admin workflow)
 */
export async function adminResendVerification(email: string): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.auth.resendVerificationEmail({ email });
  if (error) {
    throw new Error(error.message ?? 'Failed to resend verification email');
  }
}

/**
 * Set account status for a user (admin workflow)
 */
export async function adminSetAccountStatus(
  userId: string,
  status: AccountStatus,
): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.database.rpc('admin_set_account_status', {
    p_user_id: userId,
    p_status: status,
  });
  if (error) {
    throw new Error(error.message ?? 'Failed to set account status');
  }
}

/**
 * Update user profile (display_name, phone_number) - admin only
 */
export async function adminUpdateProfile(
  userId: string,
  input: { displayName?: string | null; phoneNumber?: string | null },
): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.database.rpc('admin_update_profile', {
    p_user_id: userId,
    p_display_name: input.displayName ?? null,
    p_phone_number: input.phoneNumber ?? null,
  });
  if (error) {
    throw new Error(error.message ?? 'Failed to update profile');
  }
}

/**
 * Fetch profile for a user (for admin edit form)
 */
export async function fetchProfileForUser(userId: string): Promise<{
  displayName: string | null;
  phoneNumber: string | null;
}> {
  const client = getInsforgeClient();
  const { data, error } = await client.database
    .from('profiles')
    .select('display_name, phone_number')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return { displayName: null, phoneNumber: null };
  }

  return {
    displayName: (data as any).display_name ?? null,
    phoneNumber: (data as any).phone_number ?? null,
  };
}

/**
 * Flag or unflag a user (admin workflow)
 */
export async function adminSetFlagged(
  userId: string,
  flagged: boolean,
  reason?: string | null,
): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.database.rpc('admin_set_flagged', {
    p_user_id: userId,
    p_flagged: flagged,
    p_reason: reason ?? null,
  });
  if (error) {
    throw new Error(error.message ?? 'Failed to update flag status');
  }
}

