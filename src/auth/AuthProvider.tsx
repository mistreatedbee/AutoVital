import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getInsforgeClient } from '../lib/insforgeClient';

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      try {
        const client = getInsforgeClient();
        const { data, error: sessionError } = await client.auth.getCurrentSession();

        if (!isMounted) return;

        if (sessionError) {
          // eslint-disable-next-line no-console
          console.error('Failed to get current session', sessionError);
          setUser(null);
        } else if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.name ?? null,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.warn('InsForge client is not configured or session fetch failed.', err);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const client = getInsforgeClient();
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data?.user) {
        throw signInError ?? new Error('Unable to sign in.');
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
      });
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to sign in. Please try again.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Sign-in failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const client = getInsforgeClient();
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setUser(null);
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to sign out.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Sign-out failed', err);
      throw err;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signInWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

