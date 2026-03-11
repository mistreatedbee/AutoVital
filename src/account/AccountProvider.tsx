import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getInsforgeClient } from '../lib/insforgeClient';
import { useAuth } from '../auth/AuthProvider';

// #region agent log
const _dbg = (msg: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7293/ingest/e3e34ecb-6f03-4ff2-80b8-7e6b2f049d58', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2511e9' },
    body: JSON.stringify({
      sessionId: '2511e9',
      location: 'AccountProvider.tsx',
      message: msg,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

interface AccountContextValue {
  accountId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

async function resolveDefaultAccountId(userId: string): Promise<string | null> {
  const client = getInsforgeClient();
  _dbg('resolveDefaultAccountId start', { hypothesisId: 'B', userId });

  // 1) Try profile.default_account_id
  const { data: profile, error: profileError } = await client.database
    .from('profiles')
    .select('default_account_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    _dbg('profiles query error', {
      hypothesisId: 'B',
      table: 'profiles',
      errorMsg: (profileError as any)?.message,
      errorCode: (profileError as any)?.code,
      errorStatus: (profileError as any)?.status,
    });
  }
  if (!profileError && profile?.default_account_id) {
    return profile.default_account_id as string;
  }

  // 2) Try accounts where user is owner
  const { data: ownedAccounts, error: accountsError } = await client.database
    .from('accounts')
    .select('id')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (accountsError) {
    _dbg('accounts query error', {
      hypothesisId: 'B',
      table: 'accounts',
      errorMsg: (accountsError as any)?.message,
      errorCode: (accountsError as any)?.code,
      errorStatus: (accountsError as any)?.status,
    });
  }
  if (ownedAccounts && ownedAccounts.length > 0) {
    return ownedAccounts[0].id as string;
  }

  // 3) Fallback to first membership
  const { data: memberships, error: membersError } = await client.database
    .from('account_members')
    .select('account_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (membersError) {
    _dbg('account_members query error', {
      hypothesisId: 'B',
      table: 'account_members',
      errorMsg: (membersError as any)?.message,
      errorCode: (membersError as any)?.code,
      errorStatus: (membersError as any)?.status,
    });
  }
  if (memberships && memberships.length > 0) {
    return memberships[0].account_id as string;
  }

  return null;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    if (!user) {
      setAccountId(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const id = await resolveDefaultAccountId(user.id);
      setAccountId(id);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to resolve default account', err);
      setError(err?.message ?? 'Unable to load account');
      setAccountId(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      void loadAccount();
    }
  }, [authLoading, loadAccount]);

  const value: AccountContextValue = {
    accountId,
    loading: authLoading || loading,
    error,
    refresh: loadAccount,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return ctx;
}

