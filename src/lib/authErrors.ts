export type AuthErrorInput = unknown;

function toMessage(err: AuthErrorInput): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message ?? '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  return (
    anyErr?.message ??
    anyErr?.error_description ??
    anyErr?.error ??
    String(anyErr)
  );
}

/**
 * Maps low-level auth errors from InsForge/Supabase or network failures
 * to user-friendly, consistent messages for all auth flows.
 */
export function mapAuthErrorToMessage(
  err: AuthErrorInput,
  fallback: string,
): string {
  const raw = toMessage(err);
  if (!raw) return fallback;

  const msg = raw.toLowerCase();

  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'The email or password you entered is incorrect.';
  }

  if (msg.includes('email not confirmed') || msg.includes('email not verified')) {
    return 'Please verify your email before signing in. Check your inbox for a verification link.';
  }

  if (
    msg.includes('user already registered') ||
    msg.includes('already exists') ||
    msg.includes('duplicate key')
  ) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (
    msg.includes('token expired') ||
    msg.includes('expired token') ||
    msg.includes('invalid or expired') ||
    msg.includes('reset link is invalid')
  ) {
    return 'This link or code has expired. Please request a new email.';
  }

  if (
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('rate-limited')
  ) {
    return 'You’ve tried this too many times. Please wait a moment and try again.';
  }

  if (
    msg.includes('network error') ||
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('connection') ||
    msg.includes('timeout')
  ) {
    return 'We could not reach the server. Check your connection and try again.';
  }

  if (msg.includes('password')) {
    return 'There was a problem with your password. Please check it and try again.';
  }

  // Fallback to the raw message if it is reasonably user-friendly; otherwise use generic.
  if (raw.length > 0 && raw.length <= 140) {
    return raw;
  }

  return fallback;
}

