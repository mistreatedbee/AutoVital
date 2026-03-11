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
  /** Whether the user's email has been verified. Defaults true when unknown. */
  emailVerified?: boolean;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  marketingConsent?: boolean;
}

export interface SignUpResult {
  requireEmailVerification?: boolean;
  user?: AuthUser;
}

export interface VerifyEmailParams {
  email?: string;
  otp: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  /** Verify current password for reauth before high-risk changes. Throws on failure. */
  reauthWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (params: SignUpParams) => Promise<SignUpResult>;
  verifyEmail: (params: VerifyEmailParams) => Promise<AuthUser>;
  resendVerificationEmail: (params: { email: string }) => Promise<void>;
  sendResetPasswordEmail: (params: { email: string }) => Promise<void>;
  resetPassword: (params: { newPassword: string; otp: string }) => Promise<void>;
  exchangeResetPasswordToken: (params: {
    email: string;
    code: string;
  }) => Promise<{ token: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUserFromApi(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  profile?: { name?: string | null };
  email_confirmed_at?: string | null;
  emailVerified?: boolean;
  email_verified?: boolean;
}): AuthUser {
  const name = user.profile?.name ?? user.name ?? null;
  const emailVerified =
    user.email_confirmed_at != null && user.email_confirmed_at !== ''
      ? true
      : user.emailVerified ?? user.email_verified ?? true;
  return {
    id: user.id,
    email: user.email ?? '',
    name: name ?? null,
    emailVerified,
  };
}

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
          setUser(mapUserFromApi(data.session.user as any));
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

  const reauthWithPassword = useCallback(async (email: string, password: string) => {
    const client = getInsforgeClient();
    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      throw signInError;
    }
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

      setUser(mapUserFromApi(data.user as any));
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

  const signUp = useCallback(async (params: SignUpParams): Promise<SignUpResult> => {
    setError(null);
    try {
      const client = getInsforgeClient();
      const { data, error: signUpError } = await client.auth.signUp({
        email: params.email,
        password: params.password,
        name: params.name,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.requireEmailVerification) {
        return { requireEmailVerification: true };
      }

      if (data?.user && data?.accessToken) {
        setUser(mapUserFromApi(data.user as any));
        return { user: mapUserFromApi(data.user as any) };
      }

      return {};
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to sign up. Please try again.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Sign-up failed', err);
      throw err;
    }
  }, []);

  const verifyEmail = useCallback(async (params: VerifyEmailParams): Promise<AuthUser> => {
    setError(null);
    setLoading(true);
    try {
      const client = getInsforgeClient();
      const verifyParams: { email?: string; otp: string } = { otp: params.otp };
      if (params.email) verifyParams.email = params.email;

      const { data, error: verifyError } = await client.auth.verifyEmail(verifyParams);

      if (verifyError || !data?.user) {
        throw verifyError ?? new Error('Unable to verify email.');
      }

      const mappedUser = mapUserFromApi(data.user as any);
      setUser(mappedUser);
      return mappedUser;
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to verify email. Please try again.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Verify email failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (params: { email: string }): Promise<void> => {
    setError(null);
    try {
      const client = getInsforgeClient();
      const { error: resendError } = await client.auth.resendVerificationEmail({
        email: params.email,
      });

      if (resendError) {
        throw resendError;
      }
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to resend verification email.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Resend verification failed', err);
      throw err;
    }
  }, []);

  const sendResetPasswordEmail = useCallback(async (params: { email: string }): Promise<void> => {
    setError(null);
    try {
      const client = getInsforgeClient();
      const { error: sendError } = await client.auth.sendResetPasswordEmail({
        email: params.email,
      });

      if (sendError) {
        throw sendError;
      }
    } catch (err: any) {
      const message: string = err?.message ?? 'Failed to send reset email.';
      setError(message);
      // eslint-disable-next-line no-console
      console.error('Send reset password email failed', err);
      throw err;
    }
  }, []);

  const exchangeResetPasswordToken = useCallback(
    async (params: { email: string; code: string }): Promise<{ token: string }> => {
      setError(null);
      try {
        const client = getInsforgeClient();
        const { data, error: exchangeError } = await client.auth.exchangeResetPasswordToken({
          email: params.email,
          code: params.code,
        });

        if (exchangeError || !data?.token) {
          throw exchangeError ?? new Error('Invalid or expired code.');
        }

        return { token: data.token };
      } catch (err: any) {
        const message: string = err?.message ?? 'Invalid or expired code.';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('Exchange reset token failed', err);
        throw err;
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (params: { newPassword: string; otp: string }): Promise<void> => {
      setError(null);
      try {
        const client = getInsforgeClient();
        const { error: resetError } = await client.auth.resetPassword({
          newPassword: params.newPassword,
          otp: params.otp,
        });

        if (resetError) {
          throw resetError;
        }
      } catch (err: any) {
        const message: string = err?.message ?? 'Failed to reset password.';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('Reset password failed', err);
        throw err;
      }
    },
    []
  );

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signInWithPassword,
    reauthWithPassword,
    signOut,
    signUp,
    verifyEmail,
    resendVerificationEmail,
    sendResetPasswordEmail,
    resetPassword,
    exchangeResetPasswordToken,
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

