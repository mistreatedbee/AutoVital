import { getInsforgeClient } from '../lib/insforgeClient';

/**
 * Change password for the current user. Requires prior reauth.
 * Uses InsForge edge function 'change-password' - deploy this function
 * to support in-session password changes.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.functions.invoke('change-password', {
    method: 'POST',
    body: { currentPassword, newPassword } as Record<string, unknown>,
  });
  if (error) {
    throw new Error(
      (error as { message?: string })?.message ?? 'Failed to change password'
    );
  }
}

/**
 * Change email for the current user. Requires prior reauth and email verification.
 * Uses InsForge edge function 'change-email' - deploy this function
 * to support in-session email changes.
 */
export async function changeEmail(
  currentPassword: string,
  newEmail: string
): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.functions.invoke('change-email', {
    method: 'POST',
    body: { currentPassword, newEmail } as Record<string, unknown>,
  });
  if (error) {
    throw new Error(
      (error as { message?: string })?.message ?? 'Failed to change email'
    );
  }
}
