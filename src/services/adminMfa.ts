/**
 * Admin MFA service - TOTP enrollment and verification.
 * Requires InsForge/Supabase auth with MFA support.
 */
import { getInsforgeClient } from '../lib/insforgeClient';

const ADMIN_MFA_VERIFIED_KEY = 'admin_mfa_verified';

export interface MfaFactor {
  id: string;
  friendlyName: string;
  factorType: string;
  status: string;
}

export function isAdminMfaVerifiedThisSession(): boolean {
  try {
    const val = sessionStorage.getItem(ADMIN_MFA_VERIFIED_KEY);
    if (!val) return false;
    const ts = Number(val);
    if (Number.isNaN(ts)) return false;
    // Consider verified for 12 hours
    return Date.now() - ts < 12 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function setAdminMfaVerified(): void {
  try {
    sessionStorage.setItem(ADMIN_MFA_VERIFIED_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function clearAdminMfaVerified(): void {
  try {
    sessionStorage.removeItem(ADMIN_MFA_VERIFIED_KEY);
  } catch {
    // ignore
  }
}

/** Returns true if the auth provider supports MFA (enroll, list, challenge, verify). */
export function isMfaSupported(): boolean {
  try {
    const client = getInsforgeClient();
    const auth = (client.auth as { mfa?: { enroll?: unknown; listFactors?: unknown } }).mfa;
    return Boolean(auth?.enroll && auth?.listFactors);
  } catch {
    return false;
  }
}

export async function listMfaFactors(): Promise<MfaFactor[]> {
  const client = getInsforgeClient();
  const auth = (client.auth as { mfa?: { listFactors?: () => Promise<{ data?: { totp?: MfaFactor[] }; error?: unknown }> } }).mfa;
  if (!auth?.listFactors) {
    return [];
  }
  const { data, error } = await auth.listFactors();
  if (error) return [];
  const totp = (data as { totp?: MfaFactor[] } | undefined)?.totp ?? [];
  return Array.isArray(totp) ? totp : [];
}

export interface EnrollMfaResult {
  id: string;
  type: string;
  totp?: { qr_code?: string; secret?: string; uri?: string };
  friendly_name?: string;
}

export async function enrollMfaFactor(
  friendlyName: string,
): Promise<EnrollMfaResult | null> {
  const client = getInsforgeClient();
  const auth = (client.auth as { mfa?: { enroll?: (opts: { factorType: string; friendlyName: string }) => Promise<{ data?: EnrollMfaResult; error?: unknown }> } }).mfa;
  if (!auth?.enroll) {
    throw new Error('MFA enrollment is not supported by the auth provider.');
  }
  const { data, error } = await auth.enroll({
    factorType: 'totp',
    friendlyName,
  });
  if (error) throw error as Error;
  return data ?? null;
}

export async function challengeMfaFactor(factorId: string): Promise<string | null> {
  const client = getInsforgeClient();
  const auth = (client.auth as { mfa?: { challenge?: (opts: { factorId: string }) => Promise<{ data?: { id: string }; error?: unknown }> } }).mfa;
  if (!auth?.challenge) {
    throw new Error('MFA challenge is not supported.');
  }
  const { data, error } = await auth.challenge({ factorId });
  if (error) throw error as Error;
  return data?.id ?? null;
}

export async function verifyMfaFactor(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<boolean> {
  const client = getInsforgeClient();
  const auth = (client.auth as { mfa?: { verify?: (opts: { factorId: string; challengeId: string; code: string }) => Promise<{ error?: unknown }> } }).mfa;
  if (!auth?.verify) {
    throw new Error('MFA verification is not supported.');
  }
  const { error } = await auth.verify({ factorId, challengeId, code });
  return !error;
}
