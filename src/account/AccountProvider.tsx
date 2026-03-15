import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getInsforgeClient } from '../lib/insforgeClient';
import { ensureAccountForUser } from '../lib/authBootstrap';
import { useAuth } from '../auth/AuthProvider';

interface AccountContextValue {
  accountId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);
const ACCOUNT_RESOLVE_TIMEOUT_MS = 12_000;

async function resolveDefaultAccountId(userId: string): Promise<string | null> {
  const client = getInsforgeClient();

  const resolve = async (): Promise<string | null> => {
    // 1) Try profile.default_account_id
    const { data: profile, error: profileError } = await client.database
      .from('profiles')
      .select('default_account_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profileError && profile?.default_account_id) {
      return profile.default_account_id as string;
    }

    // 2) Try accounts where user is owner
    const { data: ownedAccounts } = await client.database
      .from('accounts')
      .select('id')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (ownedAccounts && ownedAccounts.length > 0) {
      return ownedAccounts[0].id as string;
    }

    // 3) Fallback to first membership
    const { data: memberships } = await client.database
      .from('account_members')
      .select('account_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (memberships && memberships.length > 0) {
      return memberships[0].account_id as string;
    }

    return null;
  };

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Account loading took too long. Please check your connection and try again.'));
    }, ACCOUNT_RESOLVE_TIMEOUT_MS);
  });

  return Promise.race([resolve(), timeout]);
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
      let id = await resolveDefaultAccountId(user.id);
      if (!id) {
        await ensureAccountForUser(user.id, user.name ?? user.email ?? 'User');
        id = await resolveDefaultAccountId(user.id);
      }
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

